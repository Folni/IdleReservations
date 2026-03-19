namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface IReservationService
    {
        IEnumerable<ReservationResponseDto> GetAll();
        ReservationResponseDto GetById(int id);
        void Create(ReservationCreateDto dto);
        void Update(int id, ReservationCreateDto dto);
        void UpdateStatus(int id, string status);
        void Cancel(int id);
    }
}