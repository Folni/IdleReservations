using IdleReservationsBE.Interfaces;
using IdleReservationsBE.Models;

namespace IdleReservationsBE.Repositories
{
    public class TokenRepository : ITokenRepository
    {
        private readonly IdleReservationsDbContext _context;
        public TokenRepository(IdleReservationsDbContext dbContext)
        {
            _context = dbContext;
        }

        public void Create(FcmToken token)
        {
            FcmToken? tomken = _context.FcmTokens.Find(token.UserId);
            if (tomken is not null)
            {
                if (tomken.Token != token.Token)
                {
                    _context.FcmTokens.Remove(tomken);
                    Save();
                    _context.FcmTokens.Add(token);  
                }
            }
            else
            {
                _context.FcmTokens.Add(token);
            }
        }

        public void Delete(int userid)
        {
            _ = _context.FcmTokens.Remove(_context.FcmTokens.FirstOrDefault(x => x.UserId == userid));

        }

        public IEnumerable<FcmToken> GetAll()
        {
            return _context.FcmTokens.ToList();
        }

        public FcmToken GetById(int id)
        {
            return _context.FcmTokens.FirstOrDefault(x => x.FcmId == id);
        }

        public FcmToken GetByUser(int userId)
        {
            FcmToken? fcmToken = _context.FcmTokens.FirstOrDefault(x => x.UserId == userId);

            return fcmToken;
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        public void Update(FcmToken token)
        {
            FcmToken? tomken = _context.FcmTokens.Find(token.UserId);
            if (tomken != null)
            {
                _context.FcmTokens.Remove(tomken);
                _context.FcmTokens.Add(token);
            }
            else
            {
                _context.FcmTokens.Add(token);
            }
        }
    }
}
