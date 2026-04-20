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
            try
            {
                return Ok(_service.GetByRestaurant(restaurantId));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public IActionResult Create(PromotionCreateDto dto)
        {
            try
            {
                _service.Create(dto);
                return Ok("Promotion created");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _service.Delete(id);
                return Ok("Promotion deleted");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }
    }

}
