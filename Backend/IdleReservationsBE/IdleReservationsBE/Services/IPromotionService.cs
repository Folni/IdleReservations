namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface IPromotionService
    {
        IEnumerable<PromotionResponseDto> GetByRestaurant(int restaurantId);
        void Create(PromotionCreateDto dto);
        void Delete(int id);
    }

}
