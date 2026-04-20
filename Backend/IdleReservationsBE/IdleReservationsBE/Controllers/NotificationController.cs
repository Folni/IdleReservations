using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;

    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetByUser(int userId)
        {
            try
            {
                return Ok(_service.GetByUser(userId));
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] NotificationCreateDto dto)
        {
            try
            {
                _service.Create(dto);
                return Ok("Notification created");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPut("read/{id}")]
        public IActionResult MarkAsRead(int id)
        {
            try
            {
                _service.MarkAsRead(id);
                return Ok("Notification marked as read");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }
    }

}
