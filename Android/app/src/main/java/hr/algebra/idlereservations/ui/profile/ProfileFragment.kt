package hr.algebra.idlereservations.ui.profile

import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.google.firebase.messaging.FirebaseMessaging
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import hr.algebra.idlereservations.data.network.LoyaltyApiService
import hr.algebra.idlereservations.databinding.FragmentProfileBinding
import hr.algebra.idlereservations.network.RetrofitClient
import hr.algebra.idlereservations.util.JwtManager
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONObject
import kotlin.coroutines.resume

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }

        val userId   = JwtManager.getUserId(requireContext()) ?: return
        val username = JwtManager.getUsername(requireContext()) ?: "User"

        binding.tvUsername.text = username

        lifecycleScope.launch {
            val fcmToken = getFcmToken() ?: ""
            val points   = fetchPoints(userId)

            binding.tvLoyaltyCode.text = "$points pts"

            val incrementUrl = "https://localhost:7001/api/auth/loyalty/increment/$userId"

            val json = JSONObject().apply {
                put("points", points)
                put("fcmToken", fcmToken)
                put("name", username)
                put("incrementUrl", incrementUrl)
            }.toString()

            binding.ivQrCode.setImageBitmap(generateQr(json))
        }
    }

    private suspend fun getFcmToken(): String? = suspendCancellableCoroutine { cont ->
        FirebaseMessaging.getInstance().token
            .addOnSuccessListener { cont.resume(it) }
            .addOnFailureListener { cont.resume(null) }
    }

    private suspend fun fetchPoints(userId: Int): Int {
        return try {
            val resp = RetrofitClient.instance
                .create(LoyaltyApiService::class.java)
                .getPoints(userId)
            if (resp.isSuccessful) resp.body()?.points ?: 0 else 0
        } catch (_: Exception) { 0 }
    }

    private fun generateQr(content: String, size: Int = 512): Bitmap {
        val bitMatrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bmp.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        return bmp
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
