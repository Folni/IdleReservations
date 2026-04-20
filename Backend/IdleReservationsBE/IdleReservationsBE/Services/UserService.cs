namespace IdleReservationsBE.Services
{  
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;
    using IdleReservationsBE.Repositories;
    using LocalMarketAPI.Security;

    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly IConfiguration _config;
        private readonly ITokenRepository _token;

        public UserService(IUserRepository repo, IConfiguration config, ITokenRepository token)
        {
            _repo = repo;
            _config = config;
            _token = token;
        }

        public UserResponseDto Register(UserRegisterDto dto)
        {
            var existing = _repo.GetByUsername(dto.Username);
            if (existing != null)
                throw new Exception($"Username {dto.Username} already exists");

            var salt = PasswordHashProvider.GetSalt();
            var hash = PasswordHashProvider.GetHash(dto.Password, salt);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PasswordHash = hash,
                Salt = salt,
                RoleId = 2 // default User role
            };

            _repo.Create(user);
            _repo.Save();

            return new UserResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                RoleName = "User"
            };
        }

        public string Login(UserLoginDto dto)
        {
            var user = _repo.GetByUsername(dto.Username);
            if (user == null)
                throw new Exception("Incorrect username or password");

            var hash = PasswordHashProvider.GetHash(dto.Password, user.Salt);
            if (hash != user.PasswordHash)
                throw new Exception("Incorrect username or password");

            var key = _config["JWT:SecureKey"];

            return JwtTokenProvider.CreateToken(
                key,
                120,
                user.UserId,
                user.Username,
                user.Role.RoleName
            );
        }

        public void ChangePassword(UserChangePasswordDto dto)
        {
            var user = _repo.GetByUsername(dto.Username);
            if (user == null)
                throw new Exception($"User {dto.Username} not found");

            user.Salt = PasswordHashProvider.GetSalt();
            user.PasswordHash = PasswordHashProvider.GetHash(dto.NewPassword, user.Salt);

            _repo.Update(user);
            _repo.Save();
        }

        public void PromoteUser(UserPromoteDto dto)
        {
            var user = _repo.GetByUsername(dto.Username);
            if (user == null)
                throw new Exception($"User {dto.Username} not found");

            user.RoleId = 1; // Admin role

            _repo.Update(user);
            _repo.Save();
        }

        public void SaveFcmToken(int userId, string token)
        {
            var user = _repo.GetById(userId);
            if (user == null) throw new Exception("User not found");
            _token.Create(new FcmToken
            {
                UserId = userId,
                Token = token
            });
            _token.Save();

        }

        public void RemoveFcmToken(int userId)
        {
            var user = _repo.GetById(userId);
            if (user == null) throw new Exception("User not found");
            _token.Delete(userId);
            _token.Save();
        }

        public int GetLoyaltyPoints(int userId) => _repo.GetLoyaltyPoints(userId);

        public int IncrementLoyaltyPoints(int userId) => _repo.IncrementLoyaltyPoints(userId);

    }

}
