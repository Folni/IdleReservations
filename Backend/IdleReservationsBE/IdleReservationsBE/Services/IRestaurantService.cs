namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface IRestaurantService
    {
        IEnumerable<RestaurantResponseDto> GetAll();
        RestaurantResponseDto GetById(int id);
        void Create(RestaurantCreateDto dto);
        void Update(int id, RestaurantCreateDto dto);
        void Delete(int id);
    }


}
