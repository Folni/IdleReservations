package hr.algebra.idlereservations.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import hr.algebra.idlereservations.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RegisterViewModel : ViewModel() {

    private val repository = AuthRepository()

    sealed class UiState {
        object Idle    : UiState()
        object Loading : UiState()
        object Success : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun register(
        username: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String
    ) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            repository.register(username, email, password, firstName, lastName).fold(
                onSuccess = { _uiState.value = UiState.Success },
                onFailure = { _uiState.value = UiState.Error(it.message ?: "Registration failed") }
            )
        }
    }
}
