<template>
  <div class="container-fluid">

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="row">

      <div class="col-lg-8">

        <div class="card shadow-sm border-0 mb-4">

          <div class="card-header bg-white">
            <h4 class="mb-0">
              Feedback #{{ feedback.id }}
            </h4>
          </div>

          <div class="card-body">

            <div class="mb-3">
              <strong>Type</strong>
              <p class="text-capitalize">{{ feedback.type }}</p>
            </div>

            <div class="mb-3">
              <strong>Subject</strong>
              <p>{{ feedback.subject || '-' }}</p>
            </div>

            <div class="mb-3">
              <strong>Flying Location</strong>
              <p>{{ feedback.location?.name || '-' }}</p>
            </div>

            <div class="mb-3">
              <strong>Incident Date</strong>
              <p>{{ feedback.incident_date || '-' }}</p>
            </div>

            <div class="mb-3">
              <strong>Submitted</strong>
              <p>{{ formatDate(feedback.created_at) }}</p>
            </div>

            <div class="mb-4">
              <strong>Message</strong>

              <div class="border rounded p-3 bg-light mt-2">
                {{ feedback.message }}
              </div>
            </div>

            <div
              v-if="feedback.attachment"
              class="mb-4">

              <strong>Attachment</strong>

              <div class="mt-3">

                <img
                  v-if="isImage"
                  :src="attachmentUrl"
                  class="img-fluid rounded border"/>

                <a
                  v-else
                  :href="attachmentUrl"
                  target="_blank"
                  class="btn btn-outline-primary">

                  Download Attachment

                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

      <div class="col-lg-4">

        <div class="card shadow-sm border-0">

          <div class="card-header bg-white">

            <h5 class="mb-0">
              Administration
            </h5>

          </div>

          <div class="card-body">

            <div class="mb-4">

              <label class="form-label">

                Status

              </label>

              <select
                class="form-select"
                v-model="form.status">

                <option value="new">New</option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="closed">
                  Closed
                </option>

              </select>

            </div>

            <div class="mb-4">

              <label class="form-label">

                Admin Notes

              </label>

              <textarea
                rows="8"
                class="form-control"
                v-model="form.admin_notes">
              </textarea>

            </div>

            <button
              class="btn btn-success w-100"
              @click="save">

              Save Changes

            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()

const feedback = ref({})
const loading = ref(true)

const form = ref({
  status: '',
  admin_notes: ''
})

const load = async () => {

  loading.value = true

  feedback.value = await $fetch(`/admin/feedback/${route.params.id}`, {

    baseURL: config.public.apiBase,

    headers: {

      Authorization: `Bearer ${auth.token}`

    }

  })

  form.value.status = feedback.value.status
  form.value.admin_notes = feedback.value.admin_notes

  loading.value = false

}

const save = async () => {

  await $fetch(`/admin/feedback/${feedback.value.id}`, {

    method: 'PATCH',

    baseURL: config.public.apiBase,

    headers: {

      Authorization: `Bearer ${auth.token}`

    },

    body: form.value

  })

  alert('Feedback updated successfully.')

}

const attachmentUrl = computed(() => {

  if (!feedback.value.attachment)
    return ''

  return `${config.public.apiBase}/storage/${feedback.value.attachment}`

})

const isImage = computed(() => {

  if (!feedback.value.attachment)
    return false

  return /\.(jpg|jpeg|png)$/i.test(feedback.value.attachment)

})

const formatDate = date => {

  return new Date(date).toLocaleString()

}

onMounted(load)

</script>