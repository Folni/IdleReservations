namespace IdleReservationsBE.Services
{

  
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepository _repo;
        private readonly IRestaurantRepository _restaurantRepo;

        public PromotionService(IPromotionRepository repo, IRestaurantRepository restaurantRepo)
        {
            _repo = repo;
            _restaurantRepo = restaurantRepo;
        }

        public IEnumerable<PromotionResponseDto> GetByRestaurant(int restaurantId)
        {
            return _repo.GetByRestaurant(restaurantId).Select(p => new PromotionResponseDto
            {
                PromotionId = p.PromotionId,
                RestaurantId = p.RestaurantId,
                Title = p.Title,
                DiscountPercent = p.DiscountPercent.GetValueOrDefault()
            });
        }

        public void Create(PromotionCreateDto dto)
        {
            var restaurant = _restaurantRepo.GetById(dto.RestaurantId);
            if (restaurant == null)
                throw new Exception("Restaurant does not exist");

            var promotion = new Promotion
            {
                RestaurantId = dto.RestaurantId,
                Title = dto.Title,
                DiscountPercent = dto.DiscountPercent
            };

            _repo.Create(promotion);
            _repo.Save();
        }

        public void Delete(int id)
        {
            var p = _repo.GetById(id);
            if (p == null)
                throw new Exception("Promotion not found");

            _repo.Delete(p);
            _repo.Save();
        }
    }


}
