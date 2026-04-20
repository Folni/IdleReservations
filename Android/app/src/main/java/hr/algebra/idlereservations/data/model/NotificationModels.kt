package hr.algebra.idlereservations.data.model

import com.google.gson.annotations.SerializedName

data class NotificationDto(
    @SerializedName("notificationId") val notificationId: Int,
    @SerializedName("userId")         val userId: Int,
    @SerializedName("title")          val title: String?,
    @SerializedName("message")        val message: String?,
    @SerializedName("isRead")         val isRead: Boolean
)
