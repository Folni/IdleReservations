package hr.algebra.idlereservations.ui.reservation.myreservations

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import hr.algebra.idlereservations.data.model.Reservation
import hr.algebra.idlereservations.data.model.ReservationStatus
import hr.algebra.idlereservations.databinding.ItemReservationBinding
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class ReservationAdapter(
    private val onEdit:   (Reservation) -> Unit,
    private val onCancel: (Reservation) -> Unit
) : ListAdapter<Reservation, ReservationAdapter.ViewHolder>(DiffCallback) {

    private val displayFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")
    private val isoFormatter     = DateTimeFormatter.ISO_DATE_TIME

    inner class ViewHolder(private val binding: ItemReservationBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(reservation: Reservation) {
            binding.tvRestaurantName.text = reservation.restaurantName
            binding.tvAddress.text        = reservation.restaurantAddress
            binding.tvPartySize.text      = "Party of ${reservation.partySize}"
            binding.tvSeats.text          = "Table: ${reservation.tableSeats} seats"

            binding.tvDateTime.text = try {
                val dt = LocalDateTime.parse(reservation.reservationDateTime, isoFormatter)
                dt.format(displayFormatter)
            } catch (e: Exception) {
                reservation.reservationDateTime
            }

            val (label, color) = when (reservation.status) {
                ReservationStatus.CONFIRMED -> "Confirmed" to Color.parseColor("#1D9E75")
                ReservationStatus.PENDING   -> "Pending"   to Color.parseColor("#BA7517")
                ReservationStatus.CANCELLED -> "Cancelled" to Color.parseColor("#E24B4A")
                ReservationStatus.UNKNOWN   -> "Unknown"   to Color.GRAY
            }
            binding.tvStatus.text = label
            binding.tvStatus.setTextColor(color)


            val isActive = reservation.status != ReservationStatus.CANCELLED
            binding.btnEdit.isEnabled   = isActive
            binding.btnCancel.isEnabled = isActive
            binding.btnEdit.alpha       = if (isActive) 1f else 0.4f
            binding.btnCancel.alpha     = if (isActive) 1f else 0.4f

            binding.btnEdit.setOnClickListener   { onEdit(reservation) }
            binding.btnCancel.setOnClickListener { onCancel(reservation) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemReservationBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    private companion object DiffCallback : DiffUtil.ItemCallback<Reservation>() {
        override fun areItemsTheSame(old: Reservation, new: Reservation) =
            old.reservationId == new.reservationId

        override fun areContentsTheSame(old: Reservation, new: Reservation) =
            old == new
    }
}
