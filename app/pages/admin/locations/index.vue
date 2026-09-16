<template>

    <div class="flying-locations-admin">

        <!-- ===================================================== -->
        <!-- HEADER -->
        <!-- ===================================================== -->

        <div class="dashboard-header mb-6 shadow-sm p-4 bg-white">

            <div class="d-flex justify-content-between align-items-center">

                <div>

                    <h1 class="display-6 fw-bold text-dark mb-2">

                        <i class="bi bi-geo-alt me-3 text-primary"></i>

                        Flying Locations Management

                    </h1>

                    <div class="d-flex align-items-center gap-3">

                        <p class="text-muted mb-0">

                            <i class="bi bi-info-circle me-1"></i>

                            Manage flying locations,
                            coordinates,
                            allowed sports,
                            and QR access.

                        </p>

                        <span class="badge bg-primary-subtle text-primary">

                            {{ pagination.total }} locations

                        </span>

                    </div>

                </div>


                <!-- Add Location -->
                <button
                    v-if="authStore.isAdmin"
                    class="btn btn-primary"
                    @click="openCreateModal"
                >

                    <i class="bi bi-plus-circle me-1"></i>

                    Add Location

                </button>

            </div>

        </div>


        <!-- ===================================================== -->
        <!-- CONTENT -->
        <!-- ===================================================== -->

        <div
            v-if="!loading"
            class="container-fluid px-4"
        >


            <!-- ================================================= -->
            <!-- SEARCH -->
            <!-- ================================================= -->

            <div class="card border-0 shadow-sm mb-4">

                <div class="card-body">

                    <div class="input-group">

                        <span
                            class="input-group-text bg-white border-end-0"
                        >

                            <i class="bi bi-search text-muted"></i>

                        </span>

                        <input
                            v-model="searchQuery"
                            type="text"
                            class="form-control border-start-0"
                            placeholder="Search by name, type, or coordinates..."
                            @input="handleSearch"
                        >

                    </div>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- CALENDAR + DATE INFORMATION -->
            <!-- ================================================= -->

            <div class="row mb-4">


                <!-- Calendar -->

                <div class="col-lg-7">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <PermissionCalendar
                                :selectedDate="selectedDate"
                                :locations="locations"
                                @dateSelected="onDateSelected"
                            />

                        </div>

                    </div>

                </div>


                <!-- Information -->

                <div class="col-lg-5">

                    <div class="card border-0 shadow-sm h-100">

                        <div class="card-body">

                            <h5 class="fw-bold mb-4">
                                Selected Date
                            </h5>

                            <h3 class="text-primary">

                                {{ formattedSelectedDate }}

                            </h3>

                            <hr>


                            <!-- Counters -->

                            <div class="row text-center mt-4">


                                <!-- Open -->

                                <div class="col-4">

                                    <div
                                        class="bg-success text-white rounded p-3"
                                    >

                                        <h3>
                                            {{ openCount }}
                                        </h3>

                                        <small>
                                            Open
                                        </small>

                                    </div>

                                </div>


                                <!-- Pending -->

                                <div class="col-4">

                                    <div
                                        class="bg-warning rounded p-3"
                                    >

                                        <h3>
                                            {{ pendingCount }}
                                        </h3>

                                        <small>
                                            Pending
                                        </small>

                                    </div>

                                </div>


                                <!-- Closed -->

                                <div class="col-4">

                                    <div
                                        class="bg-danger text-white rounded p-3"
                                    >

                                        <h3>
                                            {{ closedCount }}
                                        </h3>

                                        <small>
                                            Closed
                                        </small>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- DAILY AIRSPACE PERMISSIONS -->
            <!-- ================================================= -->

            <div class="card border-0 shadow-sm mb-4">


                <!-- HEADER -->

                <div class="card-header bg-white">

                    <div
                        class="d-flex justify-content-between align-items-center"
                    >

                        <div>

                            <h4 class="mb-0">

                                Daily Airspace Permissions

                            </h4>

                            <small class="text-muted">

                                Change the statuses and save all changes
                                together.

                            </small>

                        </div>


                        <!-- ONE SAVE BUTTON -->

                        <button
                            type="button"
                            class="btn btn-primary"
                            :disabled="
                                saving ||
                                Object.keys(pendingStatusChanges).length === 0
                            "
                            @click="saveAllStatuses"
                        >

                            <span
                                v-if="saving"
                                class="spinner-border spinner-border-sm me-2"
                            ></span>

                            <i
                                v-else
                                class="bi bi-check-circle me-1"
                            ></i>

                            {{
                                saving
                                    ? 'Saving...'
                                    : 'Save All Statuses'
                            }}

                        </button>

                    </div>

                </div>


                <!-- CARDS -->

                <div class="card-body">

                    <div class="row">


                        <div
                            v-for="location in locations"
                            :key="location.id"
                            class="col-lg-6 mb-4"
                        >

                            <PermissionCard
                                :location="location"
                                @statusChange="handleStatusChange"
                            />

                        </div>


                    </div>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- LOCATIONS TABLE -->
            <!-- ================================================= -->

            <div class="card border-0 shadow-sm">

                <div class="table-responsive">

                    <table
                        class="table table-hover align-middle mb-0"
                    >

                        <thead class="table-light">

                            <tr>

                                <th class="ps-4">
                                    Location & Type
                                </th>

                                <th class="text-center">
                                    Allowed Sports
                                </th>

                                <th class="text-center">
                                    Status
                                </th>

                                <th class="text-center">
                                    QR Code
                                </th>

                                <th class="text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr
                                v-for="location in locations"
                                :key="location.id"
                            >

                                <td class="ps-4">

                                    <div class="fw-bold">
                                        {{ location.name }}
                                    </div>

                                    <span
                                        class="badge bg-info-subtle text-info small"
                                    >
                                        {{ location.type }}
                                    </span>

                                </td>


                                <td class="text-center">

                                    <div
                                        class="d-flex flex-wrap justify-content-center gap-1"
                                    >

                                        <span
                                            v-for="sport in location.sports"
                                            :key="sport.id"
                                            class="badge bg-secondary-subtle text-secondary border small"
                                        >

                                            {{ sport.name }}

                                        </span>


                                        <span
                                            v-if="!location.sports?.length"
                                            class="text-muted small italic"
                                        >

                                            None

                                        </span>

                                    </div>

                                </td>


                                <td class="text-center">

                                    <span
                                        :class="
                                            `status-badge-modern ${
                                                getCurrentStatus(location).status
                                            }`
                                        "
                                    >

                                        <span class="pulse-dot"></span>

                                        {{
                                            getCurrentStatus(location).label
                                        }}

                                    </span>

                                </td>


                                <td class="text-center">

                                    <button
                                        v-if="location.qr_code"
                                        class="btn btn-sm btn-success shadow-sm"
                                        @click="showQRCode(location)"
                                    >

                                        <i class="bi bi-qr-code"></i>

                                        View QR

                                    </button>


                                    <button
                                        v-else
                                        class="btn btn-sm btn-outline-primary"
                                        @click="generateQRCode(location)"
                                        :disabled="
                                            generatingId === location.id
                                        "
                                    >

                                        <span
                                            v-if="
                                                generatingId === location.id
                                            "
                                            class="spinner-border spinner-border-sm me-1"
                                        ></span>

                                        <i
                                            v-else
                                            class="bi bi-plus-circle"
                                        ></i>

                                        Generate QR

                                    </button>

                                </td>


                                <td class="text-center">

                                    <div class="btn-group">

                                        <button
                                            v-if="authStore.isAdmin"
                                            class="btn btn-sm btn-light border"
                                            @click="editLocation(location)"
                                        >

                                            <i class="bi bi-pencil"></i>

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <!-- ===================================================== -->
        <!-- CREATE / EDIT MODAL -->
        <!-- ===================================================== -->

        <div
            v-if="showCreateModal"
            class="modal fade show d-block"
            @click.self="closeModal"
        >

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content border-0 shadow-lg">


                    <div class="modal-header bg-dark text-white">

                        <h5 class="modal-title">

                            {{
                                editingLocation
                                    ? 'Edit Location'
                                    : 'Create Location'
                            }}

                        </h5>

                        <button
                            type="button"
                            class="btn-close btn-close-white"
                            @click="closeModal"
                        ></button>

                    </div>


                    <form @submit.prevent="saveLocation">

                        <div
                            class="modal-body custom-scrollbar"
                            style="max-height: 70vh; overflow-y: auto;"
                        >

                            <div class="row g-3">


                                <!-- Name -->

                                <div class="col-md-6">

                                    <label
                                        class="form-label fw-bold"
                                    >
                                        Name
                                    </label>

                                    <input
                                        v-model="form.name"
                                        type="text"
                                        :class="[
                                            'form-control',
                                            {
                                                'is-invalid':
                                                    validationErrors.name
                                            }
                                        ]"
                                    >

                                    <div
                                        v-if="validationErrors.name"
                                        class="invalid-feedback"
                                    >

                                        {{
                                            validationErrors.name[0]
                                        }}

                                    </div>

                                </div>


                                <!-- Type -->

                                <div class="col-md-6">

                                    <label
                                        class="form-label fw-bold"
                                    >
                                        Type
                                    </label>

                                    <input
                                        v-model="form.type"
                                        type="text"
                                        :class="[
                                            'form-control',
                                            {
                                                'is-invalid':
                                                    validationErrors.type
                                            }
                                        ]"
                                    >

                                    <div
                                        v-if="validationErrors.type"
                                        class="invalid-feedback"
                                    >

                                        {{
                                            validationErrors.type[0]
                                        }}

                                    </div>

                                </div>


                                <!-- Allowed Sports -->

                                <div class="col-md-12">

                                    <label
                                        class="form-label fw-bold d-block"
                                    >
                                        Allowed Sports
                                    </label>

                                    <div
                                        class="d-flex flex-wrap gap-3 p-3 bg-light rounded border"
                                    >

                                        <div
                                            v-for="sport in availableSports"
                                            :key="sport.id"
                                            class="form-check"
                                        >

                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                :id="
                                                    'sport-' + sport.id
                                                "
                                                :value="sport.id"
                                                v-model="form.sports"
                                            >

                                            <label
                                                class="form-check-label"
                                                :for="
                                                    'sport-' + sport.id
                                                "
                                            >

                                                {{ sport.name }}

                                            </label>

                                        </div>


                                        <div
                                            v-if="
                                                availableSports.length === 0
                                            "
                                            class="text-muted small"
                                        >

                                            Loading sports...

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-light"
                                @click="closeModal"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                class="btn btn-primary"
                                :disabled="saving"
                            >

                                <span
                                    v-if="saving"
                                    class="spinner-border spinner-border-sm me-1"
                                ></span>

                                Save Location

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>


        <!-- ===================================================== -->
        <!-- QR MODAL -->
        <!-- ===================================================== -->

        <div
            v-if="showQRModal"
            class="modal fade show d-block"
            @click.self="closeQRModal"
        >

            <div
                class="modal-dialog modal-sm modal-dialog-centered"
            >

                <div
                    class="modal-content border-0 shadow-lg"
                >

                    <div class="modal-header">

                        <h5 class="modal-title">

                            <i class="bi bi-qr-code me-2"></i>

                            QR Access

                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            @click="closeQRModal"
                        ></button>

                    </div>


                    <div class="modal-body text-center">

                        <div
                            class="p-3 bg-white border rounded"
                        >

                            <canvas
                                ref="qrCodeRef"
                                class="img-fluid"
                            ></canvas>

                            <h6 class="mt-3 fw-bold">

                                {{ selectedLocation?.name }}

                            </h6>

                            <p class="text-muted small">

                                Token:
                                {{ selectedLocation?.qr_code?.token }}

                            </p>

                        </div>

                    </div>


                    <div class="modal-footer">

                        <button
                            class="btn btn-primary w-100"
                            @click="downloadQR"
                        >

                            Download PNG

                        </button>

                    </div>

                </div>

            </div>

        </div>


        <div
            v-if="showCreateModal || showQRModal"
            class="modal-backdrop fade show"
            @click="closeModal"
        ></div>

    </div>

