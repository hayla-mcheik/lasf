<template>

    <div class="status-notifications">

        <div
            v-for="notification in notifications"
            :key="notification.id"
            class="alert alert-info alert-dismissible shadow-sm mb-2"
            role="alert"
        >

            <strong>
                🔔 {{ notification.title }}
            </strong>

            <div>
                {{ notification.message }}
            </div>

            <button
                type="button"
                class="btn-close"
                @click="removeNotification(notification.id)"
            ></button>

        </div>

    </div>

</template>

<script setup>

import { useStatusNotifications } from '~/composables/useStatusNotifications'

const {
    notifications,
    removeNotification
} = useStatusNotifications()

</script>

<style scoped>

.status-notifications {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 380px;
    max-width: calc(100vw - 40px);
    z-index: 99999;
}

</style>