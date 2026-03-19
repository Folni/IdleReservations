namespace IdleReservationsBE.Repositories
{
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;
    using Microsoft.EntityFrameworkCore;

    public class ReservationRepository : IReservationRepository
    {
        private readonly IdleReservationsDbContext _context;

        public ReservationRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Reservation> GetAll()
        {
            return _context.Reservations
                .Include(x => x.User)
                .Include(x => x.Restaurant)
                .Include(x => x.Table)
                .ToList();
        }

        public Reservation GetById(int id)
        {
            return _context.Reservations
                .Include(x => x.User)
                .Include(x => x.Restaurant)
                .Include(x => x.Table)
                .FirstOrDefault(x => x.ReservationId == id);
        }

        public IEnumerable<Reservation> GetByRestaurant(int restaurantId)
        {
            return _context.Reservations
                .Include(x => x.User)
                .Include(x => x.Restaurant)
                .Include(x => x.Table)
                .Where(x => x.RestaurantId == restaurantId)
                .ToList();
        }

        public IEnumerable<Reservation> GetByTable(int tableId)
        {
            return _context.Reservations
                .Include(x => x.User)
                .Include(x => x.Restaurant)
                .Include(x => x.Table)
                .Where(x => x.TableId == tableId)
                .ToList();
        }

        public void Create(Reservation reservation)
        {
            _context.Reservations.Add(reservation);
        }

        public void Update(Reservation reservation)
        {
            _context.Reservations.Update(reservation);
        }

        public void Delete(Reservation reservation)
        {
            _context.Reservations.Remove(reservation);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}