<template>
    <div class="permission-calendar">
        <FullCalendar :options="calendarOptions" ref="calendarRef" />
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'

import dayGridPlugin from '@fullcalendar/daygrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

const emit = defineEmits(['dateSelected'])

const props = defineProps({
    selectedDate: {
        type: String,
        required: true
    },
    locations: {
        type: Array,
        default: () => []
    }
})

const calendarRef = ref(null)

// --- Helper: highlight the selected day manually ---
const highlightSelectedDay = () => {
    if (!calendarRef.value) return
    const selected = props.selectedDate
    if (!selected) return

    // Get all day cells
    const cells = document.querySelectorAll('.fc-daygrid-day')
    cells.forEach(cell => {
        cell.classList.remove('selected-day')
        // FullCalendar uses data-date attribute (YYYY-MM-DD)
        const cellDate = cell.getAttribute('data-date')
        if (cellDate === selected) {
            cell.classList.add('selected-day')
        }
    })
}

// --- Watch for selectedDate changes ---
watch(() => props.selectedDate, () => {
    nextTick(() => {
        highlightSelectedDay()
    })
}, { immediate: true })

// --- Watch for location changes (to update permission dots) ---
watch(() => props.locations, () => {
    if (calendarRef.value) {
        calendarRef.value.getApi().render()
    }
}, { deep: true })

// --- FullCalendar Options ---
const calendarOptions = {
    plugins: [
        dayGridPlugin,
        bootstrap5Plugin,
        interactionPlugin
    ],
    themeSystem: 'bootstrap5',
    initialView: 'dayGridMonth',
    height: 'auto',
    fixedWeekCount: false,
    firstDay: 1,
    selectable: true,

    headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'today'
    },

    buttonText: {
        today: 'Today'
    },

    // Handle date click
    dateClick(info) {
        emit('dateSelected', info.dateStr)
    },

    // Called whenever the view changes (month, today, etc.)
    datesSet() {
        nextTick(() => {
            highlightSelectedDay()
        })
    },

    // Add permission indicators after cells mount
    dayCellDidMount(info) {
        const dateStr = info.dateStr
        const permissionDates = getPermissionDates()
        if (permissionDates[dateStr]) {
            const cell = info.el
            const existing = cell.querySelector('.permission-indicators')
            if (!existing) {
                const container = document.createElement('div')
                container.className = 'permission-indicators'
                const statuses = permissionDates[dateStr]
                const uniqueStatuses = [...new Set(statuses.map(p => p.status))]
                uniqueStatuses.forEach(status => {
                    const dot = document.createElement('span')
                    dot.className = `permission-dot permission-dot-${status}`
                    dot.title = `${statuses.filter(p => p.status === status).length} location(s) ${status}`
                    container.appendChild(dot)
                })
                cell.appendChild(container)
            }
        }
    },

    // Clean up when cell is destroyed
    dayCellWillUnmount(info) {
        const cell = info.el
        const indicator = cell.querySelector('.permission-indicators')
        if (indicator) indicator.remove()
    }
}

// --- Helper to get permission dates from locations ---
const getPermissionDates = () => {
    const dates = {}
    if (props.locations && props.locations.length) {
        props.locations.forEach(location => {
            if (location.clearance_statuses && location.clearance_statuses.length) {
                location.clearance_statuses.forEach(permission => {
                    const date = permission.permission_date
                    if (!dates[date]) dates[date] = []
                    dates[date].push({
                        status: permission.status,
                        locationName: location.name
                    })
                })
            }
        })
    }
    return dates
}

// --- Ensure highlight on mount ---
onMounted(() => {
    nextTick(() => {
        highlightSelectedDay()
    })
})
</script>

<style scoped>
.permission-calendar {
    background: #fff;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 6px 20px rgba(0,0,0,.08);
}

/* Toolbar */
:deep(.fc-toolbar) {
    margin-bottom: 25px;
}

:deep(.fc-toolbar-title) {
    font-size: 30px;
    font-weight: 700;
    color: #1f2937;
}

:deep(.fc-button) {
    border-radius: 10px!important;
    padding: .45rem .9rem;
    font-weight: 600;
}

