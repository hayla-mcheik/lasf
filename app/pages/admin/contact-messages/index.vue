<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
    layout: 'admin'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()

const { data, pending, refresh } = await useFetch(
    `${config.public.apiBase}/admin/contact-messages`,
    {
        headers: {
            Authorization: `Bearer ${authStore.token}`
        }
    }
)

const messages = computed(() => data.value?.data ?? [])
</script>

<template>
    <div class="card">
        <div class="card-header">
            <h3>Contact Messages</h3>
        </div>

        <div class="card-body">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="message in messages"
                        :key="message.id"
                    >
                        <td>{{ message.name }}</td>
                        <td>{{ message.phone }}</td>
                        <td>{{ message.subject }}</td>
                        <td>{{ message.created_at }}</td>

                        <td>
                            <span
                                :class="message.is_read ? 'badge bg-success' : 'badge bg-warning'"
                            >
                                {{ message.is_read ? 'Read' : 'Unread' }}
                            </span>
                        </td>

                        <td>
                            <NuxtLink
                                :to="`/admin/contact-messages/${message.id}`"
                                class="btn btn-primary btn-sm"
                            >
                                View
                            </NuxtLink>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>