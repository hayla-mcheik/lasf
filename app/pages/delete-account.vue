<script setup lang="ts">
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue';

</script>


<template>
     <Breadcrumbs />
  <main class="account-deletion">
    <h1>LASF Account Deletion Request</h1>

    <p>
      LASF allows registered pilots and users to request deletion
      of their accounts and associated personal data.
    </p>

    <h2>How to Request Account Deletion</h2>

    <p>
      Account deletion is managed by the LASF administration.
      To request deletion of your account, please contact the
      LASF administration using the contact details below.
    </p>

    <p>
      Please provide the email address or phone number associated
      with your account so the administration can verify your
      identity and locate your account.
    </p>

    <h2>What Happens After Your Request?</h2>

    <p>
      After verifying your request, the LASF administration will
      review and process the account deletion.
    </p>

    <p>
      Personal data associated with your account will be deleted
      where applicable. Certain records may be retained when
      required for legitimate legal, regulatory, or aviation
      safety purposes, in accordance with the applicable
      retention policy.
    </p>

    <h2>Contact Information</h2>

    <p>
      <strong>Website:</strong>
      <a href="https://lasf.info" target="_blank" rel="noopener noreferrer">
        https://lasf.info
      </a>
    </p>

    <p>
      <strong>Account deletion requests:</strong>
      <a href="mailto:mikel.c.khalil@gmail.com">
       mikel.c.khalil@gmail.com
      </a>
    </p>
  </main>
</template>

<style scoped>
.account-deletion {
  max-width: 850px;
  margin: 40px auto;
  padding: 24px;
  line-height: 1.7;
  color: #333;
}

h1 {
  margin-bottom: 24px;
}

h2 {
  margin-top: 28px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 16px;
}

a {
  color: #2563eb;
  overflow-wrap: anywhere;
}
</style>
