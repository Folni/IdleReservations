using Microsoft.AspNetCore.Mvc;

namespace IdleReservationsBE.Controllers
{
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Services;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/auth")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterDto dto)
        {
            var result = _service.Register(dto);
            return Ok(result);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto dto)
        {
            var token = _service.Login(dto);
            return Ok(token);
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] UserChangePasswordDto dto)
        {
            _service.ChangePassword(dto);
            return Ok("Password changed");
        }

        [HttpPost("promote")]
        public IActionResult Promote([FromBody] UserPromoteDto dto)
        {
            _service.PromoteUser(dto);
            return Ok("User promoted");
        }
    }
}