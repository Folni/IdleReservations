package hr.algebra.idlereservations.firebase

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

data class NotificationEvent(val title: String, val body: String)

object NotificationEventBus {
    private val _events = MutableSharedFlow<NotificationEvent>(extraBufferCapacity = 1)
    val events = _events.asSharedFlow()

    fun send(event: NotificationEvent) = _events.tryEmit(event)
}
