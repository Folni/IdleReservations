namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class ReservationCreateDto
    {
        [Required(ErrorMessage = "UserId is required")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "RestaurantId is required")]
        public int RestaurantId { get; set; }

        [Required(ErrorMessage = "TableId is required")]
        public int TableId { get; set; }

        [Required(ErrorMessage = "Reservation date and time is required")]
        public DateTime ReservationDateTime { get; set; }

        [Required(ErrorMessage = "Party size is required")]
        [Range(1, 20, ErrorMessage = "Party size must be between 1 and 20")]
        public int PartySize { get; set; }
    }

}
