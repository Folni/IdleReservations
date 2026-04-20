using System;
using System.Collections.Generic;

namespace IdleReservationsBE.Models;

public partial class FcmToken
{
    public int FcmId { get; set; }

    public string Token { get; set; } = null!;

    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
