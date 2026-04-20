package hr.algebra.idlereservations.data.repository

import hr.algebra.idlereservations.data.model.CreateReservationRequest
import hr.algebra.idlereservations.data.model.Reservation
import hr.algebra.idlereservations.data.model.RestaurantTable
import hr.algebra.idlereservations.data.model.UpdateReservationRequest
import hr.algebra.idlereservations.data.model.toReservation
import hr.algebra.idlereservations.data.model.toRestaurantTable
import hr.algebra.idlereservations.data.network.ReservationApiService
import hr.algebra.idlereservations.data.network.RestaurantApiService
import hr.algebra.idlereservations.network.RetrofitClient

class ReservationRepository {

    private val api            = RetrofitClient.instance.create(ReservationApiService::class.java)
    private val restaurantApi  = RetrofitClient.instance.create(RestaurantApiService::class.java)

    suspend fun getReservations(userId: Int): Result<List<Reservation>> {
        return try {
            val response = api.getReservations(userId)
            if (response.isSuccessful) {
                val reservations = response.body()
                    ?.filter { it.userId == userId }
                    ?.map { it.toReservation() }
                    ?: emptyList()
                Result.success(reservations)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createReservation(
        userId: Int,
        restaurantId: Int,
        tableId: Int,
        dateTime: String,
        partySize: Int
    ): Result<String> {
        return try {
            val body = CreateReservationRequest(userId, restaurantId, tableId, dateTime, partySize)
            val response = api.createReservation(body)
            if (response.isSuccessful)
                Result.success(response.body() ?: "Reservation created successfully")
            else
                Result.failure(Exception(response.errorBody()?.string()?.takeIf { it.isNotBlank() }
                    ?: "Error ${response.code()}: ${response.message()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun cancelReservation(reservationId: Int): Result<String> {
        return try {
            val response = api.cancelReservation(reservationId)
            if (response.isSuccessful)
                Result.success(response.body() ?: "Reservation cancelled")
            else
                Result.failure(Exception(response.errorBody()?.string()?.takeIf { it.isNotBlank() }
                    ?: "Error ${response.code()}: ${response.message()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTablesForRestaurant(restaurantId: Int): Result<List<RestaurantTable>> {
        return try {
            val response = restaurantApi.getTablesForRestaurant(restaurantId)
            if (response.isSuccessful) {
                val tables = response.body()?.map { it.toRestaurantTable() } ?: emptyList()
                Result.success(tables)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun editReservation(
        reservationId: Int,
        userId: Int,
        newDateTime: String,
        newPartySize: Int,
        tableId: Int,
        currentStatus: String,
        restaurantId: Int
    ): Result<String> {
        return try {
            val body = UpdateReservationRequest(
                restaurantId        = restaurantId,
                userId              = userId,
                reservationDateTime = newDateTime,
                partySize           = newPartySize,
                tableId             = tableId,
                status              = currentStatus
            )
            val response = api.updateReservation(reservationId, body)
            if (response.isSuccessful)
                Result.success(response.body() ?: "Reservation updated successfully")
            else
                Result.failure(Exception(response.errorBody()?.string()?.takeIf { it.isNotBlank() }
                    ?: "Error ${response.code()}: ${response.message()}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
