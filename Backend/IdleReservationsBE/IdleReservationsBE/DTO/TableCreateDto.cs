namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class TableCreateDto
    {
        [Required(ErrorMessage = "RestaurantId is required")]
        public int RestaurantId { get; set; }

        [Required(ErrorMessage = "Seats is required")]
        [Range(1, 20, ErrorMessage = "Seats must be between 1 and 20")]
        public int Seats { get; set; }
    }

}
