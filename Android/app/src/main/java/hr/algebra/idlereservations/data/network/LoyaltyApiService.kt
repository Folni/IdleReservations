package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.LoyaltyResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface LoyaltyApiService {

    @GET("auth/loyalty/{userId}")
    suspend fun getPoints(@Path("userId") userId: Int): Response<LoyaltyResponse>

    @GET("auth/loyalty/increment/{userId}")
    suspend fun incrementPoints(@Path("userId") userId: Int): Response<LoyaltyResponse>
}
