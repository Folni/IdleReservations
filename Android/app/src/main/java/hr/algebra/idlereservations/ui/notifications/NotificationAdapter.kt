package hr.algebra.idlereservations.ui.notifications

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import hr.algebra.idlereservations.data.model.NotificationDto
import hr.algebra.idlereservations.databinding.ItemNotificationBinding

class NotificationAdapter(
    private val onItemClick: (NotificationDto) -> Unit
) : ListAdapter<NotificationDto, NotificationAdapter.ViewHolder>(DiffCallback) {

    inner class ViewHolder(private val binding: ItemNotificationBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: NotificationDto) {
            binding.tvTitle.text   = item.title ?: "Notification"
            binding.tvMessage.text = item.message ?: ""
            binding.unreadDot.visibility = if (item.isRead) View.GONE else View.VISIBLE
            binding.root.alpha = if (item.isRead) 0.6f else 1f
            binding.root.setOnClickListener { onItemClick(item) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(
        ItemNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )

    override fun onBindViewHolder(holder: ViewHolder, position: Int) =
        holder.bind(getItem(position))

    companion object DiffCallback : DiffUtil.ItemCallback<NotificationDto>() {
        override fun areItemsTheSame(a: NotificationDto, b: NotificationDto) =
            a.notificationId == b.notificationId
        override fun areContentsTheSame(a: NotificationDto, b: NotificationDto) = a == b
    }
}
