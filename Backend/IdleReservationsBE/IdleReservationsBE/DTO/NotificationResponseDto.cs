namespace IdleReservationsBE.DTO
{
    public class NotificationResponseDto
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
    }

}
