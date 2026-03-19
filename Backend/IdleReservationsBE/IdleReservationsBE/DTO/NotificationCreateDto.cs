namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class NotificationCreateDto
    {
        [Required(ErrorMessage = "UserId is required")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Message is required")]
        public string Message { get; set; }
    }

}
