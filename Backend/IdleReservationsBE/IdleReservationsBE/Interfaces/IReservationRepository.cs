namespace IdleReservationsBE.Interfaces
{
    
    using IdleReservationsBE.Models;

    public interface IReservationRepository
    {
        IEnumerable<Reservation> GetAll();
        Reservation GetById(int id);
        IEnumerable<Reservation> GetByRestaurant(int restaurantId);
        IEnumerable<Reservation> GetByTable(int tableId);
        void Create(Reservation reservation);
        void Update(Reservation reservation);
        void Delete(Reservation reservation);
        void Save();
    }

}
