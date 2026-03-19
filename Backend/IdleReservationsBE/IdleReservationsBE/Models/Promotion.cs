using System;
using System.Collections.Generic;

namespace IdleReservationsBE.Models;

public partial class Promotion
{
    public int PromotionId { get; set; }

    public int RestaurantId { get; set; }

    public string Title { get; set; } = null!;

    public decimal? DiscountPercent { get; set; }

    public virtual Restaurant Restaurant { get; set; } = null!;
}
