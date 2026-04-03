package hr.algebra.idlereservations.ui.main

import android.location.Location
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.data.repository.RestaurantRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

class SearchViewModel : ViewModel() {

    private val repository = RestaurantRepository()
    private var allRestaurants: List<Restaurant> = emptyList()
    private var currentQuery: String = ""
    private var userLocation: Location? = null

    data class FilterState(
        val openNow: Boolean = false,
        val maxDistanceKm: Int = 0
    ) {
        val isActive get() = openNow || maxDistanceKm > 0
    }

    sealed class UiState {
        object Loading : UiState()
        data class Success(val restaurants: List<Restaurant>) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _filterState = MutableStateFlow(FilterState())
    val filterState: StateFlow<FilterState> = _filterState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.getRestaurants().fold(
                onSuccess = {
                    allRestaurants = it
                    reapply()
                },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Failed to load") }
            )
        }
    }

    fun search(query: String) {
        currentQuery = query
        reapply()
    }

    fun applyFilters(filter: FilterState, location: Location?) {
        _filterState.value = filter
        userLocation = location
        reapply()
    }

    private fun reapply() {
        val filter = _filterState.value
        var list = allRestaurants

        if (currentQuery.isNotBlank()) {
            list = list.filter {
                it.name.contains(currentQuery, ignoreCase = true) ||
                it.address.contains(currentQuery, ignoreCase = true)
            }
        }

        if (filter.openNow) {
            list = list.filter { isOpenNow(it.workingHours) }
        }

        if (filter.maxDistanceKm > 0) {
            val loc = userLocation
            if (loc != null) {
                list = list.filter { restaurant ->
                    val results = FloatArray(1)
                    Location.distanceBetween(
                        loc.latitude, loc.longitude,
                        restaurant.latitude, restaurant.longitude,
                        results
                    )
                    results[0] <= filter.maxDistanceKm * 1000f
                }
            }
        }

        _uiState.value = UiState.Success(list)
    }

    private fun isOpenNow(workingHours: String?): Boolean {
        if (workingHours == null) return false
        val parts = workingHours.split("-").map { it.trim() }
        if (parts.size != 2) return false
        return try {
            val fmt = DateTimeFormatter.ofPattern("HH:mm")
            val now = LocalTime.now()
            val open = LocalTime.parse(parts[0], fmt)
            val close = LocalTime.parse(parts[1], fmt)
            now.isAfter(open) && now.isBefore(close)
        } catch (e: DateTimeParseException) {
            false
        }
    }
}
