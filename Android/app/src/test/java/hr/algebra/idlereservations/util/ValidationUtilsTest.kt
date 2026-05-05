package hr.algebra.idlereservations.util

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ValidationUtilsTest {

    @Test
    fun `isValidEmail returns true for valid email`() {
        assertTrue(ValidationUtils.isValidEmail("test@example.com"))
        assertTrue(ValidationUtils.isValidEmail("user.name+tag@domain.co.uk"))
    }

    @Test
    fun `isValidEmail returns false for invalid email`() {
        assertFalse(ValidationUtils.isValidEmail("test@example"))
        assertFalse(ValidationUtils.isValidEmail("test@.com"))
        assertFalse(ValidationUtils.isValidEmail("test@@example.com"))
        assertFalse(ValidationUtils.isValidEmail(""))
    }

    @Test
    fun `isValidPassword returns true for length 6 or more`() {
        assertTrue(ValidationUtils.isValidPassword("123456"))
        assertTrue(ValidationUtils.isValidPassword("password123"))
    }

    @Test
    fun `isValidPassword returns false for length less than 6`() {
        assertFalse(ValidationUtils.isValidPassword("12345"))
        assertFalse(ValidationUtils.isValidPassword(""))
    }

    @Test
    fun `isValidUsername returns true for valid username`() {
        assertTrue(ValidationUtils.isValidUsername("user123"))
        assertTrue(ValidationUtils.isValidUsername("abc"))
    }

    @Test
    fun `isValidUsername returns false for invalid username`() {
        assertFalse(ValidationUtils.isValidUsername("ab"))
        assertFalse(ValidationUtils.isValidUsername("  "))
        assertFalse(ValidationUtils.isValidUsername(""))
    }
}
