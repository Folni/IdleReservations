using IdleReservationsBE.Models;

namespace IdleReservationsBE.Interfaces
{
    public interface IUserRepository
    {
        User GetByUsername(string username);
        User GetById(int id);
        void Create(User user);
        void Update(User user);
        void Save();
        int GetLoyaltyPoints(int userId);
        int IncrementLoyaltyPoints(int userId, int amount = 10);
    }
}
