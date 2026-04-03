package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.RestaurantDto
import hr.algebra.idlereservations.data.model.RestaurantTableDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface RestaurantApiService {

    @GET("restaurants")
    suspend fun getRestaurants(): Response<List<RestaurantDto>>

    @GET("restaurants/{id}")
    suspend fun getRestaurant(@Path("id") id: Int): Response<RestaurantDto>

    @GET("tables/restaurant/{restaurantId}")
    suspend fun getTablesForRestaurant(@Path("restaurantId") restaurantId: Int): Response<List<RestaurantTableDto>>
}
