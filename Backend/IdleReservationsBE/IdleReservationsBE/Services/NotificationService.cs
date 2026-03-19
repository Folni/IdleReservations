namespace IdleReservationsBE.Services
{
    
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly IUserRepository _userRepo;

        public NotificationService(INotificationRepository repo, IUserRepository userRepo)
        {
            _repo = repo;
            _userRepo = userRepo;
        }

        public IEnumerable<NotificationResponseDto> GetByUser(int userId)
        {
            return _repo.GetByUser(userId).Select(n => new NotificationResponseDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead.GetValueOrDefault()
            });
        }

        public void Create(NotificationCreateDto dto)
        {
            var user = _userRepo.GetById(dto.UserId);
            if (user == null)
                throw new Exception("User does not exist");

            var notification = new Notification
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                IsRead = false
            };

            _repo.Create(notification);
            _repo.Save();
        }

        public void MarkAsRead(int id)
        {
            var n = _repo.GetById(id);
            if (n == null)
                throw new Exception("Notification not found");

            n.IsRead = true;

            _repo.Update(n);
            _repo.Save();
        }
    }

}