</template>


<script setup>

import {
    ref,
    reactive,
    onMounted,
    nextTick,
    computed
} from 'vue'

import QRCode from 'qrcode'

import { useAuthStore } from '~/stores/auth'

import { useDebounceFn } from '@vueuse/core'

import PermissionCalendar
    from '~/components/admin/PermissionCalendar.vue'

import PermissionCard
    from '~/components/admin/PermissionCard.vue'

import {
    useStatusNotifications
} from '~/composables/useStatusNotifications'


definePageMeta({
    layout: 'admin'
})


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

const {
    addNotification
} = useStatusNotifications()


/*
|--------------------------------------------------------------------------
| Auth / Config
|--------------------------------------------------------------------------
*/

const authStore = useAuthStore()

const config = useRuntimeConfig()

const nuxtApp = useNuxtApp()


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const locations = ref([])

const availableSports = ref([])

const validationErrors = ref({})

const loading = ref(false)

const saving = ref(false)

const showCreateModal = ref(false)

const showQRModal = ref(false)

const editingLocation = ref(null)

const selectedLocation = ref(null)

const qrCodeRef = ref(null)

const searchQuery = ref('')

const generatingId = ref(null)

const pagination = reactive({
    total: 0
})


const selectedDate = ref(
    new Date()
        .toISOString()
        .split('T')[0]
)


