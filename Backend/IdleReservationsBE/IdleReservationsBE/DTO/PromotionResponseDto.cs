namespace IdleReservationsBE.DTO
{
    public class PromotionResponseDto
    {
        public int PromotionId { get; set; }
        public int RestaurantId { get; set; }
        public string Title { get; set; }
        public decimal DiscountPercent { get; set; }
    }

}
