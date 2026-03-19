namespace IdleReservationsBE.Services
{
    using IdleReservationsBE.DTO;

    public interface IReservationService
    {
        IEnumerable<ReservationResponseDto> GetAll();
        ReservationResponseDto GetById(int id);
        void Create(ReservationCreateDto dto);
        void Cancel(int id);
    }

}
