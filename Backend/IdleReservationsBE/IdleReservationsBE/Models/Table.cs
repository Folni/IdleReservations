using System;
using System.Collections.Generic;

namespace IdleReservationsBE.Models;

public partial class Table
{
    public int TableId { get; set; }

    public int RestaurantId { get; set; }

    public int Seats { get; set; }

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual Restaurant Restaurant { get; set; } = null!;
}
