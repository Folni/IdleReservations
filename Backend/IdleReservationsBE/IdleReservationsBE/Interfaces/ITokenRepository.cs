using IdleReservationsBE.Models;

namespace IdleReservationsBE.Interfaces
{
    public interface ITokenRepository
    {
        IEnumerable<FcmToken> GetAll();
        FcmToken GetByUser(int userId);
        FcmToken GetById(int id);
        void Create(FcmToken token);
        void Delete(int userid);
        void Update(FcmToken token);
        void Save();
    }
}
