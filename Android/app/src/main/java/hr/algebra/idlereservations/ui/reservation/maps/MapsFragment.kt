package hr.algebra.idlereservations.ui.reservation.maps

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.material.bottomsheet.BottomSheetDialog
import hr.algebra.idlereservations.R
import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.databinding.BottomSheetRestaurantBinding
import hr.algebra.idlereservations.databinding.FragmentMapsBinding
import kotlinx.coroutines.launch

class MapsFragment : Fragment(), OnMapReadyCallback {

    private var _binding: FragmentMapsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MapViewModel by viewModels()
    private var googleMap: GoogleMap? = null
    private val markerRestaurantMap = mutableMapOf<String, Restaurant>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapsBinding.inflate(inflater, container, false)
        binding.mapView.onCreate(savedInstanceState)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.mapView.getMapAsync(this)
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.restaurants.collect { restaurants ->
                    if (restaurants.isNotEmpty()) addMarkers(restaurants)
                }
            }
        }
    }

    private fun addMarkers(restaurants: List<Restaurant>) {
        val map = googleMap ?: return
        map.clear()
        markerRestaurantMap.clear()

        val boundsBuilder = LatLngBounds.Builder()

        restaurants.forEach { restaurant ->
            val position = LatLng(restaurant.latitude, restaurant.longitude)
            map.addMarker(MarkerOptions().position(position).title(restaurant.name))
            markerRestaurantMap[restaurant.name] = restaurant
            boundsBuilder.include(position)
        }

        map.setOnMarkerClickListener { marker ->
            val restaurant = markerRestaurantMap[marker.title] ?: return@setOnMarkerClickListener false
            showBottomSheet(restaurant)
            true
        }
    }

    private fun showBottomSheet(restaurant: Restaurant) {
        val sheetBinding = BottomSheetRestaurantBinding.inflate(layoutInflater)
        val dialog = BottomSheetDialog(requireContext())
        dialog.setContentView(sheetBinding.root)

        sheetBinding.tvSheetName.text         = restaurant.name
        sheetBinding.tvSheetAddress.text      = restaurant.address
        sheetBinding.tvSheetWorkingHours.text = restaurant.workingHours ?: ""

        sheetBinding.btnSheetBook.setOnClickListener {
            dialog.dismiss()
            val bundle = Bundle().apply {
                putInt("restaurantId", restaurant.id)
                putString("restaurantName", restaurant.name)
                putString("workingHours", restaurant.workingHours ?: "")
            }
            findNavController().navigate(R.id.action_map_to_booking, bundle)
        }

        dialog.show()
    }

    override fun onResume()    { super.onResume();    _binding?.mapView?.onResume() }
    override fun onPause()     { super.onPause();     _binding?.mapView?.onPause() }
    override fun onStart()     { super.onStart();     _binding?.mapView?.onStart() }
    override fun onStop()      { super.onStop();      _binding?.mapView?.onStop() }
    override fun onLowMemory() { super.onLowMemory(); _binding?.mapView?.onLowMemory() }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        _binding?.mapView?.onSaveInstanceState(outState)
    }

    override fun onDestroyView() {
        googleMap = null
        _binding?.mapView?.onDestroy()
        super.onDestroyView()
        _binding = null
    }
}
