package hr.algebra.idlereservations

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import hr.algebra.idlereservations.ui.auth.LoginActivity
import hr.algebra.idlereservations.ui.main.MainActivity
import hr.algebra.idlereservations.util.JwtManager
import org.hamcrest.Matchers.anyOf
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class IntegrationTests {

    @Before
    fun setUp() {
        // Osiguravamo da testovi kreću od LoginActivity-a tako što odjavljujemo korisnika
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        JwtManager.clearToken(context)
    }

    /**
     * 1. Test provjere elemenata na ekranu za prijavu
     */
    @Test
    fun testLoginScreenState() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withText("Idle Reservations")).check(matches(isDisplayed()))
            onView(withId(R.id.etUsername)).check(matches(isDisplayed()))
            onView(withId(R.id.btnLogin)).check(matches(isDisplayed()))
            onView(withId(R.id.tvRegister)).check(matches(isDisplayed()))
        }
    }

    /**
     * 2. Test pokušaja prijave s praznim poljima
     */
    @Test
    fun testLoginEmptyFields() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.btnLogin)).perform(click())
            // Aplikacija bi trebala ostati na Login ekranu
            onView(withId(R.id.btnLogin)).check(matches(isDisplayed()))
        }
    }

    /**
     * 3. Test pokušaja prijave s neispravnim podacima
     */
    @Test
    fun testLoginInvalidCredentials() {
        ActivityScenario.launch(LoginActivity::class.java).use {
            onView(withId(R.id.etUsername)).perform(replaceText("wrong_user"), closeSoftKeyboard())
            onView(withId(R.id.etPassword)).perform(replaceText("wrong_pass"), closeSoftKeyboard())
            onView(withId(R.id.btnLogin)).perform(click())
            
            // Čekamo mrežni odgovor (error)
            Thread.sleep(1500)
            
            // Trebali bismo i dalje biti na Login ekranu
            onView(withId(R.id.btnLogin)).check(matches(isDisplayed()))
        }
    }

    /**
     * 4. Test UI elemenata glavnog ekrana (MainActivity)
     */
    @Test
    fun testMainActivityUI() {
        ActivityScenario.launch(MainActivity::class.java).use {
            // Provjeravamo je li donja navigacija vidljiva
            onView(withId(R.id.bottom_nav_main)).check(matches(isDisplayed()))
        }
    }

    /**
     * 5. Test navigacije unutar glavnog ekrana (Bottom Navigation)
     */
    @Test
    fun testBottomNavigationFlow() {
        ActivityScenario.launch(MainActivity::class.java).use {
            // Klik na Search tab
            onView(withId(R.id.nav_search)).perform(click())
            
            // Provjera je li SearchFragment učitan (provjeravamo postojanje tražilice)
            onView(withId(R.id.et_search)).check(matches(isDisplayed()))
            
            // Klik natrag na Home tab
            onView(withId(R.id.nav_home)).perform(click())
            onView(withId(R.id.bottom_nav_main)).check(matches(isDisplayed()))
        }
    }
}
