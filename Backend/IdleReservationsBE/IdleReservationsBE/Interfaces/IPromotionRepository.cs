namespace IdleReservationsBE.Interfaces
{
  
    using IdleReservationsBE.Models;

    public interface IPromotionRepository
    {
        IEnumerable<Promotion> GetAll();
        Promotion GetById(int id);
        IEnumerable<Promotion> GetByRestaurant(int restaurantId);
        void Create(Promotion promotion);
        void Delete(Promotion promotion);
        void Save();
    }

}
