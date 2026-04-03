package hr.algebra.idlereservations.ui.reservation.booking

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import hr.algebra.idlereservations.data.model.RestaurantTable
import hr.algebra.idlereservations.databinding.FragmentBookingBinding
import hr.algebra.idlereservations.util.JwtManager
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Calendar

class BookingFragment : Fragment() {

    private var _binding: FragmentBookingBinding? = null
    private val binding get() = _binding!!

    private val viewModel: BookingViewModel by viewModels()

    private val isoFormatter     = DateTimeFormatter.ISO_LOCAL_DATE_TIME
    private val displayFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")
    private val timeFormatter    = DateTimeFormatter.ofPattern("HH:mm")
    private var selectedDateTime = LocalDateTime.now().plusDays(1).withMinute(0).withSecond(0).withNano(0)
    private var workingHours: String? = null
    private var selectedTable: RestaurantTable? = null
    private var selectedPartySize: Int = 0

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentBookingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val restaurantId   = arguments?.getInt("restaurantId") ?: return
        val restaurantName = arguments?.getString("restaurantName") ?: ""
        workingHours       = arguments?.getString("workingHours")?.takeIf { it.isNotBlank() }

        binding.tvRestaurantName.text = restaurantName
        binding.etDateTime.setText(selectedDateTime.format(displayFormatter))
        binding.etDateTime.setOnClickListener { showDateTimePicker() }

        viewModel.loadTables(restaurantId)

        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { observeTables() }
                launch { observeBooking() }
            }
        }

        binding.btnConfirm.setOnClickListener {
            val table = selectedTable
            if (table == null) {
                Toast.makeText(requireContext(), "Please select a table", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (selectedPartySize < 1) {
                Toast.makeText(requireContext(), "Please select party size", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val error = validateDateTime(selectedDateTime, workingHours)
            if (error != null) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }
            val userId = JwtManager.getUserId(requireContext())
            if (userId == null) {
                Toast.makeText(requireContext(), "Not logged in", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.book(userId, restaurantId, table.id, selectedDateTime.format(isoFormatter), selectedPartySize)
        }
    }

    private suspend fun observeTables() {
        viewModel.tablesState.collect { state ->
            when (state) {
                is BookingViewModel.TablesState.Loading -> {
                    binding.tilTable.isEnabled = false
                }
                is BookingViewModel.TablesState.Success -> {
                    binding.tilTable.isEnabled = true
                    setupTableDropdown(state.tables)
                }
                is BookingViewModel.TablesState.Error -> {
                    binding.tilTable.isEnabled = false
                    Toast.makeText(requireContext(), "Could not load tables: ${state.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private suspend fun observeBooking() {
        viewModel.uiState.collect { state ->
            when (state) {
                is BookingViewModel.UiState.Idle    -> setLoading(false)
                is BookingViewModel.UiState.Loading -> setLoading(true)
                is BookingViewModel.UiState.Success -> {
                    Toast.makeText(requireContext(), "Reservation confirmed!", Toast.LENGTH_SHORT).show()
                    findNavController().popBackStack()
                }
                is BookingViewModel.UiState.Error -> {
                    setLoading(false)
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setupTableDropdown(tables: List<RestaurantTable>) {
        val labels = tables.map { it.label }
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, labels)
        binding.dropdownTable.setAdapter(adapter)
        binding.dropdownTable.setOnItemClickListener { _, _, position, _ ->
            selectedTable = tables[position]
            setupPartySizeDropdown(tables[position].seats)
        }
    }

    private fun setupPartySizeDropdown(maxSeats: Int) {
        val sizes = (1..maxSeats).map { it.toString() }
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, sizes)
        binding.dropdownPartySize.setAdapter(adapter)
        binding.dropdownPartySize.isEnabled = true
        binding.dropdownPartySize.setText("", false)
        selectedPartySize = 0
        binding.dropdownPartySize.setOnItemClickListener { _, _, position, _ ->
            selectedPartySize = position + 1
        }
    }

    private fun showDateTimePicker() {
        val today = Calendar.getInstance()
        val date  = selectedDateTime.toLocalDate()

        val datePicker = DatePickerDialog(
            requireContext(),
            { _, year, month, day ->
                val time = selectedDateTime.toLocalTime()
                TimePickerDialog(requireContext(), { _, hour, minute ->
                    val picked = LocalDateTime.of(
                        LocalDate.of(year, month + 1, day),
                        LocalTime.of(hour, minute)
                    )
                    val error = validateDateTime(picked, workingHours)
                    if (error != null) {
                        Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
                    } else {
                        selectedDateTime = picked
                        binding.etDateTime.setText(selectedDateTime.format(displayFormatter))
                    }
                }, time.hour, time.minute, true).show()
            },
            date.year, date.monthValue - 1, date.dayOfMonth
        )
        datePicker.datePicker.minDate = today.timeInMillis
        datePicker.show()
    }

    private fun validateDateTime(dt: LocalDateTime, workingHours: String?): String? {
        if (dt.isBefore(LocalDateTime.now())) return "Cannot book in the past"
        if (workingHours.isNullOrBlank()) return null

        val parts = workingHours.split(" - ", " – ")
        if (parts.size != 2) return null

        return try {
            val open        = LocalTime.parse(parts[0].trim(), timeFormatter)
            val close       = LocalTime.parse(parts[1].trim(), timeFormatter)
            val book        = dt.toLocalTime()
            val lastBooking = close.minusHours(2)
            when {
                book.isBefore(open)       -> "Restaurant opens at ${parts[0].trim()}"
                book.isAfter(lastBooking) -> "Last booking is ${lastBooking.format(timeFormatter)} (2 hours before closing)"
                else                      -> null
            }
        } catch (_: Exception) { null }
    }

    private fun setLoading(loading: Boolean) {
        binding.btnConfirm.isEnabled   = !loading
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
