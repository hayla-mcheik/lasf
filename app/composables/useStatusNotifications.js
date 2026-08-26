export const useStatusNotifications = () => {

    const notifications = useState(
        'status-notifications',
        () => []
    )

    const addNotification = (notification) => {

        notifications.value.unshift({
            id: `${Date.now()}-${Math.random()}`,
            title: notification.title,
            message: notification.message,
            created_at: new Date()
        })
    }

    const removeNotification = (id) => {

        notifications.value =
            notifications.value.filter(
                notification => notification.id !== id
            )
    }

    return {
        notifications,
        addNotification,
        removeNotification
    }
}