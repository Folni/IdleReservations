namespace IdleReservationsBE.Repositories
{
   
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class NotificationRepository : INotificationRepository
    {
        private readonly IdleReservationsDbContext _context;

        public NotificationRepository(IdleReservationsDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Notification> GetByUser(int userId)
        {
            return _context.Notifications
                .Where(x => x.UserId == userId)
                .ToList();
        }

        public Notification GetById(int id)
        {
            return _context.Notifications
                .FirstOrDefault(x => x.NotificationId == id);
        }

        public void Create(Notification notification)
        {
            _context.Notifications.Add(notification);
        }

        public void Update(Notification notification)
        {
            _context.Notifications.Update(notification);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }

}
