package hr.algebra.idlereservations.data.model

import com.google.gson.annotations.SerializedName

data class TableDto(
    @SerializedName("tableId") val tableId: Int,
    @SerializedName("seats")   val seats: Int
)

data class RestaurantTableDto(
    @SerializedName(value = "tableId",  alternate = ["id"])       val tableId: Int,
    @SerializedName(value = "seats",    alternate = ["capacity"]) val seats: Int,
    @SerializedName("tableNumber")                                val tableNumber: String?
)

data class RestaurantTable(val id: Int, val seats: Int, val label: String)

fun RestaurantTableDto.toRestaurantTable() = RestaurantTable(
    id    = tableId,
    seats = seats,
    label = if (tableNumber != null) "Table $tableNumber ($seats seats)" else "Table $tableId ($seats seats)"
)

data class ReservationDto(
    @SerializedName("reservationId")       val reservationId: Int,
    @SerializedName("userId")              val userId: Int,
    @SerializedName("restaurantName")      val restaurantName: String?,
    @SerializedName("tableId")             val tableId: Int,
    @SerializedName("seats")               val seats: Int,
    @SerializedName("reservationDateTime") val reservationDateTime: String,
    @SerializedName("partySize")           val partySize: Int,
    @SerializedName("status")              val status: String?
)

data class CreateReservationRequest(
    @SerializedName("userId")              val userId: Int,
    @SerializedName("restaurantId")        val restaurantId: Int,
    @SerializedName("tableId")             val tableId: Int,
    @SerializedName("reservationDateTime") val reservationDateTime: String,
    @SerializedName("partySize")           val partySize: Int
)

data class UpdateReservationRequest(
    @SerializedName("userId")              val userId: Int,
    @SerializedName("reservationDateTime") val reservationDateTime: String,
    @SerializedName("partySize")           val partySize: Int,
    @SerializedName("status")              val status: String
)

enum class ReservationStatus { PENDING, CONFIRMED, CANCELLED, UNKNOWN }

data class Reservation(
    val reservationId: Int,
    val restaurantName: String,
    val restaurantAddress: String,
    val tableSeats: Int,
    val reservationDateTime: String,
    val partySize: Int,
    val status: ReservationStatus
)

fun ReservationDto.toReservation() = Reservation(
    reservationId       = reservationId,
    restaurantName      = restaurantName ?: "Unknown restaurant",
    restaurantAddress   = "",
    tableSeats          = seats,
    reservationDateTime = reservationDateTime,
    partySize           = partySize,
    status              = when (status?.lowercase()) {
        "pending"   -> ReservationStatus.PENDING
        "confirmed",
        "active"    -> ReservationStatus.CONFIRMED
        "cancelled" -> ReservationStatus.CANCELLED
        else        -> ReservationStatus.UNKNOWN
    }
)
