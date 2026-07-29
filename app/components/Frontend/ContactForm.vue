<template>

    <div class="contact-section pb-120">
        <div class="container">
            <div
    v-if="success"
    class="alert alert-success mt-3"
>
    {{ success }}
</div>

<div
    v-if="error"
    class="alert alert-danger mt-3"
>
    {{ error }}
</div>
            <div class="row justify-content-center">
                <div class="col-md-6 text-center">
                    <div class="section-title1">
                        <h2>Let’s Get in Touch</h2>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="contact-from-wrapper">
                      <form @submit.prevent="submit">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-inner">
                                     <input
    v-model="form.name"
    type="text"
    placeholder="Your Name"
>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-inner">
                           <input
    v-model="form.phone"
    type="text"
    placeholder="Your Phone Number"
>
                                    </div>
                                </div>
                                <div class="col-lg-12">
                                    <div class="form-inner">
                                   <input
    v-model="form.subject"
    type="text"
    placeholder="Subject"
>

                                    </div>
                                </div>
                                <div class="col-lg-12">
                                    <div class="form-inner">
                               <textarea
    v-model="form.message"
    rows="5"
    placeholder="Type Your Message..."
></textarea>
                                    </div>
                                </div>
                                <div class="col-lg-12">
                                <button
    type="submit"
    :disabled="loading"
    class="eg-btn btn--primary btn--sm submit-btn"
>
    {{ loading ? 'Sending...' : 'Submit Now' }}
</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  phone: '',
  subject: '',
  message: '',
})

const loading = ref(false)
const success = ref('')
const error = ref('')

const submit = async () => {
  loading.value = true
  success.value = ''
  error.value = ''

  try {
    const response = await $fetch(
      `${config.public.apiBase}/contact`,
      {
        method: 'POST',
        body: form,
      }
    )

    success.value = response.message

    form.name = ''
    form.phone = ''
    form.subject = ''
    form.message = ''
  } catch (e) {
    error.value = e.data?.message ?? 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>

</style>