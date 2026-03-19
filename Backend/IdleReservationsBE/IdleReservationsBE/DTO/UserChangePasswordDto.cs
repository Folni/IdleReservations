namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class UserChangePasswordDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; }

        [Required(ErrorMessage = "New password is required")]
        [StringLength(256, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long")]
        public string NewPassword { get; set; }
    }

}
