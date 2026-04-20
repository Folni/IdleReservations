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
            catch (Exception e )
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public IActionResult Create(ReservationCreateDto dto)
        {
            try
            {
                _service.Create(dto);
                return Ok("Reservation created");

            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ReservationCreateDto dto)
        {
            try
            {
                _service.Update(id, dto);
                return Ok("Reservation updated");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, ReservationStatusUpdateDto dto)
        {
            try
            {
                _service.UpdateStatus(id, dto.Status);
                return Ok("Reservation status updated");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPut("cancel/{id}")]
        public IActionResult Cancel(int id)
        {
            try
            {
                _service.Cancel(id);
                return Ok("Reservation cancelled");

            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }


        [HttpPut("Ping/{id}")]
        public IActionResult PingToken(int id)
        {
            try
            {
                _service.PingUser(id);
                return Ok();
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }



    }
}