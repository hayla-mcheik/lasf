<template>
    <div class="container-fluid">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3 class="mb-1">Contact Message</h3>
                <p class="text-muted mb-0">
                    View submitted contact form details.
                </p>
            </div>

            <NuxtLink
                to="/admin/contact-messages"
                class="btn btn-secondary"
            >
                <i class="ri-arrow-left-line me-1"></i>
                Back
            </NuxtLink>
        </div>

        <div
            v-if="pending"
            class="text-center py-5"
        >
            <div class="spinner-border text-primary"></div>
        </div>

        <div
            v-else-if="message"
            class="card shadow-sm border-0"
        >
            <div class="card-body">

                <div class="row mb-4">

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold text-muted">
                            Name
                        </label>

                        <div class="form-control bg-light">
                            {{ message.name }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold text-muted">
                            Phone
                        </label>

                        <div class="form-control bg-light">
                            {{ message.phone || '-' }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold text-muted">
                            Subject
                        </label>

                        <div class="form-control bg-light">
                            {{ message.subject }}
                        </div>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="fw-bold text-muted">
                            Submitted At
                        </label>

                        <div class="form-control bg-light">
                            {{ formatDate(message.created_at) }}
                        </div>
                    </div>

                    <div class="col-md-12">

                        <label class="fw-bold text-muted mb-2">
                            Message
                        </label>

                        <div
                            class="border rounded p-3 bg-light"
                            style="min-height:200px;white-space:pre-wrap;"
                        >
                            {{ message.message }}
                        </div>

                    </div>

                </div>

                <div class="d-flex justify-content-end">

                    <button
                        class="btn btn-danger"
                        @click="deleteMessage"
                    >
                        <i class="ri-delete-bin-line me-1"></i>
                        Delete Message
                    </button>

                </div>

            </div>
        </div>

    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()

const { data, pending } = await useFetch(
    `${config.public.apiBase}/admin/contact-messages/${route.params.id}`,
    {
        headers: useAuthHeaders()
    }
)

const message = computed(() => data.value)

const formatDate = (date) => {
    return new Date(date).toLocaleString()
}

const deleteMessage = async () => {

    if (!confirm('Delete this message?'))
        return

    try {

        await $fetch(
            `${config.public.apiBase}/admin/contact-messages/${route.params.id}`,
            {
                method: 'DELETE',
                headers: useAuthHeaders()
            }
        )

        navigateTo('/admin/contact-messages')

    } catch (e) {
        alert('Failed to delete message.')
    }
}
</script>