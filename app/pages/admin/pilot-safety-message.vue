<template>
<div class="container py-4">

    <div class="card shadow rounded-4">

        <div class="card-header bg-primary text-white">

            <h4 class="mb-0">
                Pilot Safety Message
            </h4>

        </div>

        <div class="card-body">

            <div v-if="loading" class="text-center py-5">

                <div class="spinner-border text-primary"></div>

            </div>

            <form
                v-else
                @submit.prevent="saveMessage"
            >

                <div class="mb-4">

                    <label class="form-label fw-bold">

                        Title

                    </label>

                    <input
                        v-model="form.title"
                        class="form-control"
                    >

                </div>

                <div class="mb-4">

                    <label class="form-label fw-bold">

                        Message

                    </label>

                    <textarea
                        rows="5"
                        class="form-control"
                        v-model="form.message"
                    ></textarea>

                </div>

                <div class="form-check mb-4">

                    <input
                        class="form-check-input"
                        type="checkbox"
                        v-model="form.active"
                    >

                    <label class="form-check-label">

                        Active

                    </label>

                </div>

                <button
                    class="btn btn-primary"
                >
                    Save Message
                </button>

            </form>

        </div>

    </div>

</div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import {useAuthStore} from '~/stores/auth'

definePageMeta({
    layout:'admin'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(true)

const form = ref({
    title:'',
    message:'',
    active:true
})

const getHeaders = () => ({
    Authorization:`Bearer ${authStore.token}`,
    Accept:'application/json'
})

const loadMessage = async()=>{

    loading.value=true

    try{

        const res = await $fetch(
            `${config.public.apiBase}/admin/pilot-safety-message`,
            {
                headers:getHeaders()
            }
        )

        if(res.message){

            form.value={
                title:res.message.title,
                message:res.message.message,
                active:res.message.active
            }

        }

    }finally{

        loading.value=false

    }

}

const saveMessage = async()=>{

    loading.value=true

    try{

        await $fetch(

            `${config.public.apiBase}/admin/pilot-safety-message`,

            {
                method:'PUT',

                headers:getHeaders(),

                body:form.value
            }

        )

        alert('Message updated successfully.')

    }finally{

        loading.value=false

    }

}

onMounted(loadMessage)
</script>