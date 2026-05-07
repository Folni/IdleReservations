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

            try
            {
                var message = new Message
                {
                    Token = fcmToken.Token,
                    Notification = new FirebaseAdmin.Messaging.Notification { Title = title, Body = body }
                };

                await FirebaseMessaging.DefaultInstance.SendAsync(message);
            }
            catch (FirebaseMessagingException ex)
            {
                // Ako token više nije važeći (npr. aplikacija deinstalirana), brišemo ga iz baze
                if (ex.MessagingErrorCode == MessagingErrorCode.Unregistered ||
                    ex.MessagingErrorCode == MessagingErrorCode.InvalidArgument)
                {
                    _tokenRepo.Delete(userId);
                    _tokenRepo.Save();
                }
                throw;
            }
        }
    }
}
