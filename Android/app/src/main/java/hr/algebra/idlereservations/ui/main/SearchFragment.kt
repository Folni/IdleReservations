package hr.algebra.idlereservations.ui.main

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.gms.location.LocationServices
import hr.algebra.idlereservations.R
import hr.algebra.idlereservations.databinding.FragmentSearchBinding
import hr.algebra.idlereservations.ui.restaurant.RestaurantAdapter
import kotlinx.coroutines.launch

class SearchFragment : Fragment() {

    private var _binding: FragmentSearchBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SearchViewModel by viewModels()
    private lateinit var adapter: RestaurantAdapter

    private var pendingFilter: SearchViewModel.FilterState? = null

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        val filter = pendingFilter ?: return@registerForActivityResult
        if (granted) {
            fetchLocationAndApply(filter)
        } else {
            viewModel.applyFilters(filter.copy(maxDistanceKm = 0), null)
            Toast.makeText(requireContext(), "Location permission denied — distance filter disabled", Toast.LENGTH_SHORT).show()
        }
        pendingFilter = null
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSearchBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = RestaurantAdapter { restaurant ->
            val bundle = Bundle().apply {
                putInt("restaurantId", restaurant.id)
                putString("restaurantName", restaurant.name)
            }
            findNavController().navigate(R.id.action_search_to_restaurant_detail, bundle)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                viewModel.search(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnFilter.setOnClickListener {
            val current = viewModel.filterState.value
            FilterBottomSheet.newInstance(current.openNow, current.maxDistanceKm)
                .show(parentFragmentManager, "filter")
        }

        setFragmentResultListener(FilterBottomSheet.RESULT_KEY) { _, bundle ->
            val openNow = bundle.getBoolean(FilterBottomSheet.ARG_OPEN_NOW)
            val maxDist = bundle.getInt(FilterBottomSheet.ARG_MAX_DIST)
            val filter = SearchViewModel.FilterState(openNow, maxDist)
            if (maxDist > 0) {
                pendingFilter = filter
                requestLocationThenApply(filter)
            } else {
                viewModel.applyFilters(filter, null)
            }
        }

        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        when (state) {
                            is SearchViewModel.UiState.Loading -> {
                                binding.progressBar.visibility = View.VISIBLE
                                binding.tvEmpty.visibility = View.GONE
                            }
                            is SearchViewModel.UiState.Success -> {
                                binding.progressBar.visibility = View.GONE
                                if (state.restaurants.isEmpty()) {
                                    binding.tvEmpty.visibility = View.VISIBLE
                                    binding.recyclerView.visibility = View.GONE
                                } else {
                                    binding.tvEmpty.visibility = View.GONE
                                    binding.recyclerView.visibility = View.VISIBLE
                                    adapter.submitList(state.restaurants)
                                }
                            }
                            is SearchViewModel.UiState.Error -> {
                                binding.progressBar.visibility = View.GONE
                                binding.tvEmpty.visibility = View.VISIBLE
                                binding.tvEmpty.text = state.message
                            }
                        }
                    }
                }
                launch {
                    viewModel.filterState.collect { filter ->
                        val tint = if (filter.isActive)
                            ContextCompat.getColor(requireContext(), com.google.android.material.R.color.design_default_color_primary)
                        else
                            ContextCompat.getColor(requireContext(), android.R.color.darker_gray)
                        binding.btnFilter.setColorFilter(tint)
                    }
                }
            }
        }
    }

    private fun requestLocationThenApply(filter: SearchViewModel.FilterState) {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED) {
            fetchLocationAndApply(filter)
            pendingFilter = null
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    private fun fetchLocationAndApply(filter: SearchViewModel.FilterState) {
        val client = LocationServices.getFusedLocationProviderClient(requireActivity())
        try {
            client.lastLocation
                .addOnSuccessListener { location ->
                    if (location == null) {
                        Toast.makeText(requireContext(), "Could not get current location", Toast.LENGTH_SHORT).show()
                    }
                    viewModel.applyFilters(filter, location)
                }
                .addOnFailureListener {
                    viewModel.applyFilters(filter, null)
                    Toast.makeText(requireContext(), "Location unavailable", Toast.LENGTH_SHORT).show()
                }
        } catch (e: SecurityException) {
            viewModel.applyFilters(filter, null)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
