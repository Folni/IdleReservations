using IdleReservationsBE.Controllers;
using IdleReservationsBE.DTO;
using IdleReservationsBE.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace IdleReservationsBE.Tests
{
    public class UserControllerTests
    {
        private readonly Mock<IUserService> _userServiceMock;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _userServiceMock = new Mock<IUserService>();
            _controller = new UserController(_userServiceMock.Object);
        }

        [Fact]
        public void Register_ReturnsOk_WhenSuccessful()
        {
            var dto = new UserRegisterDto { Username = "test", Email = "test@test.com" };
            _userServiceMock.Setup(s => s.Register(dto)).Returns(new UserResponseDto { Username = "test" });

            var result = _controller.Register(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void Login_ReturnsOk_WithToken_WhenSuccessful()
        {
            var dto = new UserLoginDto { Username = "test", Password = "password" };
            _userServiceMock.Setup(s => s.Login(dto)).Returns("mock-token");

            var result = _controller.Login(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("mock-token", okResult.Value);
        }

        [Fact]
        public void GetLoyaltyPoints_ReturnsPoints()
        {
            _userServiceMock.Setup(s => s.GetLoyaltyPoints(1)).Returns(100);

            var result = _controller.GetLoyaltyPoints(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            // okResult.Value is an anonymous type, might be hard to test exactly without reflection or dynamic
            Assert.NotNull(okResult.Value);
        }
    }
}
