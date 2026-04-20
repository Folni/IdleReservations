using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using IdleReservationsBE.Interfaces;
using IdleReservationsBE.Models;

namespace IdleReservationsBE.Services
{
    public class FirebaseNotificationService
    {
        private readonly ITokenRepository _tokenRepo;

        public FirebaseNotificationService(ITokenRepository tokenRepo, IWebHostEnvironment env)
        {
            _tokenRepo = tokenRepo;

            if (FirebaseApp.DefaultInstance == null)
            {
                var keyPath = Path.Combine(env.ContentRootPath, "firebase-service-account.json");
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(keyPath)
                });
            }
        }

        public async Task SendAsync(int userId, string title, string body)
        {
            FcmToken fcmToken = _tokenRepo.GetByUser(userId);
            if (fcmToken == null)
                return;

            var message = new Message
            {
                Token = fcmToken.Token,
                Notification = new FirebaseAdmin.Messaging.Notification { Title = title, Body = body }
            };

            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
    }
}
