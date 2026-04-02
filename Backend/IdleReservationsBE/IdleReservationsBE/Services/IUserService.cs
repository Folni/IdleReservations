namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface IUserService
    {
        UserResponseDto Register(UserRegisterDto dto);
        string Login(UserLoginDto dto);
        void ChangePassword(UserChangePasswordDto dto);
        void PromoteUser(UserPromoteDto dto);

        void SaveFcmToken(int userId, string token);
        void RemoveFcmToken(int userId);

    }

}
