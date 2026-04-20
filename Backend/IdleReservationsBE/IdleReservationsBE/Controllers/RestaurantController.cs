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
            try
            {
                return Ok(_service.GetAll());
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                return Ok(_service.GetById(id));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public IActionResult Create(RestaurantCreateDto dto)
        {
            try
            {
                _service.Create(dto);
                return Ok("Restaurant created");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, RestaurantCreateDto dto)
        {
            try
            {
                _service.Update(id, dto);
                return Ok("Restaurant updated");
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
                return Ok("Restaurant deleted");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }
    }

}
