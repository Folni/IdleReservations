namespace IdleReservationsBE.Repositories
{
    
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;
    using Microsoft.EntityFrameworkCore;

    public class UserRepository : IUserRepository
    {
        private readonly IdleReservationsDbContext _context;

        public UserRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public User GetByUsername(string username)
        {
            return _context.Users
                .Include(x => x.Role)
                .FirstOrDefault(x => x.Username == username);
        }

        public User GetById(int id)
        {
            return _context.Users
                .Include(x => x.Role)
                .FirstOrDefault(x => x.UserId == id);
        }

        public void Create(User user)
        {
            _context.Users.Add(user);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }

}
