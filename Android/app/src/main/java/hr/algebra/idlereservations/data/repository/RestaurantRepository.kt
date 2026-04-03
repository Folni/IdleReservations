package hr.algebra.idlereservations.data.repository

import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.data.model.toRestaurant
import hr.algebra.idlereservations.data.network.RestaurantApiService
import hr.algebra.idlereservations.network.RetrofitClient

class RestaurantRepository {

    private val api = RetrofitClient.instance.create(RestaurantApiService::class.java)

    suspend fun getRestaurants(): Result<List<Restaurant>> {
        return try {
            val response = api.getRestaurants()
            if (response.isSuccessful) {
                val list = response.body()?.map { it.toRestaurant() } ?: emptyList()
                Result.success(list)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getRestaurant(id: Int): Result<Restaurant> {
        return try {
            val response = api.getRestaurant(id)
            if (response.isSuccessful) {
                val restaurant = response.body()?.toRestaurant()
                    ?: return Result.failure(Exception("Empty response body"))
                Result.success(restaurant)
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
