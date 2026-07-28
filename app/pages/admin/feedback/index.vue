<template>
  <div class="container-fluid">

    <div class="card shadow-sm border-0">

      <div class="card-header bg-white">

        <div class="d-flex justify-content-between align-items-center">

          <div>
            <h4 class="mb-1">Feedback & Complaints</h4>
            <small class="text-muted">
              View anonymous reports submitted by users.
            </small>
          </div>

          <button
            class="btn btn-outline-primary"
            @click="loadFeedback">

            <i class="bi bi-arrow-clockwise"></i>

            Refresh

          </button>

        </div>

      </div>

      <div class="card-body">

        <div class="row mb-4">

          <div class="col-md-4">

            <input
              v-model="search"
              class="form-control"
              placeholder="Search..." />

          </div>

          <div class="col-md-3">

            <select
              class="form-select"
              v-model="statusFilter">

              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>

            </select>

          </div>

        </div>

        <div class="table-responsive">

          <table class="table table-hover align-middle">

            <thead>

              <tr>

                <th>#</th>

                <th>Type</th>

                <th>Subject</th>

                <th>Location</th>

                <th>Status</th>

                <th>Date</th>

                <th width="120">Action</th>

              </tr>

            </thead>

            <tbody>

              <tr
                v-for="item in filteredFeedback"
                :key="item.id">

                <td>{{ item.id }}</td>

                <td class="text-capitalize">

                  {{ item.type }}

                </td>

                <td>

                  {{ item.subject || '-' }}

                </td>

                <td>

                  {{ item.location?.name || '-' }}

                </td>

                <td>

                  <span
                    class="badge"
                    :class="badgeClass(item.status)">

                    {{ formatStatus(item.status) }}

                  </span>

                </td>

                <td>

                  {{ formatDate(item.created_at) }}

                </td>

                <td>

                  <NuxtLink
                    :to="`/admin/feedback/${item.id}`"
                    class="btn btn-sm btn-primary">

                    View

                  </NuxtLink>

                </td>

              </tr>

              <tr v-if="!filteredFeedback.length">

                <td
                  colspan="7"
                  class="text-center py-5">

                  No reports found.

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()

const auth = useAuthStore()

const feedback = ref([])

const search = ref('')

const statusFilter = ref('')

const loadFeedback = async () => {

  try {

    feedback.value = await $fetch('/admin/feedback', {

      baseURL: config.public.apiBase,

      headers: {

        Authorization: `Bearer ${auth.token}`

      }

    })

  } catch (e) {

    console.log(e)

  }

}

const filteredFeedback = computed(() => {

  return feedback.value.data?.filter(item => {

    const matchesSearch =

      item.subject?.toLowerCase().includes(search.value.toLowerCase()) ||

      item.message?.toLowerCase().includes(search.value.toLowerCase())

    const matchesStatus =

      !statusFilter.value ||

      item.status === statusFilter.value

    return matchesSearch && matchesStatus

  }) || []

})

const badgeClass = status => {

  switch (status) {

    case 'new':
      return 'bg-danger'

    case 'in_progress':
      return 'bg-warning text-dark'

    case 'closed':
      return 'bg-success'

    default:
      return 'bg-secondary'

  }

}

const formatStatus = value => {

  return value.replace('_', ' ')

}

const formatDate = date => {

  return new Date(date).toLocaleDateString()

}

onMounted(loadFeedback)

</script>