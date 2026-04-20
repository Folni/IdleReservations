using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace IdleReservationsBE.Models;

public partial class IdleReservationsDbContext : DbContext
{
    public IdleReservationsDbContext()
    {
    }

    public IdleReservationsDbContext(DbContextOptions<IdleReservationsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<FcmToken> FcmTokens { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<Restaurant> Restaurants { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Table> Tables { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("name=ConnectionStrings:DbConnStr");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FcmToken>(entity =>
        {
            entity.HasKey(e => e.FcmId).HasName("PK__FCM_Toke__66AA118E8C4FFBE9");

            entity.ToTable("FCM_Tokens");

            entity.Property(e => e.Token).HasMaxLength(200);

            entity.HasOne(d => d.User).WithMany(p => p.FcmTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_notifications_user");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E12D36CFA52");

            entity.ToTable("Notification");

            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_notification_user");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42FCFBAB9AF9E");

            entity.ToTable("Promotion");

            entity.Property(e => e.DiscountPercent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Promotions)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_promo_restaurant");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.ReservationId).HasName("PK__Reservat__B7EE5F24B6F2E941");

            entity.ToTable("Reservation");

            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_reservation_restaurant");

            entity.HasOne(d => d.Table).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.TableId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_reservation_table");

            entity.HasOne(d => d.User).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_reservation_user");
        });

        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.RestaurantId).HasName("PK__Restaura__87454C95775ACD3B");

            entity.ToTable("Restaurant");

            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.WorkingHours).HasMaxLength(100);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1AFEEF6D62");

            entity.ToTable("Role");

            entity.HasIndex(e => e.RoleName, "UQ__Role__8A2B616033B4B9B5").IsUnique();

            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(e => e.TableId).HasName("PK__Table__7D5F01EEB6F3A742");

            entity.ToTable("Table");

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Tables)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_table_restaurant");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C5F1B04BC");

            entity.ToTable("User");

            entity.HasIndex(e => e.Username, "UQ__User__536C85E48E62CEC0").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__User__A9D10534AD9D28DB").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Salt).HasMaxLength(255);
            entity.Property(e => e.Username).HasMaxLength(100);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
