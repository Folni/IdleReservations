using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;

    [Route("api/promotions")]
    [ApiController]
    public class PromotionController : ControllerBase
    {
        private readonly IPromotionService _service;

        public PromotionController(IPromotionService service)
        {
            _service = service;
        }

        [HttpGet("restaurant/{restaurantId}")]
        public IActionResult GetByRestaurant(int restaurantId)
        {
            return Ok(_service.GetByRestaurant(restaurantId));
        }

        [HttpPost]
        public IActionResult Create(PromotionCreateDto dto)
        {
            _service.Create(dto);
            return Ok("Promotion created");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Promotion deleted");
        }
    }

}
