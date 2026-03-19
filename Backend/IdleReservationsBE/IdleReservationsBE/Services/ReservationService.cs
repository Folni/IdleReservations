namespace IdleReservationsBE.Services
{
  
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;
    

    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _repo;
        private readonly IRestaurantRepository _restaurantRepo;
        private readonly ITableRepository _tableRepo;
        private readonly IUserRepository _userRepo;

        public ReservationService(
            IReservationRepository repo,
            IRestaurantRepository restaurantRepo,
            ITableRepository tableRepo,
            IUserRepository userRepo)
        {
            _repo = repo;
            _restaurantRepo = restaurantRepo;
            _tableRepo = tableRepo;
            _userRepo = userRepo;
        }

        public IEnumerable<ReservationResponseDto> GetAll()
        {
            return _repo.GetAll().Select(r => new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                UserId = r.UserId,
                RestaurantId = r.RestaurantId,
                TableId = r.TableId,
                ReservationDateTime = r.ReservationDateTime,
                PartySize = r.PartySize,
                Status = r.Status
            });
        }

        public ReservationResponseDto GetById(int id)
        {
            var r = _repo.GetById(id);
            if (r == null)
                throw new Exception("Reservation not found");

            return new ReservationResponseDto
            {
                ReservationId = r.ReservationId,
                UserId = r.UserId,
                RestaurantId = r.RestaurantId,
                TableId = r.TableId,
                ReservationDateTime = r.ReservationDateTime,
                PartySize = r.PartySize,
                Status = r.Status
            };
        }

        public void Create(ReservationCreateDto dto)
        {
            // Check user
            var user = _userRepo.GetById(dto.UserId);
            if (user == null)
                throw new Exception("User does not exist");

            // Check restaurant
            var restaurant = _restaurantRepo.GetById(dto.RestaurantId);
            if (restaurant == null)
                throw new Exception("Restaurant does not exist");

            // Check table
            var table = _tableRepo.GetById(dto.TableId);
            if (table == null)
                throw new Exception("Table does not exist");

            if (table.RestaurantId != dto.RestaurantId)
                throw new Exception("Table does not belong to this restaurant");

            // Check if table is free at that time
            var reservations = _repo.GetByTable(dto.TableId);

            bool isTaken = reservations.Any(r =>
                r.ReservationDateTime == dto.ReservationDateTime &&
                r.Status == "Active"
            );

            if (isTaken)
                throw new Exception("Table is already reserved at that time");

            var reservation = new Reservation
            {
                UserId = dto.UserId,
                RestaurantId = dto.RestaurantId,
                TableId = dto.TableId,
                ReservationDateTime = dto.ReservationDateTime,
                PartySize = dto.PartySize,
                Status = "Active"
            };

            _repo.Create(reservation);
            _repo.Save();
        }

        public void Cancel(int id)
        {
            var r = _repo.GetById(id);
            if (r == null)
                throw new Exception("Reservation not found");

            r.Status = "Cancelled";

            _repo.Update(r);
            _repo.Save();
        }
    }

}