/*
|--------------------------------------------------------------------------
| PENDING STATUS CHANGES
|--------------------------------------------------------------------------
|
| Changes are kept here until the user clicks
| "Save All Statuses".
|
*/

const pendingStatusChanges = ref({})


/*
|--------------------------------------------------------------------------
| Handle Status Change
|--------------------------------------------------------------------------
*/

const handleStatusChange = (data) => {

    const originalPermission =
        data.location?.clearance_statuses?.[0]

    const originalStatus =
        originalPermission?.status ?? 'red'

    const originalReason =
        originalPermission?.reason ?? ''


    /*
    |--------------------------------------------------------------------------
    | If the user changed it back to the original value,
    | remove it from pending changes.
    |--------------------------------------------------------------------------
    */

    if (
        data.status === originalStatus &&
        data.reason === originalReason
    ) {

        delete pendingStatusChanges.value[
            data.location.id
        ]

        return
    }


    /*
    |--------------------------------------------------------------------------
    | Store pending change
    |--------------------------------------------------------------------------
    */

    pendingStatusChanges.value[
        data.location.id
    ] = {

        location: data.location,

        status: data.status,

        reason: data.reason

    }

}


/*
|--------------------------------------------------------------------------
| Save ALL Statuses
|--------------------------------------------------------------------------
*/

