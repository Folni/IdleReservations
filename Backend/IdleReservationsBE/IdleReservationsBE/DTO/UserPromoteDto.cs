namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class UserPromoteDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; }
    }

}
