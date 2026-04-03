package hr.algebra.idlereservations.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import hr.algebra.idlereservations.databinding.FragmentFilterBottomSheetBinding

class FilterBottomSheet : BottomSheetDialogFragment() {

    private var _binding: FragmentFilterBottomSheetBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFilterBottomSheetBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val openNow = arguments?.getBoolean(ARG_OPEN_NOW, false) ?: false
        val maxDist = arguments?.getInt(ARG_MAX_DIST, 0) ?: 0

        binding.switchOpenNow.isChecked = openNow
        binding.sliderDistance.value = maxDist.toFloat()
        updateDistanceLabel(maxDist)

        binding.sliderDistance.addOnChangeListener { _, value, _ ->
            updateDistanceLabel(value.toInt())
        }

        binding.btnClear.setOnClickListener {
            binding.switchOpenNow.isChecked = false
            binding.sliderDistance.value = 0f
            updateDistanceLabel(0)
        }

        binding.btnApply.setOnClickListener {
            val result = Bundle().apply {
                putBoolean(ARG_OPEN_NOW, binding.switchOpenNow.isChecked)
                putInt(ARG_MAX_DIST, binding.sliderDistance.value.toInt())
            }
            parentFragmentManager.setFragmentResult(RESULT_KEY, result)
            dismiss()
        }
    }

    private fun updateDistanceLabel(km: Int) {
        binding.tvDistanceValue.text = if (km == 0) "Any" else "$km km"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val RESULT_KEY = "filter_result"
        const val ARG_OPEN_NOW = "open_now"
        const val ARG_MAX_DIST = "max_dist_km"

        fun newInstance(openNow: Boolean, maxDistKm: Int) = FilterBottomSheet().apply {
            arguments = Bundle().apply {
                putBoolean(ARG_OPEN_NOW, openNow)
                putInt(ARG_MAX_DIST, maxDistKm)
            }
        }
    }
}
