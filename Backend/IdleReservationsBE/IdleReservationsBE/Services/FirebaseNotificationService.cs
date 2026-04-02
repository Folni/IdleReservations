using Newtonsoft.Json;
using System.Text;

namespace IdleReservationsBE.Services
{
    public class FirebaseNotificationService
    {
        private readonly string _serverKey = "AIzaSyBOpTqYv_9HroW9TcZcENbdH2cyVAkabcs";
        private readonly HttpClient _http = new HttpClient();

        public async Task SendAsync(string token, string title, string body)
        {
            if (string.IsNullOrEmpty(token)) return;

            var payload = new
            {
                to = token,
                notification = new { title, body }
            };

            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _http.DefaultRequestHeaders.Clear();
            _http.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", "key=" + _serverKey);

            await _http.PostAsync("https://fcm.googleapis.com/fcm/send", content);
        }
    }

}
