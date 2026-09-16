<template>
    <div class="permission-card">

        <!-- Header -->
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


        <!-- Airspace Status -->
        <div class="mb-3">

            <label class="form-label fw-bold">
                Airspace Status
            </label>

            <select
                class="form-select"
                v-model="status"
                :class="statusSelectClass"
                @change="handleStatusChange"
            >

                <!-- ====================================== -->
                <!-- PERMISSION ACCOUNT -->
                <!-- ====================================== -->

                <template v-if="isPermission">

                    <!-- CLOSED → CAN REQUEST PENDING -->
                    <template v-if="currentStatus === 'red'">

                        <option value="red">
                            🔴 Closed
                        </option>

                        <option value="yellow">
                            🟡 Pending
                        </option>

                    </template>


                    <!-- PENDING → CANNOT CHANGE -->
                    <template v-else-if="currentStatus === 'yellow'">

                        <option
                            value="yellow"
                            disabled
                        >
                            🟡 Pending
                        </option>

                    </template>


                    <!-- OPEN → CANNOT CHANGE -->
                    <template v-else>

                        <option
                            value="green"
                            disabled
                        >
                            🟢 Open
                        </option>

                    </template>

                </template>


                <!-- ====================================== -->
                <!-- ARMY ACCOUNT -->
                <!-- ====================================== -->

                <template v-else-if="isArmy">

                    <!-- CURRENT STATUS = PENDING -->
                    <template v-if="currentStatus === 'yellow'">

                        <!-- Current status -->
                        <option
                            value="yellow"
                            disabled
                        >
                            🟡 Pending
                        </option>

                        <!-- Army decisions -->
                        <option value="green">
                            🟢 Open
                        </option>

                        <option value="red">
                            🔴 Closed
                        </option>

                    </template>


                    <!-- CURRENT STATUS = OPEN -->
                    <template v-else-if="currentStatus === 'green'">

                        <option
                            value="green"
                            disabled
                        >
                            🟢 Open
                        </option>

                    </template>


                    <!-- CURRENT STATUS = CLOSED -->
                    <template v-else>

                        <option
                            value="red"
                            disabled
                        >
                            🔴 Closed
                        </option>

                    </template>

                </template>


                <!-- ====================================== -->
                <!-- ADMIN -->
                <!-- ====================================== -->

                <template v-else>

                    <option value="green">
                        🟢 Open
                    </option>

                    <option value="yellow">
                        🟡 Pending
                    </option>

                    <option value="red">
                        🔴 Closed
                    </option>

                </template>

            </select>

        </div>


        <!-- Reason -->
        <div class="mb-3">

            <label class="form-label fw-bold">
                Reason
            </label>

            <textarea
                rows="3"
                class="form-control"
                v-model="reason"
                placeholder="Reason for this status..."
                @input="handleStatusChange"
            ></textarea>

        </div>

    </div>
</template>


<script setup>

import {
    computed,
    ref,
    watch
} from 'vue'

import { useAuthStore } from '~/stores/auth'


const authStore = useAuthStore()


/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

const props = defineProps({

    location: {
        type: Object,
        required: true
    }

})


/*
|--------------------------------------------------------------------------
| Emits
|--------------------------------------------------------------------------
*/

const emit = defineEmits([
    'statusChange'
])


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const status = ref('')
const reason = ref('')


/*
|--------------------------------------------------------------------------
| Current Status
|--------------------------------------------------------------------------
*/

const currentStatus = computed(() => {

    return (
        props.location.clearance_statuses?.[0]?.status
        ?? 'red'
    )

})


/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

const isPermission = computed(() => {

    return authStore.isPermission

})


const isArmy = computed(() => {

    return authStore.isArmy

})


/*
|--------------------------------------------------------------------------
| Load Current Permission
|--------------------------------------------------------------------------
*/

watch(

    () => props.location,

    (location) => {

        const permission =
            location.clearance_statuses?.[0]

        status.value =
            permission?.status ?? 'red'

        reason.value =
            permission?.reason ?? ''

    },

    {
        immediate: true,
        deep: true
    }

)


/*
|--------------------------------------------------------------------------
| Status Label
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Badge Class
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Select Class
|--------------------------------------------------------------------------
*/

const statusSelectClass = computed(() => {

    switch (status.value) {

        case 'green':
            return 'is-valid'

        case 'yellow':
            return 'is-warning'

        default:
            return 'is-danger'

    }

})


/*
|--------------------------------------------------------------------------
| Notify Parent About Changes
|--------------------------------------------------------------------------
*/

const handleStatusChange = () => {

    emit('statusChange', {

        location: props.location,

        status: status.value,

        reason: reason.value

    })

}

</script>


<style scoped>

.permission-card {

    border: 1px solid #e9ecef;

    border-radius: 16px;

    padding: 20px;

    background: #fff;

    transition: .25s;

    margin-bottom: 20px;

}


.permission-card:hover {

    box-shadow: 0 10px 30px rgba(0,0,0,.08);

    transform: translateY(-2px);

}


/* Status select styling */

:deep(.form-select.is-valid) {

    border-color: #198754;

    background-color: #f0fff4;

}


:deep(.form-select.is-warning) {

    border-color: #ffc107;

    background-color: #fffbf0;

}


:deep(.form-select.is-danger) {

    border-color: #dc3545;

    background-color: #fff0f0;

}


/* Badge */

.badge {

    transition: all 0.3s ease;

}


.badge.bg-success {

    animation: pulse-green 2s infinite;

}


.badge.bg-warning {

    animation: pulse-yellow 2s infinite;

}


/* Green animation */

@keyframes pulse-green {

    0% {

        box-shadow:
            0 0 0 0
            rgba(25, 135, 84, 0.4);

    }

    70% {

        box-shadow:
            0 0 0 6px
            rgba(25, 135, 84, 0);

    }

    100% {

        box-shadow:
            0 0 0 0
            rgba(25, 135, 84, 0);

    }

}


/* Yellow animation */

@keyframes pulse-yellow {

    0% {

        box-shadow:
            0 0 0 0
            rgba(255, 193, 7, 0.4);

    }

    70% {

        box-shadow:
            0 0 0 6px
            rgba(255, 193, 7, 0);

    }

    100% {

        box-shadow:
            0 0 0 0
            rgba(255, 193, 7, 0);

    }

}

</style>