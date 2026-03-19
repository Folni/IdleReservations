namespace IdleReservationsBE.Services
{
   
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;

    public class TableService : ITableService
    {
        private readonly ITableRepository _repo;
        private readonly IRestaurantRepository _restaurantRepo;

        public TableService(ITableRepository repo, IRestaurantRepository restaurantRepo)
        {
            _repo = repo;
            _restaurantRepo = restaurantRepo;
        }

        public IEnumerable<TableResponseDto> GetAll()
        {
            return _repo.GetAll().Select(t => new TableResponseDto
            {
                TableId = t.TableId,
                RestaurantId = t.RestaurantId,
                Seats = t.Seats
            });
        }

        public TableResponseDto GetById(int id)
        {
            var t = _repo.GetById(id);
            if (t == null)
                throw new Exception("Table not found");

            return new TableResponseDto
            {
                TableId = t.TableId,
                RestaurantId = t.RestaurantId,
                Seats = t.Seats
            };
        }

        public IEnumerable<TableResponseDto> GetByRestaurant(int restaurantId)
        {
            return _repo.GetByRestaurant(restaurantId).Select(t => new TableResponseDto
            {
                TableId = t.TableId,
                RestaurantId = t.RestaurantId,
                Seats = t.Seats
            });
        }

        public void Create(TableCreateDto dto)
        {
            var restaurant = _restaurantRepo.GetById(dto.RestaurantId);
            if (restaurant == null)
                throw new Exception("Restaurant does not exist");

            var table = new Table
            {
                RestaurantId = dto.RestaurantId,
                Seats = dto.Seats
            };

            _repo.Create(table);
            _repo.Save();
        }

        public void Update(int id, TableCreateDto dto)
        {
            var t = _repo.GetById(id);
            if (t == null)
                throw new Exception("Table not found");

            t.RestaurantId = dto.RestaurantId;
            t.Seats = dto.Seats;

            _repo.Update(t);
            _repo.Save();
        }

        public void Delete(int id)
        {
            var t = _repo.GetById(id);
            if (t == null)
                throw new Exception("Table not found");

            _repo.Delete(t);
            _repo.Save();
        }
    }

}
