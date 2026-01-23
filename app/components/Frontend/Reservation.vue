<!-- pages/reservation.vue -->
<template>
  <div class="reservation-page">
    <div class="container py-5">
      <h1 class="text-center mb-4">Reserve Flying Location</h1>
      
      <div class="reservation-card">
        <form @submit.prevent="submitReservation">
          <!-- Location Selection -->
          <div class="mb-4">
            <label class="form-label">Select Location</label>
            <select v-model="form.location" class="form-select" required>
              <option value="">Choose a location</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }}
              </option>
            </select>
          </div>

          <!-- Date Selection -->
          <div class="mb-4">
            <label class="form-label">Date</label>
            <input 
              v-model="form.date" 
              type="date" 
              class="form-control" 
              :min="minDate"
              required
            >
          </div>

          <!-- Time Slot Selection -->
          <div class="mb-4">
            <label class="form-label">Time Slot</label>
            <div class="time-slots">
              <div 
                v-for="slot in timeSlots" 
                :key="slot.value"
                class="time-slot-option"
                :class="{ 'selected': form.timeSlot === slot.value, 'unavailable': !slot.available }"
                @click="selectTimeSlot(slot)"
              >
                {{ slot.label }}
                <span v-if="!slot.available" class="unavailable-badge">Booked</span>
              </div>
            </div>
          </div>

          <!-- Pilot Information -->
          <div class="mb-4">
            <label class="form-label">Pilot Name</label>
            <input v-model="form.pilotName" type="text" class="form-control" required>
          </div>

          <!-- Contact Information -->
          <div class="mb-4">
            <label class="form-label">Contact Number</label>
            <input v-model="form.contactNumber" type="tel" class="form-control" required>
          </div>

          
          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span v-if="!isSubmitting">
              <i class="bi bi-check-circle me-2"></i> Confirm Reservation
            </span>
            <span v-else>
              <i class="bi bi-arrow-clockwise me-2"></i> Processing...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isSubmitting = ref(false)

const form = ref({
  location: '',
  date: '',
  timeSlot: '',
  pilotName: '',
  contactNumber: '',
  aircraftType: '',
  notes: ''
})

const locations = ref([
  { id: '1', name: 'Main Field - North Side' },
  { id: '2', name: 'Secondary Field - South Side' },
  { id: '3', name: 'Training Area - East' },
  { id: '4', name: 'Advanced Area - West' }
])

const timeSlots = ref([
  { label: 'Morning (8:00 AM - 12:00 PM)', value: 'morning', available: true },
  { label: 'Afternoon (1:00 PM - 5:00 PM)', value: 'afternoon', available: false },
  { label: 'Evening (5:00 PM - 8:00 PM)', value: 'evening', available: true },
  { label: 'Full Day (8:00 AM - 8:00 PM)', value: 'fullDay', available: true }
])

const minDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() + 1) // Can only book from tomorrow
  return today.toISOString().split('T')[0]
})

const selectTimeSlot = (slot) => {
  if (slot.available) {
    form.value.timeSlot = slot.value
  }
}

const submitReservation = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real app, send to backend
    console.log('Reservation submitted:', form.value)
    
    // Show success message
    alert('Reservation confirmed successfully! You will receive a confirmation email shortly.')
    
    // Reset form
    form.value = {
      location: '',
      date: '',
      timeSlot: '',
      pilotName: '',
      contactNumber: '',
      aircraftType: '',
      notes: ''
    }
    
    // Navigate to home or confirmation page
    await navigateTo('/')
    
  } catch (error) {
    console.error('Error submitting reservation:', error)
    alert('Failed to submit reservation. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.reservation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.reservation-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: block;
}

.form-control, .form-select {
  padding: 1rem 1rem;
  border: 2px solid #dee2e6;
  transition: all 0.3s;
}

.form-control:focus, .form-select:focus {
  border-color: darkgreen;
  box-shadow: 0 0 0 0.25rem rgba(0, 100, 0, 0.1);
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.time-slot-option {
  padding: 0.5rem;
  border: 2px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  text-align: center;
}

.time-slot-option:hover:not(.unavailable) {
  border-color: darkgreen;
  background-color: rgba(0, 100, 0, 0.05);
}

.time-slot-option.selected {
  border-color: darkgreen;
  background-color: rgba(0, 100, 0, 0.1);
  font-weight: 600;
}

.time-slot-option.unavailable {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f8f9fa;
}

.unavailable-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, darkgreen, #2e7d32);
  color: white;
  border: none;
  padding: 1.4rem 2rem;
  font-weight: 600;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2e7d32, darkgreen);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 100, 0, 0.3);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.bi-arrow-clockwise {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .reservation-card {
    padding: 1.5rem;
  }
  
  .time-slots {
    grid-template-columns: 1fr;
  }
}
</style>