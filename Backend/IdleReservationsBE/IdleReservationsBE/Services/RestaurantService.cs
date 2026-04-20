namespace IdleReservationsBE.Services
{
 
    using IdleReservationsBE.DTO;
    using IdleReservationsBE.Interfaces;
    using IdleReservationsBE.Models;
  
public class RestaurantService : IRestaurantService
{
    private readonly IRestaurantRepository _repo;

    public RestaurantService(IRestaurantRepository repo)
    {
        _repo = repo;
    }

    public IEnumerable<RestaurantResponseDto> GetAll()
    {
        return _repo.GetAll().Select(r => new RestaurantResponseDto
        {
            RestaurantId = r.RestaurantId,
            Name = r.Name,
            Address = r.Address,
            City = r.City,
            Latitude = r.Latitude,
            Longitude = r.Longitude,
            WorkingHours = r.WorkingHours
        });
    }

    public RestaurantResponseDto GetById(int id)
    {
        var r = _repo.GetById(id);
        if (r == null)
            throw new Exception("Restaurant not found");

        return new RestaurantResponseDto
        {
            RestaurantId = r.RestaurantId,
            Name = r.Name,
            Address = r.Address,
            City = r.City,
            Latitude = r.Latitude,
            Longitude = r.Longitude,
            WorkingHours = r.WorkingHours
        };
    }

    public void Create(RestaurantCreateDto dto)
    {
        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            WorkingHours = dto.WorkingHours
        };

        _repo.Create(restaurant);
        _repo.Save();
    }

    public void Update(int id, RestaurantCreateDto dto)
    {
        var r = _repo.GetById(id);
        if (r == null)
            throw new Exception("Restaurant not found");

        r.Name = dto.Name;
        r.Address = dto.Address;
        r.City = dto.City;
        r.Latitude = dto.Latitude;
        r.Longitude = dto.Longitude;
        r.WorkingHours = dto.WorkingHours;

        _repo.Update(r);
        _repo.Save();
    }

    public void Delete(int id)
    {
        var r = _repo.GetById(id);
        if (r == null)
            throw new Exception("Restaurant not found");

        _repo.Delete(r);
        _repo.Save();
    }
}

}
