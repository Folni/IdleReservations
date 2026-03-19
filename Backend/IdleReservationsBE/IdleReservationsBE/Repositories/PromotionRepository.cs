namespace IdleReservationsBE.Repositories
{
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class PromotionRepository : IPromotionRepository
    {
        private readonly IdleReservationsDbContext _context;

        public PromotionRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Promotion> GetAll()
        {
            return _context.Promotions.ToList();
        }

        public Promotion GetById(int id)
        {
            return _context.Promotions.FirstOrDefault(x => x.PromotionId == id);
        }

        public IEnumerable<Promotion> GetByRestaurant(int restaurantId)
        {
            return _context.Promotions.Where(x => x.RestaurantId == restaurantId).ToList();
        }

        public void Create(Promotion promotion)
        {
            _context.Promotions.Add(promotion);
        }

        public void Delete(Promotion promotion)
        {
            _context.Promotions.Remove(promotion);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }

}
