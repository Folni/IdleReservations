namespace IdleReservationsBE.Repositories
{
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class RestaurantRepository : IRestaurantRepository
    {
        private readonly IdleReservationsDbContext _context;

        public RestaurantRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Restaurant> GetAll()
        {
            return _context.Restaurants.ToList();
        }

        public Restaurant GetById(int id)
        {
            return _context.Restaurants.FirstOrDefault(x => x.RestaurantId == id);
        }

        public void Create(Restaurant restaurant)
        {
            _context.Restaurants.Add(restaurant);
        }

        public void Update(Restaurant restaurant)
        {
            _context.Restaurants.Update(restaurant);
        }

        public void Delete(Restaurant restaurant)
        {
            _context.Restaurants.Remove(restaurant);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }

}
