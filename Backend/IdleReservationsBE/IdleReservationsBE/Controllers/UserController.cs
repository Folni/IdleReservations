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
            try
            {
                var result = _service.Register(dto);
                return Ok(result);
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto dto)
        {
            try
            {
                var token = _service.Login(dto);
                return Ok(token);
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] UserChangePasswordDto dto)
        {
            try
            {
                _service.ChangePassword(dto);
                return Ok("Password changed");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost("promote")]
        public IActionResult Promote([FromBody] UserPromoteDto dto)
        {
            try
            {
                _service.PromoteUser(dto);
                return Ok("User promoted");
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost("save-fcm-token")]
        public IActionResult SaveFcmToken([FromBody] SaveTokenDto dto)
        {
            try
            {
                _service.SaveFcmToken(dto.UserId, dto.Token);
                return Ok();
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpPost("remove-fcm-token")]
        public IActionResult RemoveFcmToken([FromBody] RemoveTokenDto dto)
        {
            try
            {
                _service.RemoveFcmToken(dto.UserId);
                return Ok();
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }

        [HttpGet("loyalty/{userId}")]
        public IActionResult GetLoyaltyPoints(int userId)
        {
            try
            {
                var points = _service.GetLoyaltyPoints(userId);
                return Ok(new { points });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("loyalty/increment/{userId}")]
        public IActionResult IncrementLoyaltyPoints(int userId)
        {
            try
            {
                var points = _service.IncrementLoyaltyPoints(userId);
                return Ok(new { points, message = $"Points incremented! New total: {points}" });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

    }
}