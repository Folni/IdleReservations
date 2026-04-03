package hr.algebra.idlereservations.ui.restaurant

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.data.repository.RestaurantRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RestaurantDetailViewModel : ViewModel() {

    private val repository = RestaurantRepository()

    sealed class UiState {
        object Loading : UiState()
        data class Success(val restaurant: Restaurant) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun load(restaurantId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.getRestaurant(restaurantId).fold(
                onSuccess = { _uiState.value = UiState.Success(it) },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Failed to load") }
            )
        }
    }
}
