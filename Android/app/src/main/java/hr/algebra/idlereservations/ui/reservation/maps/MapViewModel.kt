package hr.algebra.idlereservations.ui.reservation.maps

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.data.repository.RestaurantRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MapViewModel : ViewModel() {

    private val repository = RestaurantRepository()

    private val _restaurants = MutableStateFlow<List<Restaurant>>(emptyList())
    val restaurants: StateFlow<List<Restaurant>> = _restaurants.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getRestaurants().onSuccess { _restaurants.value = it }
        }
    }
}
