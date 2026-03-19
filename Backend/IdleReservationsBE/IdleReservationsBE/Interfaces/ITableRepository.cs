namespace IdleReservationsBE.Interfaces
{
    using IdleReservationsBE.Models;

    public interface ITableRepository
    {
        IEnumerable<Table> GetAll();
        Table GetById(int id);
        IEnumerable<Table> GetByRestaurant(int restaurantId);
        void Create(Table table);
        void Update(Table table);
        void Delete(Table table);
        void Save();
    }

}
