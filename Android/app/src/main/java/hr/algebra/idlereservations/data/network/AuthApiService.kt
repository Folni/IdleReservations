package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.LoginRequest
import hr.algebra.idlereservations.data.model.RegisterRequest
import hr.algebra.idlereservations.data.model.RegisterResponse
import hr.algebra.idlereservations.data.model.SaveFcmTokenRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<String>

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<RegisterResponse>

    @POST("auth/save-fcm-token")
    suspend fun saveFcmToken(@Body body: SaveFcmTokenRequest): Response<Unit>
}
