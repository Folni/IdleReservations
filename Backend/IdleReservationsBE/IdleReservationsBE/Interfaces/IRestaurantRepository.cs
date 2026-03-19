namespace IdleReservationsBE.Interfaces
{
    using IdleReservationsBE.Models;

    public interface IRestaurantRepository
    {
        IEnumerable<Restaurant> GetAll();
        Restaurant GetById(int id);
        void Create(Restaurant restaurant);
        void Update(Restaurant restaurant);
        void Delete(Restaurant restaurant);
        void Save();
    }

}
