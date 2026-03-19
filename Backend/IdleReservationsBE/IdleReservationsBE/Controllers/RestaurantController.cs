using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/restaurants")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _service;

        public RestaurantController(IRestaurantService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_service.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_service.GetById(id));
        }

        [HttpPost]
        public IActionResult Create(RestaurantCreateDto dto)
        {
            _service.Create(dto);
            return Ok("Restaurant created");
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, RestaurantCreateDto dto)
        {
            _service.Update(id, dto);
            return Ok("Restaurant updated");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Restaurant deleted");
        }
    }

}
