package hr.algebra.idlereservations

import android.app.Application
import android.content.Context

class IdleReservationsApp : Application() {

    companion object {
        lateinit var context: Context
            private set
    }

    override fun onCreate() {
        super.onCreate()
        context = applicationContext
    }
}
