namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface INotificationService
    {
        IEnumerable<NotificationResponseDto> GetByUser(int userId);
        void Create(NotificationCreateDto dto);
        void MarkAsRead(int id);
    }

}
