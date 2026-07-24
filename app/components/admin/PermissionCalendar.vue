<template>
    <div class="permission-calendar">
        <FullCalendar :options="calendarOptions" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'

import dayGridPlugin from '@fullcalendar/daygrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

const emit = defineEmits(['dateSelected'])

const props = defineProps({
    selectedDate: {
        type: String,
        required: true
    }
})

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

    // Add a class to the selected day
dayCellClassNames(info) {

    return info.dateStr === props.selectedDate
        ? ['selected-day']
        : []

},

dateClick(info) {

    emit('dateSelected', info.dateStr)

}
}
</script>

<style scoped>

.permission-calendar{
    background:#fff;
    border-radius:18px;
    padding:20px;
    box-shadow:0 6px 20px rgba(0,0,0,.08);
}

/* Toolbar */

:deep(.fc-toolbar){
    margin-bottom:25px;
}

:deep(.fc-toolbar-title){
    font-size:30px;
    font-weight:700;
    color:#1f2937;
}

:deep(.fc-button){
    border-radius:10px!important;
    padding:.45rem .9rem;
    font-weight:600;
}

:deep(.fc-col-header-cell){
    background:#f8fafc;
}

:deep(.fc-col-header-cell-cushion){
    color:#475569;
    font-weight:700;
    text-decoration:none;
}

:deep(.fc-daygrid-day){
    min-height:90px;
    transition:.2s;
}

:deep(.fc-daygrid-day:hover){
    background:#eef6ff;
    cursor:pointer;
}

:deep(.fc-daygrid-day-number){
    color:#374151;
    font-weight:600;
    text-decoration:none;
}

/* Today */

:deep(.fc-day-today){
    background:rgba(13,110,253,.08)!important;
}

/* Selected */

:deep(.selected-day){
    background:#dbeafe!important;
    border:2px solid #0d6efd!important;
}

:deep(.selected-day .fc-daygrid-day-number){
    color:#0d6efd!important;
    font-weight:700;
}

/* Other Month */

:deep(.fc-day-other){
    background:#fafafa;
}

:deep(.fc-day-other .fc-daygrid-day-number){
    color:#b7b7b7;
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th){
    border-color:#e9ecef;
}

:deep(.fc-scrollgrid){
    border-radius:14px;
    overflow:hidden;
}

@media(max-width:768px){

    :deep(.fc-toolbar){
        flex-direction:column;
        gap:10px;
    }

    :deep(.fc-toolbar-title){
        font-size:22px;
    }

    :deep(.fc-daygrid-day){
        min-height:65px;
    }

}
</style>