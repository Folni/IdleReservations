using IdleReservationsBE.Controllers;
using IdleReservationsBE.DTO;
using IdleReservationsBE.Services;
using IdleReservationsBE.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace IdleReservationsBE.Tests
{
    public class PromotionControllerTests
    {
        private readonly Mock<IPromotionService> _serviceMock;
        private readonly PromotionController _controller;

        public PromotionControllerTests()
        {
            _serviceMock = new Mock<IPromotionService>();
            _controller = new PromotionController(_serviceMock.Object);
        }

        [Fact]
        public void GetByRestaurant_ReturnsOk()
        {
            _serviceMock.Setup(s => s.GetByRestaurant(1)).Returns(new List<Promotion>());
            var result = _controller.GetByRestaurant(1);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void Create_ReturnsOk()
        {
            var dto = new PromotionCreateDto { Title = "Promo" };
            var result = _controller.Create(dto);
            Assert.IsType<OkObjectResult>(result);
            _serviceMock.Verify(s => s.Create(dto), Times.Once);
        }
    }
}
