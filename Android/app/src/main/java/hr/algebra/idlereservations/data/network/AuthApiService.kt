package hr.algebra.idlereservations.data.network

import hr.algebra.idlereservations.data.model.LoginRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<String>
}
