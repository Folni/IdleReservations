using System;
using System.Collections.Generic;

namespace IdleReservationsBE.Models;

public partial class Reservation
{
    public int ReservationId { get; set; }

    public int UserId { get; set; }

    public int RestaurantId { get; set; }

    public int TableId { get; set; }

    public DateTime ReservationDateTime { get; set; }

    public int PartySize { get; set; }

    public string Status { get; set; } = null!;

    public virtual Restaurant Restaurant { get; set; } = null!;

    public virtual Table Table { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
