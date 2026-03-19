using System;
using System.Collections.Generic;

namespace IdleReservationsBE.Models;

public partial class Restaurant
{
    public int RestaurantId { get; set; }

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public string? City { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string? WorkingHours { get; set; }

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual ICollection<Table> Tables { get; set; } = new List<Table>();
}