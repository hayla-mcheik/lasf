<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-lg-10">

        <div class="card shadow-sm border-0">

          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Contact Message</h5>

            <NuxtLink
              to="/admin/contact-messages"
              class="btn btn-light btn-sm"
            >
              <i class="bi bi-arrow-left me-1"></i>
              Back
            </NuxtLink>
          </div>

          <div class="card-body">

            <div
              v-if="pending"
              class="text-center py-5"
            >
              <div class="spinner-border text-primary"></div>
            </div>

            <template v-else>

              <div class="row g-4">

                <div class="col-md-6">
                  <label class="form-label fw-bold">Name</label>
                  <input
                    class="form-control"
                    :value="message.name"
                    readonly
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Phone</label>
                  <input
                    class="form-control"
                    :value="message.phone || '-'"
                    readonly
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Subject</label>
                  <input
                    class="form-control"
                    :value="message.subject"
                    readonly
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-bold">Submitted At</label>
                  <input
                    class="form-control"
                    :value="formatDate(message.created_at)"
                    readonly
                  >
                </div>

                <div class="col-12">
                  <label class="form-label fw-bold">Message</label>

                  <textarea
                    class="form-control"
                    rows="8"
                    readonly
                  >{{ message.message }}</textarea>
                </div>

                <div class="col-12 text-end">

                  <button
                    class="btn btn-danger"
                    :disabled="loading"
                    @click="deleteMessage"
                  >
                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>

                    <i
                      v-else
                      class="bi bi-trash me-1"
                    ></i>

                    Delete Message
                  </button>

                </div>

              </div>

            </template>

          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)

const { data, pending } = await useFetch(
  `${config.public.apiBase}/admin/contact-messages/${route.params.id}`,
  {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }
)

const message = computed(() => data.value)

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const deleteMessage = async () => {

  if (!confirm('Are you sure you want to delete this message?'))
    return

  loading.value = true

  try {

    await $fetch(
      `${config.public.apiBase}/admin/contact-messages/${route.params.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    navigateTo('/admin/contact-messages')

  } catch (e) {

    alert('Failed to delete message.')

  } finally {

    loading.value = false

  }

}
</script>