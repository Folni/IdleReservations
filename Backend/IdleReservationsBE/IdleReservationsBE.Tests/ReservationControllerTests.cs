using IdleReservationsBE.Controllers;
using IdleReservationsBE.DTO;
using IdleReservationsBE.Services;
using IdleReservationsBE.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace IdleReservationsBE.Tests
{
    public class ReservationControllerTests
    {
        private readonly Mock<IReservationService> _serviceMock;
        private readonly ReservationController _controller;

        public ReservationControllerTests()
        {
            _serviceMock = new Mock<IReservationService>();
            _controller = new ReservationController(_serviceMock.Object);
        }

        [Fact]
        public void GetAll_ReturnsOk()
        {
            _serviceMock.Setup(s => s.GetAll()).Returns(new List<Reservation>());
            var result = _controller.GetAll();
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void Create_ReturnsOk()
        {
            var dto = new ReservationCreateDto { UserId = 1, TableId = 1 };
            var result = _controller.Create(dto);
            Assert.IsType<OkObjectResult>(result);
            _serviceMock.Verify(s => s.Create(dto), Times.Once);
        }

        [Fact]
        public void Cancel_ReturnsOk()
        {
            var result = _controller.Cancel(1);
            Assert.IsType<OkObjectResult>(result);
            _serviceMock.Verify(s => s.Cancel(1), Times.Once);
        }
    }
}
