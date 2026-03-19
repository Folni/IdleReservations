using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/reservations")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _service;

        public ReservationController(IReservationService service)
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
        public IActionResult Create(ReservationCreateDto dto)
        {
            _service.Create(dto);
            return Ok("Reservation created");
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ReservationCreateDto dto)
        {
            _service.Update(id, dto);
            return Ok("Reservation updated");
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, ReservationStatusUpdateDto dto)
        {
            _service.UpdateStatus(id, dto.Status);
            return Ok("Reservation status updated");
        }

        [HttpPut("cancel/{id}")]
        public IActionResult Cancel(int id)
        {
            _service.Cancel(id);
            return Ok("Reservation cancelled");
        }
    }
}