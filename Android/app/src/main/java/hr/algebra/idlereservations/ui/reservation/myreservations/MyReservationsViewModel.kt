package hr.algebra.idlereservations.ui.reservation.myreservations

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.Reservation
import hr.algebra.idlereservations.data.model.ReservationStatus
import hr.algebra.idlereservations.data.repository.ReservationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MyReservationsViewModel : ViewModel() {

    private val repository = ReservationRepository()
    private var currentUserId: Int = 0

    sealed class UiState {
        object Loading : UiState()
        data class Success(val reservations: List<Reservation>) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _event = MutableStateFlow<String?>(null)
    val event: StateFlow<String?> = _event.asStateFlow()

    fun loadReservations(userId: Int) {
        currentUserId = userId
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.getReservations(userId).fold(
                onSuccess = { _uiState.value = UiState.Success(it) },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Unknown error") }
            )
        }
    }

    fun cancelReservation(reservation: Reservation) {
        viewModelScope.launch {
            repository.cancelReservation(
                reservationId = reservation.reservationId
            ).fold(
                onSuccess = { message ->
                    _event.value = message
                    val current = (_uiState.value as? UiState.Success)?.reservations ?: return@fold
                    _uiState.value = UiState.Success(current.map {
                        if (it.reservationId == reservation.reservationId)
                            it.copy(status = ReservationStatus.CANCELLED)
                        else it
                    })
                },
                onFailure = { _event.value = it.message ?: "Failed to cancel" }
            )
        }
    }

    fun editReservation(reservation: Reservation, newDateTime: String, newPartySize: Int) {
        viewModelScope.launch {
            repository.editReservation(
                restaurantId= reservation.restaurantId,
                reservationId = reservation.reservationId,
                userId        = currentUserId,
                newDateTime   = newDateTime,
                newPartySize  = newPartySize,
                tableId = reservation.tableId,
                currentStatus = reservation.status.name.lowercase().replaceFirstChar { it.uppercase() }
            ).fold(
                onSuccess = { message ->
                    _event.value = message
                    loadReservations(currentUserId)
                },
                onFailure = { _event.value = it.message ?: "Failed to update" }
            )
        }
    }

    fun clearEvent() { _event.value = null }
}
