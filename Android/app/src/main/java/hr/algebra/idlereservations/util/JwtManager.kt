package hr.algebra.idlereservations.util

import android.content.Context
import com.auth0.android.jwt.JWT

/**
 * Stores the raw JWT after login and exposes decoded claims.
 * Token is kept in SharedPreferences so it survives process death.
 */
object JwtManager {

    private const val PREFS_NAME = "idle_prefs"
    private const val KEY_TOKEN  = "jwt_token"

    private var cachedToken: String? = null

    // ── Save / clear ──────────────────────────────────────────────────────────

    fun saveToken(context: Context, token: String) {
        cachedToken = token
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_TOKEN, token)
            .apply()
    }

    fun clearToken(context: Context) {
        cachedToken = null
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_TOKEN)
            .apply()
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    fun getToken(context: Context): String? {
        if (cachedToken != null) return cachedToken
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_TOKEN, null)
            .also { cachedToken = it }
    }

    fun isLoggedIn(context: Context): Boolean {
        val token = getToken(context) ?: return false
        return try {
            !JWT(token).isExpired(0)
        } catch (e: Exception) {
            false
        }
    }

    // ── Claims ────────────────────────────────────────────────────────────────

    fun getUserId(context: Context): Int? {
        val token = getToken(context) ?: return null
        return try {
            JWT(token).getClaim("userId").asString()?.toIntOrNull()
        } catch (e: Exception) {
            null
        }
    }

    fun getUsername(context: Context): String? {
        val token = getToken(context) ?: return null
        return try {
            JWT(token).getClaim("username").asString()
        } catch (e: Exception) {
            null
        }
    }

    fun getRole(context: Context): String? {
        val token = getToken(context) ?: return null
        return try {
            JWT(token).getClaim("role").asString()
        } catch (e: Exception) {
            null
        }
    }
}
