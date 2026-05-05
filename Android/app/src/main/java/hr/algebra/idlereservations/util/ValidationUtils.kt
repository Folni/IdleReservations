package hr.algebra.idlereservations.util

object ValidationUtils {

    fun isValidEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[a-z]{2,}\$".toRegex()
        return email.matches(emailRegex)
    }

    fun isValidPassword(password: String): Boolean {
        return password.length >= 6
    }

    fun isValidUsername(username: String): Boolean {
        return username.isNotBlank() && username.length >= 3
    }

    fun isValidName(name: String): Boolean {
        return name.isNotBlank()
    }

    fun isValidPhoneNumber(phone: String): Boolean {
        return phone.matches("^\\+?[0-9]{7,15}\$".toRegex())
    }
}
