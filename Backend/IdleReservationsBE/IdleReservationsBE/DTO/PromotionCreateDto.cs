namespace IdleReservationsBE.DTO
{
    using System.ComponentModel.DataAnnotations;

    public class PromotionCreateDto
    {
        [Required(ErrorMessage = "RestaurantId is required")]
        public int RestaurantId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 200 characters")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Discount percent is required")]
        [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
        public decimal DiscountPercent { get; set; }
    }

}
