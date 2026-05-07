using IdleReservationsBE.Interfaces;
using IdleReservationsBE.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace IdleReservationsBE.Services
{
    public class ReservationReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConfiguration _config;
        private readonly ILogger<ReservationReminderService> _logger;

        private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);
        private static readonly TimeSpan WindowStart   = TimeSpan.FromMinutes(1);
        private static readonly TimeSpan WindowEnd     = TimeSpan.FromDays(30);

        private readonly HashSet<int> _notifiedReservationIds = new();

        public ReservationReminderService(
            IServiceScopeFactory scopeFactory,
            IConfiguration config,
            ILogger<ReservationReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _config = config;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ReservationReminderService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessReminders(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing reservation reminders.");
                }

                await Task.Delay(CheckInterval, stoppingToken);
            }
        }

        private async Task ProcessReminders(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db            = scope.ServiceProvider.GetRequiredService<IdleReservationsDbContext>();
            var firebase      = scope.ServiceProvider.GetRequiredService<FirebaseNotificationService>();
            var tokens        = scope.ServiceProvider.GetRequiredService<ITokenRepository>();
            var notifications = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var now = DateTime.Now;
            var from = now.Add(WindowStart);
            var to   = now.Add(WindowEnd);

            var upcoming = await db.Reservations
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Where(r => r.Status != "Cancelled"
                         && r.ReservationDateTime >= from
                         && r.ReservationDateTime <= to)
                .ToListAsync(ct);

            foreach (var reservation in upcoming)
            {
                if (_notifiedReservationIds.Contains(reservation.ReservationId))
                    continue;

                var user        = reservation.User;
                var fcmToken    = tokens.GetByUser(user.UserId);
                var title       = "Upcoming Reservation Reminder";
                var body        = $"Don't forget! You have a reservation at {reservation.Restaurant.Name} " +
                                  $"on {reservation.ReservationDateTime:dddd, MMM d} at {reservation.ReservationDateTime:HH:mm}.";

                if (fcmToken != null)
                {
                    try
                    {
                        await firebase.SendAsync(user.UserId, title, body);
                        _logger.LogInformation("Push sent to user {UserId} for reservation {ReservationId}.", user.UserId, reservation.ReservationId);
                        SaveNotification(notifications, user.UserId, title, body);
                        _notifiedReservationIds.Add(reservation.ReservationId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to send push notification to user {UserId}. Falling back to email if possible.", user.UserId);
                        // Ako push nije uspio, pokušavamo email (ako postoji)
                        if (!string.IsNullOrWhiteSpace(user.Email))
                        {
                            SendEmail(user.Email, user.Username, title, body);
                            _logger.LogInformation("Fallback email sent to user {UserId} for reservation {ReservationId}.", user.UserId, reservation.ReservationId);
                            SaveNotification(notifications, user.UserId, title, body);
                            _notifiedReservationIds.Add(reservation.ReservationId);
                        }
                    }
                }
                else if (!string.IsNullOrWhiteSpace(user.Email))
                {
                    SendEmail(user.Email, user.Username, title, body);
                    _logger.LogInformation("Email sent to user {UserId} for reservation {ReservationId}.", user.UserId, reservation.ReservationId);
                    SaveNotification(notifications, user.UserId, title, body);
                    _notifiedReservationIds.Add(reservation.ReservationId);
                }
            }
        }

        private void SaveNotification(INotificationRepository repo, int userId, string title, string message)
        {
            repo.Create(new Notification
            {
                UserId  = userId,
                Title   = title,
                Message = message,
                IsRead  = false
            });
            repo.Save();
        }

        private void SendEmail(string toAddress, string toName, string subject, string body)
        {
            var smtpHost = _config["Smtp:Host"];
            var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
            var smtpUser = _config["Smtp:Username"];
            var smtpPass = _config["Smtp:Password"];
            var fromAddr = _config["Smtp:From"] ?? smtpUser;

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var message = new MailMessage(
                from: new MailAddress(fromAddr!, "Idle Reservations"),
                to:   new MailAddress(toAddress, toName))
            {
                Subject = subject,
                Body    = body
            };

            client.Send(message);
        }
    }
}
