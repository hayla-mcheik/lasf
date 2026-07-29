<template>
  <div class="contact-section pb-120">
    <div class="container">

      <!-- Alerts -->
      <div
        v-if="success"
        class="alert alert-success d-flex align-items-center mb-4"
      >
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ success }}
      </div>

      <div
        v-if="error"
        class="alert alert-danger d-flex align-items-center mb-4"
      >
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Title -->
      <div class="row justify-content-center mb-5">
        <div class="col-lg-7 text-center">

          <div class="section-title1">

            <i class="bi bi-envelope-paper-fill contact-icon"></i>

            <h2 class="mt-3">
              Let's Get in Touch
            </h2>

            <p class="text-muted">
              Have a question or need assistance? Fill out the form below and
              we'll get back to you as soon as possible.
            </p>

          </div>

        </div>
      </div>

      <div class="row">

        <div class="col-12">

          <div class="contact-from-wrapper">

            <form @submit.prevent="submit">

              <div class="row">

                <!-- Name -->
                <div class="col-lg-6 mb-3">

                  <div class="form-inner">

                    <input
                      v-model.trim="form.name"
                      type="text"
                      placeholder="Your Name"
                      :disabled="loading"
                      required
                    >

                  </div>

                  <small
                    v-if="errors.name"
                    class="text-danger"
                  >
                    {{ errors.name[0] }}
                  </small>

                </div>

                <!-- Phone -->
                <div class="col-lg-6 mb-3">

                  <div class="form-inner">

                    <input
                      v-model.trim="form.phone"
                      type="tel"
                      placeholder="Your Phone Number"
                      :disabled="loading"
                    >

                  </div>

                  <small
                    v-if="errors.phone"
                    class="text-danger"
                  >
                    {{ errors.phone[0] }}
                  </small>

                </div>

                <!-- Subject -->
                <div class="col-lg-12 mb-3">

                  <div class="form-inner">

                    <input
                      v-model.trim="form.subject"
                      type="text"
                      placeholder="Subject"
                      :disabled="loading"
                      required
                    >

                  </div>

                  <small
                    v-if="errors.subject"
                    class="text-danger"
                  >
                    {{ errors.subject[0] }}
                  </small>

                </div>

                <!-- Message -->
                <div class="col-lg-12 mb-3">

                  <div class="form-inner">

                    <textarea
                      v-model.trim="form.message"
                      rows="6"
                      placeholder="Type Your Message..."
                      :disabled="loading"
                      required
                    ></textarea>

                  </div>

                  <small
                    v-if="errors.message"
                    class="text-danger"
                  >
                    {{ errors.message[0] }}
                  </small>

                </div>

                <!-- Button -->
                <div class="col-lg-12">

                  <button
                    type="submit"
                    class="eg-btn btn--primary btn--sm submit-btn"
                    :disabled="loading"
                  >

                    <span
                      v-if="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>

                    {{ loading ? 'Sending...' : 'Submit Now' }}

                  </button>

                </div>

                <div class="col-12 mt-3 text-center">

                  <small class="text-muted">
                    Your information will only be used to respond to your enquiry.
                  </small>

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
  message: ''
})

const loading = ref(false)
const success = ref('')
const error = ref('')
const errors = ref({})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.subject = ''
  form.message = ''
}

const submit = async () => {

  loading.value = true
  success.value = ''
  error.value = ''
  errors.value = {}

  try {

    const response = await $fetch(
      `${config.public.apiBase}/contact`,
      {
        method: 'POST',
        body: form
      }
    )

    success.value = response.message
    resetForm()

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    setTimeout(() => {
      success.value = ''
    }, 5000)

  } catch (e) {

    if (e.data?.errors) {

      errors.value = e.data.errors

    } else {

      error.value =
        e.data?.message ??
        'Unable to send your message. Please try again.'

    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

  } finally {

    loading.value = false

  }

}
</script>

<style scoped>
.contact-icon{
    font-size:60px;
    color:#0d6efd;
}

.alert{
    border-radius:10px;
}

.text-danger{
    font-size:.85rem;
}

.submit-btn:disabled{
    opacity:.8;
    cursor:not-allowed;
}

.spinner-border{
    width:1rem;
    height:1rem;
}

.contact-from-wrapper{
    border-radius:12px;
}

small{
    display:block;
}
</style>