:deep(.fc-col-header-cell) {
    background: #f8fafc;
}

:deep(.fc-col-header-cell-cushion) {
    color: #475569;
    font-weight: 700;
    text-decoration: none;
}

:deep(.fc-daygrid-day) {
    min-height: 90px;
    transition: .2s;
    cursor: pointer;
    position: relative;
}

:deep(.fc-daygrid-day:hover) {
    background: #eef6ff;
}

:deep(.fc-daygrid-day-number) {
    color: #374151;
    font-weight: 600;
    text-decoration: none;
}

/* Today */
:deep(.fc-day-today) {
    background: rgba(15, 104, 71, 0.08) !important;
}

/* ============================================ */
/* ENHANCED SELECTED DAY STYLING */
/* ============================================ */
:deep(.selected-day) {
    background: linear-gradient(135deg, #0a5034 0%, #0f6847 50%, #1a8a5e 100%) !important;
    border-radius: 12px !important;
    border: 3px solid #0f6847 !important;
    box-shadow: 0 4px 20px rgba(15, 104, 71, 0.5) !important;
    position: relative;
    z-index: 2;
    transform: scale(1.02);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.selected-day .fc-daygrid-day-number) {
    color: #ffffff !important;
    font-weight: 800 !important;
    font-size: 1.1em !important;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

:deep(.selected-day:hover) {
    background: linear-gradient(135deg, #053d28 0%, #0a5034 50%, #0f6847 100%) !important;
    transform: scale(1.05) !important;
    box-shadow: 0 6px 30px rgba(15, 104, 71, 0.6) !important;
}

/* Checkmark indicator */
:deep(.selected-day::before) {
    content: '✓';
    position: absolute;
    top: 2px;
    right: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 700;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    z-index: 3;
}

/* Glow animation */
:deep(.selected-day::after) {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 16px;
    background: rgba(15, 104, 71, 0.25);
    filter: blur(14px);
    z-index: -1;
    animation: pulse-glow 2.5s ease-in-out infinite;
}

@keyframes pulse-glow {
    0% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.08); }
    100% { opacity: 0.4; transform: scale(1); }
}

/* Override today's styling when selected */
:deep(.fc-day-today.selected-day) {
    background: linear-gradient(135deg, #0a5034 0%, #0f6847 50%, #1a8a5e 100%) !important;
    border-color: #0f6847 !important;
}

/* Center the day number */
:deep(.selected-day .fc-daygrid-day-frame) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

/* Make sure the selected day is clickable */
:deep(.selected-day) {
    cursor: pointer;
}

/* Permission indicators */
:deep(.fc-daygrid-day .permission-indicators) {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 3px;
    justify-content: center;
    width: 100%;
}

:deep(.fc-daygrid-day .permission-dot) {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.5);
}

:deep(.fc-daygrid-day .permission-dot-green) {
    background-color: #22c55e;
}

:deep(.fc-daygrid-day .permission-dot-yellow) {
    background-color: #eab308;
}

:deep(.fc-daygrid-day .permission-dot-red) {
    background-color: #ef4444;
}

/* Override permission dots color on selected day */
:deep(.selected-day .permission-dot-green) {
    background-color: #86efac;
    border-color: #ffffff;
}

:deep(.selected-day .permission-dot-yellow) {
    background-color: #fde047;
    border-color: #ffffff;
}

:deep(.selected-day .permission-dot-red) {
    background-color: #fca5a5;
    border-color: #ffffff;
}

/* Other Month */
:deep(.fc-day-other) {
    background: #fafafa;
}

:deep(.fc-day-other .fc-daygrid-day-number) {
    color: #b7b7b7;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
    border-color: #e9ecef;
}

:deep(.fc-scrollgrid) {
    border-radius: 14px;
    overflow: hidden;
}

@media(max-width:768px) {
    :deep(.fc-toolbar) {
        flex-direction: column;
        gap: 10px;
    }

    :deep(.fc-toolbar-title) {
        font-size: 22px;
    }

    :deep(.fc-daygrid-day) {
        min-height: 65px;
    }
}
</style>