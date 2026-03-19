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
            return Ok(_service.GetByUser(userId));
        }

        [HttpPost]
        public IActionResult Create([FromBody] NotificationCreateDto dto)
        {
            _service.Create(dto);
            return Ok("Notification created");
        }

        [HttpPut("read/{id}")]
        public IActionResult MarkAsRead(int id)
        {
            _service.MarkAsRead(id);
            return Ok("Notification marked as read");
        }
    }

}
