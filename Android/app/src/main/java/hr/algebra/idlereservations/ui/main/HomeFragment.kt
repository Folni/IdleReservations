package hr.algebra.idlereservations.ui.main

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.PopupMenu
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import hr.algebra.idlereservations.R
import hr.algebra.idlereservations.databinding.FragmentHomeBinding
import hr.algebra.idlereservations.ui.auth.LoginActivity
import hr.algebra.idlereservations.ui.restaurant.RestaurantAdapter
import hr.algebra.idlereservations.util.JwtManager
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HomeViewModel by viewModels()
    private lateinit var adapter: RestaurantAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = RestaurantAdapter { restaurant ->
            val bundle = Bundle().apply {
                putInt("restaurantId", restaurant.id)
                putString("restaurantName", restaurant.name)
            }
            findNavController().navigate(R.id.action_home_to_restaurant_detail, bundle)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener { viewModel.load() }

        binding.btnProfile.setOnClickListener {
            val popup = PopupMenu(requireContext(), binding.btnProfile)
            popup.menuInflater.inflate(R.menu.menu_profile, popup.menu)
            popup.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.action_notifications -> {
                        findNavController().navigate(R.id.action_home_to_notifications)
                        true
                    }
                    R.id.action_loyalty -> {
                        findNavController().navigate(R.id.action_home_to_profile)
                        true
                    }
                    R.id.action_logout -> {
                        JwtManager.clearToken(requireContext())
                        val intent = Intent(requireContext(), LoginActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        }
                        startActivity(intent)
                        true
                    }
                    else -> false
                }
            }
            popup.show()
        }

        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    binding.swipeRefresh.isRefreshing = false
                    when (state) {
                        is HomeViewModel.UiState.Loading -> {
                            binding.progressBar.visibility = View.VISIBLE
                            binding.tvEmpty.visibility = View.GONE
                        }
                        is HomeViewModel.UiState.Success -> {
                            binding.progressBar.visibility = View.GONE
                            if (state.restaurants.isEmpty()) {
                                binding.tvEmpty.visibility = View.VISIBLE
                            } else {
                                binding.tvEmpty.visibility = View.GONE
                                adapter.submitList(state.restaurants)
                            }
                        }
                        is HomeViewModel.UiState.Error -> {
                            binding.progressBar.visibility = View.GONE
                            binding.tvEmpty.visibility = View.VISIBLE
                            binding.tvEmpty.text = state.message
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
