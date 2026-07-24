<template>
    <div class="permission-card">

        <div class="d-flex justify-content-between align-items-center mb-3">

            <div>
                <h5 class="mb-1">
                    📍 {{ location.name }}
                </h5>

                <small class="text-muted">
                    {{ location.type }}
                </small>
            </div>

            <span
                class="badge fs-6 px-3 py-2"
                :class="statusClass"
            >
                {{ statusLabel }}
            </span>

        </div>

        <div class="mb-3">

            <label class="form-label fw-bold">
                Airspace Status
            </label>

            <select
                class="form-select"
                v-model="status"
            >
                <option value="green">
                    🟢 Open
                </option>

                <option value="yellow">
                    🟡 Pending
                </option>

                <option value="red">
                    🔴 Closed
                </option>
            </select>

        </div>

        <div class="mb-3">

            <label class="form-label fw-bold">
                Reason
            </label>

            <textarea
                rows="3"
                class="form-control"
                v-model="reason"
                placeholder="Reason for this status..."
            />

        </div>

        <div class="text-end">

            <button
                class="btn btn-primary"
                @click="save"
            >
                <i class="bi bi-check-circle me-1"></i>

                Save Permission

            </button>

        </div>

    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    location: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['save'])

const status = ref('')
const reason = ref('')

watch(
    () => props.location,
    (location) => {

        console.log(location) // leave this temporarily

        const permission = location.clearance_statuses?.[0]

        status.value = permission?.status ?? 'red'
        reason.value = permission?.reason ?? ''

    },
    { immediate: true }
)

const statusLabel = computed(() => {

    switch (status.value) {

        case 'green':
            return 'Open'

        case 'yellow':
            return 'Pending'

        default:
            return 'Closed'
    }

})

const statusClass = computed(() => {

    switch (status.value) {

        case 'green':
            return 'bg-success'

        case 'yellow':
            return 'bg-warning text-dark'

        default:
            return 'bg-danger'
    }

})

const save = () => {

    emit('save', {
        location: props.location,
        status: status.value,
        reason: reason.value
    })

}
</script>

<style scoped>
.permission-card{

    border:1px solid #e9ecef;

    border-radius:16px;

    padding:20px;

    background:#fff;

    transition:.25s;

    margin-bottom:20px;

}

.permission-card:hover{

    box-shadow:0 10px 30px rgba(0,0,0,.08);

    transform:translateY(-2px);

}
</style>