const saveAllStatuses = async () => {

    const changes =
        Object.values(
            pendingStatusChanges.value
        )


    if (!changes.length) {
        return
    }


    saving.value = true


    try {

        const headers = {

            Authorization:
                `Bearer ${authStore.token}`

        }


        /*
        |--------------------------------------------------------------------------
        | Save every changed location
        |--------------------------------------------------------------------------
        */

        for (const data of changes) {

            const permission =
                data.location?.clearance_statuses?.find(
                    p =>
                        p.permission_date ===
                        selectedDate.value
                )


            /*
            |--------------------------------------------------------------------------
            | UPDATE
            |--------------------------------------------------------------------------
            */

            if (permission?.id) {

                await $fetch(

                    `${config.public.apiBase}/admin/clearance-statuses/${permission.id}`,

                    {

                        method: 'PATCH',

                        headers,

                        body: {

                            status:
                                data.status,

                            reason:
                                data.reason

                        }

                    }

                )

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE
            |--------------------------------------------------------------------------
            */

            else {

                await $fetch(

                    `${config.public.apiBase}/admin/clearance-statuses`,

                    {

                        method: 'POST',

                        headers,

                        body: {

                            flying_location_id:
                                data.location.id,

                            permission_date:
                                selectedDate.value,

                            status:
                                data.status,

                            reason:
                                data.reason

                        }

                    }

                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Clear pending changes
        |--------------------------------------------------------------------------
        */

        pendingStatusChanges.value = {}


        /*
        |--------------------------------------------------------------------------
        | Refresh data
        |--------------------------------------------------------------------------
        */

        await fetchLocations()


        notify(
            'success',
            'All airspace statuses saved successfully.'
        )


    } catch (error) {

        console.error(
            'SAVE ALL STATUSES ERROR:',
            error
        )


        notify(
            'error',
            error?.data?.message ||
            'Unable to save airspace statuses.'
        )


    } finally {

        saving.value = false

    }

}


/*
|--------------------------------------------------------------------------
| Location Coordinates
|--------------------------------------------------------------------------
*/

const locationLatitude = computed(() => {

    if (editingLocation.value) {

        return editingLocation.value.latitude ?? ''

    }

    return ''

})


const locationLongitude = computed(() => {

    if (editingLocation.value) {

        return editingLocation.value.longitude ?? ''

    }

    return ''

})


/*
|--------------------------------------------------------------------------
| Location Form
|--------------------------------------------------------------------------
*/

const form = reactive({

    name: '',

    type: '',

    is_enabled: true,

    sports: []

})


/*
|--------------------------------------------------------------------------
| Date Selected
|--------------------------------------------------------------------------
*/

const onDateSelected = (date) => {

    /*
    |--------------------------------------------------------------------------
    | Clear unsaved changes when changing date
    |--------------------------------------------------------------------------
    */

    pendingStatusChanges.value = {}

    selectedDate.value = date

    fetchLocations()

}


/*
|--------------------------------------------------------------------------
| Formatted Date
|--------------------------------------------------------------------------
*/

const formattedSelectedDate = computed(() => {

    return new Date(
        selectedDate.value
    ).toLocaleDateString(

        'en-US',

        {

            weekday: 'long',

            year: 'numeric',

            month: 'long',

            day: 'numeric'

        }

    )

})


/*
|--------------------------------------------------------------------------
| Counters
|--------------------------------------------------------------------------
*/

const openCount = computed(() =>

    locations.value.filter(

        location =>

            getCurrentStatus(location).status ===
            'green'

    ).length

)


const pendingCount = computed(() =>

    locations.value.filter(

        location =>

            getCurrentStatus(location).status ===
            'yellow'

    ).length

)


const closedCount = computed(() =>

    locations.value.filter(

        location =>

            getCurrentStatus(location).status ===
            'red'

    ).length

)


/*
|--------------------------------------------------------------------------
| Notification Helper
|--------------------------------------------------------------------------
*/

const notify = (type, message) => {

    if (!process.client) {
        return
    }


    try {

        if (
            nuxtApp.$toast &&
            typeof nuxtApp.$toast[type] ===
            'function'
        ) {

            nuxtApp.$toast[type](message)

        } else {

            alert(
                `${type.toUpperCase()}: ${message}`
            )

        }

    } catch (e) {

        alert(
            `${type.toUpperCase()}: ${message}`
        )

    }

}


/*
|--------------------------------------------------------------------------
| Status Notification
|--------------------------------------------------------------------------
*/

const showStatusNotification = (
    location,
    oldStatus,
    newStatus,
    changedByRole,
    permissionDate
) => {

    if (
        oldStatus === newStatus
    ) {

        return

    }


    const formattedDate =
        new Date(permissionDate)
            .toLocaleDateString(

                'en-US',

                {

                    month: 'short',

                    day: 'numeric',

                    year: 'numeric'

                }

            )


    /*
    |--------------------------------------------------------------------------
    | Army → Permission
    |--------------------------------------------------------------------------
    */

    if (

        changedByRole === 'army' &&
        authStore.isPermission

    ) {

        addNotification({

            title:
                'Army Status Update',

            message:

                `${location.name} — ${formattedDate} changed from ` +

                `${getStatusLabel(oldStatus)} to ` +

                `${getStatusLabel(newStatus)}.`

        })

        return

    }


    /*
    |--------------------------------------------------------------------------
    | Permission → Army
    |--------------------------------------------------------------------------
    */

    if (

        changedByRole === 'permission' &&
        authStore.isArmy

    ) {

        addNotification({

            title:
                'Permission Status Update',

            message:

                `${location.name} — ${formattedDate} changed from ` +

                `${getStatusLabel(oldStatus)} to ` +

                `${getStatusLabel(newStatus)}.`

        })

    }

}


const getStatusLabel = (status) => {

    switch (status) {

        case 'green':
            return 'Open'

        case 'yellow':
            return 'Pending'

        case 'red':
            return 'Closed'

        default:
            return 'Unknown'

    }

}


/*
|--------------------------------------------------------------------------
| Fetch Locations
|--------------------------------------------------------------------------
*/

const fetchLocations = async ({
    silent = false
} = {}) => {

    if (!silent) {

        loading.value = true

    }


    try {

        const res = await $fetch(

            `${config.public.apiBase}/admin/flying-locations`,

            {

                query: {

                    date:
                        selectedDate.value,

                    search:
                        searchQuery.value

                },

                headers: {

                    Authorization:
                        `Bearer ${authStore.token}`

                }

            }

        )


        const newLocations =
            res.data || []


        locations.value =
            newLocations


        pagination.total =
            newLocations.length


    } catch (error) {

        console.error(
            'FETCH LOCATIONS ERROR:',
            error
        )

    } finally {

        if (!silent) {

            loading.value = false

        }

    }

}


/*
|--------------------------------------------------------------------------
| Fetch Sports
|--------------------------------------------------------------------------
*/

const fetchSports = async () => {

    try {

        const res = await $fetch(

            `${config.public.apiBase}/sports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${authStore.token}`

                }

            }

        )


        availableSports.value =
            res.data || res


    } catch (err) {

        console.error(
            'Sports load failed',
            err
        )

    }

}


/*
|--------------------------------------------------------------------------
| Validate Location Form
|--------------------------------------------------------------------------
*/

const validateForm = () => {

    validationErrors.value = {}


    if (!form.name?.trim()) {

        validationErrors.value.name = [
            'Location name is required'
        ]

    }


    if (!form.type?.trim()) {

        validationErrors.value.type = [
            'Location type is required'
        ]

    }


    return Object.keys(
        validationErrors.value
    ).length === 0

}


/*
|--------------------------------------------------------------------------
| Save Location
|--------------------------------------------------------------------------
*/

const saveLocation = async () => {

    validationErrors.value = {}


    if (!validateForm()) {

        notify(
            'error',
            'Please fix validation errors'
        )

        return

    }


    saving.value = true


    const isEditing =
        !!editingLocation.value


    try {

        const locationUrl =
            isEditing

                ? `${config.public.apiBase}/admin/flying-locations/${editingLocation.value.id}`

                : `${config.public.apiBase}/admin/flying-locations`


        const locationResponse =
            await $fetch(

                locationUrl,

                {

                    method:
                        isEditing
                            ? 'PUT'
                            : 'POST',

                    headers: {

                        Authorization:
                            `Bearer ${authStore.token}`

                    },

                    body: form

                }

            )


        notify(
            'success',
            'Location saved successfully'
        )


        closeModal()


        await fetchLocations()


    } catch (error) {

        console.error(error)


        if (error.status === 422) {

            validationErrors.value =
                error.data?.errors || {}

        }


        notify(

            'error',

            error.data?.message ||
            'Server Error'

        )

    } finally {

        saving.value = false

    }

}


/*
|--------------------------------------------------------------------------
| Open Create Modal
|--------------------------------------------------------------------------
*/

const openCreateModal = () => {

    editingLocation.value = null

    resetForm()

    validationErrors.value = {}

    showCreateModal.value = true

}


/*
|--------------------------------------------------------------------------
| Edit Location
|--------------------------------------------------------------------------
*/

const editLocation = (location) => {

    editingLocation.value =
        location


    validationErrors.value =
        {}


    Object.assign(

        form,

        {

            name:
                location.name ?? '',

            type:
                location.type ?? '',

            is_enabled:
                location.is_enabled ?? true,

            sports:
                location.sports?.map(
                    sport => sport.id
                ) ?? []

        }

    )


    showCreateModal.value =
        true

}


/*
|--------------------------------------------------------------------------
| Close Modal
|--------------------------------------------------------------------------
*/

const closeModal = () => {

    showCreateModal.value =
        false

    editingLocation.value =
        null

    resetForm()

}


/*
|--------------------------------------------------------------------------
| Reset Form
|--------------------------------------------------------------------------
*/

const resetForm = () => {

    Object.assign(

        form,

        {

            name: '',

            type: '',

            is_enabled: true,

            sports: []

        }

    )

}


/*
|--------------------------------------------------------------------------
| QR Code
|--------------------------------------------------------------------------
*/

const showQRCode = async (location) => {

    selectedLocation.value =
        location

    showQRModal.value =
        true


    await nextTick()


    if (

        location.qr_code?.token &&
        qrCodeRef.value

    ) {

        const url =
            `${window.location.origin}/location/${location.slug}?token=${location.qr_code.token}`


        QRCode.toCanvas(

            qrCodeRef.value,

            url,

            {

                width: 220,

                margin: 2

            }

        )

    }

}


const generateQRCode = async (location) => {

    generatingId.value =
        location.id


    try {

        const res = await $fetch(

            `${config.public.apiBase}/admin/flying-locations/${location.id}/generate-qr`,

            {

                method: 'POST',

                headers: {

                    Authorization:
                        `Bearer ${authStore.token}`

                }

            }

        )


        if (res.success) {

            const index =
                locations.value.findIndex(
                    l =>
                        l.id === location.id
                )


            if (index !== -1) {

                locations.value[index].qr_code =
                    res.data

                showQRCode(
                    locations.value[index]
                )

            }


            notify(
                'success',
                'QR Code Generated'
            )

        }


    } catch (err) {

        notify(
            'error',
            'Failed to generate QR'
        )


    } finally {

        generatingId.value =
            null

    }

}


const closeQRModal = () => {

    showQRModal.value =
        false

}


const downloadQR = () => {

    const link =
        document.createElement('a')


    link.download =
        `QR-${selectedLocation.value.name}.png`


    link.href =
        qrCodeRef.value.toDataURL()


    link.click()

}


/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const handleSearch =
    useDebounceFn(

        () => fetchLocations(),

        500

    )


/*
|--------------------------------------------------------------------------
| Current Status
|--------------------------------------------------------------------------
*/

const getCurrentStatus = (location) => {

    const permission =
        location.clearance_statuses
            ?.sort(

                (a, b) =>

                    new Date(
                        b.permission_date
                    ) -

                    new Date(
                        a.permission_date
                    )

            )[0]


    const status =
        permission?.status ??
        'red'


    switch (status) {

        case 'green':

            return {

                status: 'green',

                label: 'Open'

            }


        case 'yellow':

            return {

                status: 'yellow',

                label: 'Pending'

            }


        default:

            return {

                status: 'red',

                label: 'Closed'

            }

    }

}


/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(async () => {

    await fetchLocations()

    await fetchSports()

})

</script>


<style scoped>

.flying-locations-admin {

    background: #f8fafc;

    min-height: 100vh;

}


.status-badge-modern {

    display: inline-flex;

    align-items: center;

    padding: 4px 12px;

    border-radius: 20px;

    font-size: 0.8rem;

    font-weight: bold;

}


.status-badge-modern.green {

    background: #dcfce7;

    color: #166534;

}


.status-badge-modern.yellow {

    background: #fff3cd;

    color: #856404;

}


.status-badge-modern.red {

    background: #fee2e2;

    color: #991b1b;

}


.pulse-dot {

    width: 8px;

    height: 8px;

    border-radius: 50%;

    margin-right: 8px;

}


.green .pulse-dot {

    background: #22c55e;

    animation: pulse 2s infinite;

}


.yellow .pulse-dot {

    background: #ffc107;

    animation: pulse 2s infinite;

}


@keyframes pulse {

    0% {

        box-shadow:
            0 0 0 0
            rgba(34, 197, 94, 0.7);

    }

    70% {

        box-shadow:
            0 0 0 6px
            rgba(34, 197, 94, 0);

    }

    100% {

        box-shadow:
            0 0 0 0
            rgba(34, 197, 94, 0);

    }

}


.italic {

    font-style: italic;

}

</style>