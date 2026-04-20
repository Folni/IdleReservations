package hr.algebra.idlereservations.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.model.NotificationDto
import hr.algebra.idlereservations.data.network.NotificationApiService
import hr.algebra.idlereservations.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationsViewModel : ViewModel() {

    private val api = RetrofitClient.instance.create(NotificationApiService::class.java)

    sealed class UiState {
        object Loading : UiState()
        data class Success(val notifications: List<NotificationDto>) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun load(userId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val response = api.getNotifications(userId)
                if (response.isSuccessful) {
                    _uiState.value = UiState.Success(response.body() ?: emptyList())
                } else {
                    _uiState.value = UiState.Error("Error ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Failed to load notifications")
            }
        }
    }

    fun markAsRead(notificationId: Int) {
        viewModelScope.launch {
            try {
                api.markAsRead(notificationId)
                // refresh the local list to update read state
                val current = (_uiState.value as? UiState.Success)?.notifications ?: return@launch
                _uiState.value = UiState.Success(
                    current.map { if (it.notificationId == notificationId) it.copy(isRead = true) else it }
                )
            } catch (_: Exception) {}
        }
    }
}
