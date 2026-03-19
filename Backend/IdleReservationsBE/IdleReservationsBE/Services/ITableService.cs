namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface ITableService
    {
        IEnumerable<TableResponseDto> GetAll();
        TableResponseDto GetById(int id);
        IEnumerable<TableResponseDto> GetByRestaurant(int restaurantId);
        void Create(TableCreateDto dto);
        void Update(int id, TableCreateDto dto);
        void Delete(int id);
    }

}
