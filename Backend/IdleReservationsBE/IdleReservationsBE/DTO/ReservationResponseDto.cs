namespace IdleReservationsBE.DTO
{
public class ReservationResponseDto
{
    public int ReservationId { get; set; }

    public int UserId { get; set; }
    public string Username { get; set; }

    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; }

    public int TableId { get; set; }
    public int Seats { get; set; }

    public DateTime ReservationDateTime { get; set; }

    public int PartySize { get; set; }

    public string Status { get; set; }
}

}
