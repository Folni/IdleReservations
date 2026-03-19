namespace IdleReservationsBE.Interfaces
{
   
    using IdleReservationsBE.Models;

    public interface INotificationRepository
    {
        IEnumerable<Notification> GetByUser(int userId);
        Notification GetById(int id);
        void Create(Notification notification);
        void Update(Notification notification);
        void Save();
    }

}
