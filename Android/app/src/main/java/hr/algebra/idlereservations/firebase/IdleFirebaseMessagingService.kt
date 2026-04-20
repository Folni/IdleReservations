package hr.algebra.idlereservations.firebase

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import hr.algebra.idlereservations.R
import hr.algebra.idlereservations.data.model.SaveFcmTokenRequest
import hr.algebra.idlereservations.data.network.AuthApiService
import hr.algebra.idlereservations.network.RetrofitClient
import hr.algebra.idlereservations.ui.main.MainActivity
import hr.algebra.idlereservations.util.JwtManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class IdleFirebaseMessagingService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        val userId = JwtManager.getUserId(this) ?: return
        sendTokenToBackend(userId, token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        val title = message.notification?.title
            ?: message.data["title"]
            ?: "Idle Reservations"
        val body = message.notification?.body
            ?: message.data["message"]
            ?: ""
        NotificationEventBus.send(NotificationEvent(title, body))
        showNotification(title, body)
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun showNotification(title: String, body: String) {
        ensureChannel()

        val tapIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_nav_reservations)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        NotificationManagerCompat.from(this)
            .notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun ensureChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Idle Reservations",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Reservation reminders and promotions"
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    fun sendTokenToBackend(userId: Int, token: String) {
        serviceScope.launch {
            try {
                RetrofitClient.instance
                    .create(AuthApiService::class.java)
                    .saveFcmToken(SaveFcmTokenRequest(userId, token))
            } catch (_: Exception) {}
        }
    }

    companion object {
        const val CHANNEL_ID = "idle_reservations_channel"
    }
}
