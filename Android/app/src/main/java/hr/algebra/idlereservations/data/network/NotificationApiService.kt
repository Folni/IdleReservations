package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.NotificationDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path

interface NotificationApiService {

    @GET("notifications/user/{userId}")
    suspend fun getNotifications(@Path("userId") userId: Int): Response<List<NotificationDto>>

    @PUT("notifications/read/{id}")
    suspend fun markAsRead(@Path("id") notificationId: Int): Response<String>
}
