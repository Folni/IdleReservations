using IdleReservationsBE.Controllers;
using IdleReservationsBE.DTO;
using IdleReservationsBE.Services;
using IdleReservationsBE.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace IdleReservationsBE.Tests
{
    public class RestaurantControllerTests
    {
        private readonly Mock<IRestaurantService> _serviceMock;
        private readonly RestaurantController _controller;

        public RestaurantControllerTests()
        {
            _serviceMock = new Mock<IRestaurantService>();
            _controller = new RestaurantController(_serviceMock.Object);
        }

        [Fact]
        public void GetAll_ReturnsOk()
        {
            _serviceMock.Setup(s => s.GetAll()).Returns(new List<Restaurant>());
            var result = _controller.GetAll();
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void GetById_ReturnsOk_WhenExists()
        {
            _serviceMock.Setup(s => s.GetById(1)).Returns(new Restaurant { Id = 1 });
            var result = _controller.GetById(1);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void Create_ReturnsOk()
        {
            var dto = new RestaurantCreateDto { Name = "Test" };
            var result = _controller.Create(dto);
            Assert.IsType<OkObjectResult>(result);
            _serviceMock.Verify(s => s.Create(dto), Times.Once);
        }
    }
}
