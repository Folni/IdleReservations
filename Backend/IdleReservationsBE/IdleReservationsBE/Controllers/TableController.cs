using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/tables")]
    [ApiController]
    public class TableController : ControllerBase
    {
        private readonly ITableService _service;

        public TableController(ITableService service)
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

        [HttpGet("restaurant/{restaurantId}")]
        public IActionResult GetByRestaurant(int restaurantId)
        {
            return Ok(_service.GetByRestaurant(restaurantId));
        }

        [HttpPost]
        public IActionResult Create(TableCreateDto dto)
        {
            _service.Create(dto);
            return Ok("Table created");
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, TableCreateDto dto)
        {
            _service.Update(id, dto);
            return Ok("Table updated");
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return Ok("Table deleted");
        }
    }

}
