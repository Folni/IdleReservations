package hr.algebra.idlereservations.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {

    private val repository = AuthRepository()

    sealed class UiState {
        object Idle    : UiState()
        object Loading : UiState()
        data class Success(val token: String) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.login(username, password).fold(
                onSuccess = { token -> _uiState.value = UiState.Success(token) },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Login failed") }
            )
        }
    }
}
