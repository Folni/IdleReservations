package hr.algebra.idlereservations.ui.restaurant

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import hr.algebra.idlereservations.data.model.Restaurant
import hr.algebra.idlereservations.databinding.ItemRestaurantBinding

class RestaurantAdapter(
    private val onClick: (Restaurant) -> Unit
) : ListAdapter<Restaurant, RestaurantAdapter.ViewHolder>(DiffCallback) {

    inner class ViewHolder(private val binding: ItemRestaurantBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(restaurant: Restaurant) {
            binding.tvName.text         = restaurant.name
            binding.tvAddress.text      = restaurant.address
            binding.tvWorkingHours.text = restaurant.workingHours ?: ""
            binding.root.setOnClickListener { onClick(restaurant) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemRestaurantBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) =
        holder.bind(getItem(position))

    private companion object DiffCallback : DiffUtil.ItemCallback<Restaurant>() {
        override fun areItemsTheSame(old: Restaurant, new: Restaurant) = old.id == new.id
        override fun areContentsTheSame(old: Restaurant, new: Restaurant) = old == new
    }
}
