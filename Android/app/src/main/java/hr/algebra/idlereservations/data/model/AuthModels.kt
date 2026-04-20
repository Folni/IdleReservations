package hr.algebra.idlereservations.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("username")  val username: String,
    @SerializedName("email")     val email: String,
    @SerializedName("password")  val password: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName")  val lastName: String
)

data class RegisterResponse(
    @SerializedName("userId")   val userId: Int,
    @SerializedName("username") val username: String,
    @SerializedName("roleName") val roleName: String
)

data class SaveFcmTokenRequest(
    @SerializedName("userId") val userId: Int,
    @SerializedName("token")  val token: String
)

data class LoyaltyResponse(
    @SerializedName("points") val points: Int
)
