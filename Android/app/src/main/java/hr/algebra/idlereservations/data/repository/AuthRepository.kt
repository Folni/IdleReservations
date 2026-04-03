package hr.algebra.idlereservations.data.repository

import hr.algebra.idlereservations.data.model.LoginRequest
import hr.algebra.idlereservations.data.network.AuthApiService
import hr.algebra.idlereservations.network.RetrofitClient

class AuthRepository {

    private val api = RetrofitClient.instance.create(AuthApiService::class.java)

    suspend fun login(username: String, password: String): Result<String> {
        return try {
            val response = api.login(LoginRequest(username, password))
            if (response.isSuccessful) {
                val token = response.body()
                if (!token.isNullOrBlank()) Result.success(token)
                else Result.failure(Exception("Empty token in response"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
