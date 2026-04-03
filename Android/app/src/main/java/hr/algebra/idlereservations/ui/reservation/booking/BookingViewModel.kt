package hr.algebra.idlereservations.ui.reservation.booking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.RestaurantTable
import hr.algebra.idlereservations.data.repository.ReservationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class BookingViewModel : ViewModel() {

    private val repository = ReservationRepository()

    sealed class UiState {
        object Idle    : UiState()
        object Loading : UiState()
        object Success : UiState()
        data class Error(val message: String) : UiState()
    }

    sealed class TablesState {
        object Loading : TablesState()
        data class Success(val tables: List<RestaurantTable>) : TablesState()
        data class Error(val message: String) : TablesState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _tablesState = MutableStateFlow<TablesState>(TablesState.Loading)
    val tablesState: StateFlow<TablesState> = _tablesState.asStateFlow()

    fun loadTables(restaurantId: Int) {
        viewModelScope.launch {
            _tablesState.value = TablesState.Loading
            repository.getTablesForRestaurant(restaurantId).fold(
                onSuccess = { _tablesState.value = TablesState.Success(it) },
                onFailure = { _tablesState.value = TablesState.Error(it.message ?: "Failed to load tables") }
            )
        }
    }

    fun book(userId: Int, restaurantId: Int, tableId: Int, dateTime: String, partySize: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.createReservation(userId, restaurantId, tableId, dateTime, partySize).fold(
                onSuccess = { _uiState.value = UiState.Success },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Booking failed") }
            )
        }
    }
}
