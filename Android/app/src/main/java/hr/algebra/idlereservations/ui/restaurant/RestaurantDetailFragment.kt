package hr.algebra.idlereservations.ui.restaurant

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
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import hr.algebra.idlereservations.R
import hr.algebra.idlereservations.databinding.FragmentRestaurantDetailBinding
import kotlinx.coroutines.launch

class RestaurantDetailFragment : Fragment() {

    private var _binding: FragmentRestaurantDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: RestaurantDetailViewModel by viewModels()
    private var restaurantWorkingHours: String? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRestaurantDetailBinding.inflate(inflater, container, false)
        binding.mapView.onCreate(savedInstanceState)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val restaurantId   = arguments?.getInt("restaurantId") ?: return
        val restaurantName = arguments?.getString("restaurantName") ?: ""

        binding.toolbar.setNavigationOnClickListener { findNavController().navigateUp() }
        binding.tvName.text = restaurantName

        binding.btnBook.setOnClickListener {
            val bundle = Bundle().apply {
                putInt("restaurantId", restaurantId)
                putString("restaurantName", binding.tvName.text.toString())
                putString("workingHours", restaurantWorkingHours ?: "")
            }
            findNavController().navigate(R.id.action_restaurant_detail_to_booking, bundle)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is RestaurantDetailViewModel.UiState.Loading -> {
                            binding.progressBar.visibility = View.VISIBLE
                        }
                        is RestaurantDetailViewModel.UiState.Success -> {
                            binding.progressBar.visibility = View.GONE
                            val r = state.restaurant
                            restaurantWorkingHours         = r.workingHours
                            binding.tvName.text            = r.name
                            binding.tvAddress.text         = r.address
                            binding.tvWorkingHours.text    = r.workingHours ?: ""

                            binding.mapView.getMapAsync { map ->
                                val position = LatLng(r.latitude, r.longitude)
                                map.addMarker(MarkerOptions().position(position).title(r.name))
                                map.moveCamera(CameraUpdateFactory.newLatLngZoom(position, 15f))
                            }
                        }
                        is RestaurantDetailViewModel.UiState.Error -> {
                            binding.progressBar.visibility = View.GONE
                            binding.tvAddress.text = state.message
                        }
                    }
                }
            }
        }

        viewModel.load(restaurantId)
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
        _binding?.mapView?.onDestroy()
        super.onDestroyView()
        _binding = null
    }
}
