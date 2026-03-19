namespace IdleReservationsBE.Repositories
{
    
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class TableRepository : ITableRepository
    {
        private readonly IdleReservationsDbContext _context;

        public TableRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Table> GetAll()
        {
            return _context.Tables.ToList();
        }

        public Table GetById(int id)
        {
            return _context.Tables.FirstOrDefault(x => x.TableId == id);
        }

        public IEnumerable<Table> GetByRestaurant(int restaurantId)
        {
            return _context.Tables
                .Where(x => x.RestaurantId == restaurantId)
                .ToList();
        }

        public void Create(Table table)
        {
            _context.Tables.Add(table);
        }

        public void Update(Table table)
        {
            _context.Tables.Update(table);
        }

        public void Delete(Table table)
        {
            _context.Tables.Remove(table);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }

}
