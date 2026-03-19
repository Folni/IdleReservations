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
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E126961305B");

            entity.ToTable("Notification");

            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_notification_user");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42FCF59D1C6DA");

            entity.ToTable("Promotion");

            entity.Property(e => e.DiscountPercent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Promotions)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_promo_restaurant");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(e => e.ReservationId).HasName("PK__Reservat__B7EE5F241ADB8947");

            entity.ToTable("Reservation");

            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending");

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_reservation_restaurant");

            entity.HasOne(d => d.Table).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.TableId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_reservation_table");

            entity.HasOne(d => d.User).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_reservation_user");
        });

        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.RestaurantId).HasName("PK__Restaura__87454C957198EB0E");

            entity.ToTable("Restaurant");

            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1A6247460D");

            entity.ToTable("Role");

            entity.HasIndex(e => e.RoleName, "UQ__Role__8A2B61601A8833CA").IsUnique();

            entity.Property(e => e.RoleName).HasMaxLength(100);
        });

        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(e => e.TableId).HasName("PK__Table__7D5F01EED558D64D");

            entity.ToTable("Table");

            entity.HasOne(d => d.Restaurant).WithMany(p => p.Tables)
                .HasForeignKey(d => d.RestaurantId)
                .HasConstraintName("fk_table_restaurant");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C19DF4F6D");

            entity.ToTable("User");

            entity.HasIndex(e => e.Username, "UQ__User__536C85E4BD526A5F").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__User__A9D105340266F1CA").IsUnique();

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
