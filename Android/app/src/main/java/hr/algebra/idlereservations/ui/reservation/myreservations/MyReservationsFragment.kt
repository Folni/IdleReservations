package hr.algebra.idlereservations.ui.reservation.myreservations

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import hr.algebra.idlereservations.data.model.Reservation
import hr.algebra.idlereservations.databinding.DialogEditReservationBinding
import hr.algebra.idlereservations.databinding.FragmentMyReservationsBinding
import hr.algebra.idlereservations.util.JwtManager
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class MyReservationsFragment : Fragment() {

    private var _binding: FragmentMyReservationsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MyReservationsViewModel by viewModels()
    private lateinit var adapter: ReservationAdapter

    private val isoFormatter     = DateTimeFormatter.ISO_LOCAL_DATE_TIME
    private val displayFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyReservationsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        observeViewModel()

        binding.swipeRefresh.setOnRefreshListener { loadReservations() }

        loadReservations()
    }

    private fun setupRecyclerView() {
        adapter = ReservationAdapter(
            onEdit   = { showEditDialog(it) },
            onCancel = { showCancelConfirmation(it) }
        )
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect { state ->
                        binding.swipeRefresh.isRefreshing = false
                        when (state) {
                            is MyReservationsViewModel.UiState.Loading -> {
                                binding.progressBar.visibility = View.VISIBLE
                                binding.recyclerView.visibility = View.GONE
                                binding.tvEmpty.visibility = View.GONE
                            }
                            is MyReservationsViewModel.UiState.Success -> {
                                binding.progressBar.visibility = View.GONE
                                if (state.reservations.isEmpty()) {
                                    binding.recyclerView.visibility = View.GONE
                                    binding.tvEmpty.visibility = View.VISIBLE
                                } else {
                                    binding.recyclerView.visibility = View.VISIBLE
                                    binding.tvEmpty.visibility = View.GONE
                                    adapter.submitList(state.reservations)
                                }
                            }
                            is MyReservationsViewModel.UiState.Error -> {
                                binding.progressBar.visibility = View.GONE
                                binding.recyclerView.visibility = View.GONE
                                binding.tvEmpty.visibility = View.VISIBLE
                                binding.tvEmpty.text = state.message
                            }
                        }
                    }
                }
                launch {
                    viewModel.event.collect { message ->
                        if (message != null) {
                            Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
                            viewModel.clearEvent()
                        }
                    }
                }
            }
        }
    }

    private fun loadReservations() {
        val userId = JwtManager.getUserId(requireContext())
        if (userId != null) {
            viewModel.loadReservations(userId)
        } else {
            binding.progressBar.visibility = View.GONE
            binding.tvEmpty.visibility = View.VISIBLE
            binding.tvEmpty.text = "Could not load user info"
        }
    }

    private fun showEditDialog(reservation: Reservation) {
        var selectedDateTime = try {
            LocalDateTime.parse(reservation.reservationDateTime, isoFormatter)
        } catch (e: Exception) {
            LocalDateTime.now()
        }

        val dialogBinding = DialogEditReservationBinding.inflate(layoutInflater)
        dialogBinding.etDateTime.setText(selectedDateTime.format(displayFormatter))
        dialogBinding.etPartySize.setText(reservation.partySize.toString())

        dialogBinding.etDateTime.setOnClickListener {
            val date = selectedDateTime.toLocalDate()
            DatePickerDialog(requireContext(), { _, year, month, day ->
                val time = selectedDateTime.toLocalTime()
                TimePickerDialog(requireContext(), { _, hour, minute ->
                    selectedDateTime = LocalDateTime.of(
                        LocalDate.of(year, month + 1, day),
                        LocalTime.of(hour, minute)
                    )
                    dialogBinding.etDateTime.setText(selectedDateTime.format(displayFormatter))
                }, time.hour, time.minute, true).show()
            }, date.year, date.monthValue - 1, date.dayOfMonth).show()
        }

        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Edit Reservation")
            .setView(dialogBinding.root)
            .setPositiveButton("Save") { _, _ ->
                val partySize = dialogBinding.etPartySize.text.toString().toIntOrNull()
                if (partySize == null || partySize < 1) {
                    Toast.makeText(requireContext(), "Invalid party size", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                viewModel.editReservation(
                    reservation  = reservation,
                    newDateTime  = selectedDateTime.format(isoFormatter),
                    newPartySize = partySize
                )
            }
            .setNegativeButton("Dismiss", null)
            .show()
    }

    private fun showCancelConfirmation(reservation: Reservation) {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Cancel Reservation")
            .setMessage("Cancel your reservation at ${reservation.restaurantName}?")
            .setPositiveButton("Yes, cancel") { _, _ ->
                viewModel.cancelReservation(reservation)
            }
            .setNegativeButton("No", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
