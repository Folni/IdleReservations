namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class RestaurantCreateDto
    {
        [Required(ErrorMessage = "Restaurant name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; }

        [Required(ErrorMessage = "City is required")]
        public string City { get; set; }
    }

}
