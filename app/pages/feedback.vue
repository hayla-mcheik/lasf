<script setup>
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig()

const loading = ref(false)
const success = ref(false)
const errors = ref({})

const locations = ref([])

const form = ref({
    type: 'feedback',
    subject: '',
    message: '',
    flying_location_id: '',
    incident_date: '',
    attachment: null,
})

const fetchLocations = async () => {
    try {
        locations.value = await $fetch('/flying-locations', {
            baseURL: config.public.apiBase
        })
    } catch (e) {
        console.error(e)
    }
}

const handleFile = (event) => {
    form.value.attachment = event.target.files[0]
}

const submit = async () => {
    loading.value = true
    errors.value = {}

    try {

        const data = new FormData()

        data.append('type', form.value.type)
        data.append('subject', form.value.subject)
        data.append('message', form.value.message)

        if (form.value.flying_location_id)
            data.append('flying_location_id', form.value.flying_location_id)

        if (form.value.incident_date)
            data.append('incident_date', form.value.incident_date)

        if (form.value.attachment)
            data.append('attachment', form.value.attachment)

        await $fetch('/feedback', {
            method: 'POST',
            body: data,
            baseURL: config.public.apiBase
        })

        success.value = true

        form.value = {
            type: 'feedback',
            subject: '',
            message: '',
            flying_location_id: '',
            incident_date: '',
            attachment: null,
        }

    } catch (e) {

        if (e.data?.errors)
            errors.value = e.data.errors

    }

    loading.value = false
}

onMounted(fetchLocations)
</script>

<template>

<section class="container py-5">

    <div class="row justify-content-center">

        <div class="col-lg-8">

            <div class="card shadow">

                <div class="card-body p-5">

                    <h2 class="mb-3">
                        Feedback & Complaints
                    </h2>

                    <p class="text-muted mb-4">
                        This form is completely anonymous. No personal information is collected.
                    </p>

                    <div
                        v-if="success"
                        class="alert alert-success">

                        Thank you.
                        Your report has been submitted successfully.

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Type

                        </label>

                        <select
                            class="form-select"
                            v-model="form.type">

                            <option value="feedback">
                                Feedback
                            </option>

                            <option value="complaint">
                                Complaint
                            </option>

                            <option value="safety">
                                Safety Report
                            </option>

                            <option value="violation">
                                Airspace Violation
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Subject

                        </label>

                        <input
                            class="form-control"
                            v-model="form.subject">

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Flying Location

                        </label>

                        <select
                            class="form-select"
                            v-model="form.flying_location_id">

                            <option value="">

                                Select Location

                            </option>

                            <option
                                v-for="location in locations"
                                :key="location.id"
                                :value="location.id">

                                {{ location.name }}

                            </option>

                        </select>

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Incident Date

                        </label>

                        <input
                            type="date"
                            class="form-control"
                            v-model="form.incident_date">

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Message

                        </label>

                        <textarea
                            rows="6"
                            class="form-control"
                            v-model="form.message">

                        </textarea>

                    </div>

                    <div class="mb-4">

                        <label class="form-label">

                            Attachment (optional)

                        </label>

                        <input
                            type="file"
                            class="form-control"
                            @change="handleFile">

                    </div>

                    <button
                        class="btn btn-primary w-100"
                        :disabled="loading"
                        @click="submit">

                        {{ loading ? 'Sending...' : 'Send Report' }}

                    </button>

                </div>

            </div>

        </div>

    </div>

</section>

</template>