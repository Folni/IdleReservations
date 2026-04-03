package hr.algebra.idlereservations.data.model

import com.google.gson.annotations.SerializedName

data class RestaurantDto(
    @SerializedName(value = "id", alternate = ["restaurantId"]) val id: Int,
    @SerializedName("name")         val name: String,
    @SerializedName("address")      val address: String?,
    @SerializedName("city")         val city: String?,
    @SerializedName("latitude")     val latitude: Double?,
    @SerializedName("longitude")    val longitude: Double?,
    @SerializedName("workingHours") val workingHours: String?
)

data class Restaurant(
    val id: Int,
    val name: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val workingHours: String?
)

fun RestaurantDto.toRestaurant() = Restaurant(
    id           = id,
    name         = name,
    address      = listOfNotNull(address, city).joinToString(", "),
    latitude     = latitude ?: 0.0,
    longitude    = longitude ?: 0.0,
    workingHours = workingHours
)
