namespace IdleReservationsBE.DTO
{
    public class RestaurantResponseDto
    {
        public int RestaurantId { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string WorkingHours { get; set; }
    }
}