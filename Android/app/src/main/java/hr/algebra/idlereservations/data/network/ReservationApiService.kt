package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.CreateReservationRequest
import hr.algebra.idlereservations.data.model.ReservationDto
import hr.algebra.idlereservations.data.model.UpdateReservationRequest
import retrofit2.Response
import retrofit2.http.*

interface ReservationApiService {

    @GET("reservations")
    suspend fun getReservations(
        @Query("userId") userId: Int
    ): Response<List<ReservationDto>>

    @POST("reservations")
    suspend fun createReservation(
        @Body body: CreateReservationRequest
    ): Response<Unit>

    @PUT("reservations/{id}")
    suspend fun updateReservation(
        @Path("id") reservationId: Int,
        @Body body: UpdateReservationRequest
    ): Response<ReservationDto>

    @PUT("reservations/cancel/{id}")
    suspend fun cancelReservation(@Path("id") reservationId: Int): Response<Unit>
}
