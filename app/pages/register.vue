<template>
  <Breadcrumbs />

  <ClientOnly>
    <div class="register-page">
      <div class="container py-5">
        <div class="row justify-content-center">

          <div class="col-lg-8">

            <div class="card shadow-lg border-0 rounded-4">

              <!-- Header -->
              <div class="card-header bg-success text-white text-center py-4">
     <h2 class="mb-0">

    <i
        :class="
            isInternational
                ? 'bi bi-airplane-fill'
                : 'bi bi-person-plus-fill'
        "
        class="me-2"
    ></i>

    {{ isInternational
        ? 'International Pilot Registration'
        : 'Pilot Registration'
    }}

</h2>
<div
    v-if="isInternational"
    class="bg-light text-dark p-3 text-center border-bottom"
>
    <strong>International Pilot / Visitor</strong>

    <div class="small text-muted mt-1">
        This registration is for foreign pilots wishing to fly
        paragliding in Lebanon.
    </div>
</div>
              </div>

              <div class="card-body p-4">

                <!-- Success -->
                <div
                  v-if="successMessage"
                  class="alert alert-success"
                >
                  {{ successMessage }}
                </div>

                <!-- Errors -->
                <div
                  v-if="error"
                  class="alert alert-danger"
                  style="white-space: pre-line"
                >
                  {{ error }}
                </div>

   <!-- Registration Type Selection -->
<div
    v-if="!route.query.type"
    class="container py-5"
>
    <div class="row justify-content-center">
        <div class="col-lg-9">

            <div class="card border-0 shadow-sm">

                <div class="card-header bg-success text-white text-center py-4">
                    <h3 class="mb-1">
                        <i class="bi bi-person-plus-fill me-2"></i>
                        Pilot Registration
                    </h3>

                    <p class="mb-0">
                        Please select your registration type
                    </p>
                </div>

                <div class="card-body p-4 p-md-5">

                    <div class="row g-4">

                        <!-- Normal Pilot -->
                        <div class="col-md-6">

                            <div class="registration-option h-100">

                                <div class="registration-icon">
                                    <i class="bi bi-person-badge-fill"></i>
                                </div>

                                <h4 class="mt-3">
                                    Normal Pilot
                                </h4>

                                <p class="text-muted">
                                    For pilots registered with
                                    the Lebanese Air Sports Federation.
                                </p>

                                <NuxtLink
                                    to="/register?type=normal"
                                    class="btn btn-success w-100"
                                >
                                    Register as Pilot
                                </NuxtLink>

                            </div>

                        </div>

                        <!-- International Pilot -->
                        <div class="col-md-6">

                            <div class="registration-option h-100">

                                <div class="registration-icon">
                                    <i class="bi bi-globe2"></i>
                                </div>

                                <h4 class="mt-3">
                                    International Pilot
                                </h4>

                                <p class="text-muted">
                                    For foreign pilots wishing to
                                    fly paragliding in Lebanon.
                                </p>

                                <NuxtLink
                                    to="/register?type=international"
                                    class="btn btn-outline-success w-100"
                                >
                                    Register as International Pilot
                                </NuxtLink>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    </div>
</div>


<!-- Actual Registration Form -->
<form
    v-else
    @submit.prevent="registerPilot"
    novalidate
>

                  <div class="row">

                    <!-- Name - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Full Name <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.name"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.name }"
                        required
                      >
                      <div v-if="formErrors.name" class="invalid-feedback">
                        {{ formErrors.name }}
                      </div>
                    </div>

                    <!-- Email - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Email <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.email }"
                        required
                      >
                      <div v-if="formErrors.email" class="invalid-feedback">
                        {{ formErrors.email }}
                      </div>
                    </div>

                    <!-- Phone - REQUIRED -->
          
<div class="col-md-6 mb-3">
  <label class="form-label fw-semibold">
    Phone <span class="text-danger">*</span>
  </label>

  <input
    v-model="form.phone"
    type="tel"
    class="form-control"
    :class="{ 'is-invalid': formErrors.phone }"
    @input="formatPhoneNumber"
    required
    placeholder="e.g. 03263023"
  >
  <div v-if="formErrors.phone" class="invalid-feedback">
    {{ formErrors.phone }}
  </div>
  <small class="text-muted">Enter phone number without spaces</small>
</div>

                    <!-- DOB - OPTIONAL -->
                <div class="col-md-6 mb-3">
    <label class="form-label">
        Date of Birth <span class="text-danger"></span>
    </label>

<input
    v-model="form.date_of_birth"
    type="date"
    class="form-control"
>
</div>

                    <!-- Blood Type - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Blood Type <span class="text-danger">*</span>
                      </label>

                      <select
                        v-model="form.blood_type"
                        class="form-select"
                        :class="{ 'is-invalid': formErrors.blood_type }"
                        required
                      >
                        <option value="">Select Blood Type</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </select>
                      <div v-if="formErrors.blood_type" class="invalid-feedback">
                        {{ formErrors.blood_type }}
                      </div>
                    </div>

                    <!-- Password - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Password <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.password"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.password }"
                        required
                        minlength="8"
                      >
                      <div v-if="formErrors.password" class="invalid-feedback">
                        {{ formErrors.password }}
                      </div>
                      <small class="text-muted">Minimum 8 characters</small>
                    </div>

                    <!-- Confirm Password - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Confirm Password <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.password_confirmation"
                        type="password"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.password_confirmation }"
                        required
                      >
                      <div v-if="formErrors.password_confirmation" class="invalid-feedback">
                        {{ formErrors.password_confirmation }}
                      </div>
                    </div>

                    <!-- Insurance Provider - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Provider <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.insurance_provider"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.insurance_provider }"
                        required
                      >
                      <div v-if="formErrors.insurance_provider" class="invalid-feedback">
                        {{ formErrors.insurance_provider }}
                      </div>
                    </div>

                    <!-- Insurance Number - REQUIRED -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label fw-semibold">
                        Insurance Number <span class="text-danger">*</span>
                      </label>

                      <input
                        v-model="form.insurance_number"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': formErrors.insurance_number }"
                        required
                      >
                      <div v-if="formErrors.insurance_number" class="invalid-feedback">
                        {{ formErrors.insurance_number }}
                      </div>
                    </div>

<!-- Club -->
<div class="col-md-6 mb-4">

    <label class="form-label fw-semibold">
        Club <span class="text-danger">*</span>
    </label>

    <select
        v-model="selectedClub"
        class="form-select"
        :class="{ 'is-invalid': formErrors.club }"
        @change="updateClub"
        required
    >

        <option :value="null">
            Select Club
        </option>

        <option
            v-for="club in clubs"
            :key="club.code"
            :value="club"
        >
            {{ club.name }}
        </option>

    </select>

    <div
        v-if="formErrors.club"
        class="invalid-feedback"
    >
        {{ formErrors.club }}
    </div>

</div>

<!-- ========================================================= -->
<!-- INTERNATIONAL PILOT INFORMATION -->
<!-- ========================================================= -->

<div
    v-if="isInternational"
    class="mt-4"
>

    <div class="border rounded-4 p-4 bg-light">

        <h4 class="fw-bold mb-4 text-success">
            <i class="bi bi-person-vcard me-2"></i>
            Visitor Information
        </h4>


        <!-- Personal Information -->

        <h5 class="fw-bold border-bottom pb-2 mb-3">
            Personal Information
        </h5>

        <div class="row">

            <!-- First Name -->
            <div class="col-md-4 mb-3">

                <label class="form-label">
                    First Name <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.first_name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.first_name }"
                >

                <div
                    v-if="formErrors.first_name"
                    class="invalid-feedback"
                >
                    {{ formErrors.first_name }}
                </div>

            </div>


            <!-- Father Name -->
            <div class="col-md-4 mb-3">

                <label class="form-label">
                    Father Name <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.father_name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.father_name }"
                >

            </div>


            <!-- Last Name -->
            <div class="col-md-4 mb-3">

                <label class="form-label">
                    Last Name <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.last_name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.last_name }"
                >

            </div>


            <!-- Mother -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Mother's Full Name
                </label>

                <input
                    v-model="form.mother_full_name"
                    type="text"
                    class="form-control"
                >

            </div>


            <!-- Wife -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Wife's Full Name
                </label>

                <input
                    v-model="form.wife_full_name"
                    type="text"
                    class="form-control"
                >

            </div>


            <!-- Place of Birth -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Place of Birth
                </label>

                <input
                    v-model="form.place_of_birth"
                    type="text"
                    class="form-control"
                >

            </div>


            <!-- Nationality -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Nationality <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.nationality"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.nationality }"
                >

            </div>


            <!-- Sex -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Sex <span class="text-danger">*</span>
                </label>

                <select
                    v-model="form.sex"
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.sex }"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Male">
                        Male
                    </option>

                    <option value="Female">
                        Female
                    </option>

                </select>

            </div>


            <!-- Marital Status -->
            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Marital Status <span class="text-danger">*</span>
                </label>

                <select
                    v-model="form.marital_status"
                    class="form-select"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Single">
                        Single
                    </option>

                    <option value="Married">
                        Married
                    </option>

                    <option value="Divorced">
                        Divorced
                    </option>

                    <option value="Widowed">
                        Widowed
                    </option>

                </select>

            </div>


            <!-- Languages -->
            <div class="col-12 mb-3">

                <label class="form-label">
                    Languages Fluently Spoken
                    <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.languages"
                    type="text"
                    class="form-control"
                    placeholder="Arabic, English, French, etc."
                >

            </div>

        </div>


        <!-- Identity / Passport -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Identification & Passport
        </h5>

        <div class="row">

            <div class="col-md-6 mb-3">

                <label class="form-label">
                    National ID Number
                </label>

                <input
                    v-model="form.national_id_number"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    File Number
                </label>

                <input
                    v-model="form.file_number"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Passport Number <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.passport_number"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.passport_number }"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Passport Issuing Authority
                    <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.passport_issuing_authority"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Passport Issued Date
                    <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.passport_issued_date"
                    type="date"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Passport Expiry Date
                    <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.passport_expiry_date"
                    type="date"
                    class="form-control"
                >

            </div>

        </div>


        <!-- Contact -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Contact Information
        </h5>

        <div class="row">

            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Mobile Phone
                </label>

                <input
                    v-model="form.mobile_phone"
                    type="tel"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Alternative Phone
                </label>

                <input
                    v-model="form.alternative_phone"
                    type="tel"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Work Email
                </label>

                <input
                    v-model="form.work_email"
                    type="email"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Personal Email
                </label>

                <input
                    v-model="form.personal_email"
                    type="email"
                    class="form-control"
                >

            </div>

        </div>


        <!-- Current Address -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Current Address
        </h5>

        <div class="row">

            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Country <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.current_country"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    City <span class="text-danger">*</span>
                </label>

                <input
                    v-model="form.current_city"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Street / Area
                </label>

                <input
                    v-model="form.current_street_area"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-3 mb-3">

                <label class="form-label">
                    Building
                </label>

                <input
                    v-model="form.current_building"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-3 mb-3">

                <label class="form-label">
                    Floor
                </label>

                <input
                    v-model="form.current_floor"
                    type="text"
                    class="form-control"
                >

            </div>

        </div>


        <!-- Alternative Address -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Alternative Address
        </h5>

        <div class="row">

            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Country
                </label>

                <input
                    v-model="form.alternative_country"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    City
                </label>

                <input
                    v-model="form.alternative_city"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Street / Area
                </label>

                <input
                    v-model="form.alternative_street_area"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-3 mb-3">

                <label class="form-label">
                    Building
                </label>

                <input
                    v-model="form.alternative_building"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-3 mb-3">

                <label class="form-label">
                    Floor
                </label>

                <input
                    v-model="form.alternative_floor"
                    type="text"
                    class="form-control"
                >

            </div>

        </div>


        <!-- Employment -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Employment
        </h5>

        <div class="row">

            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Name of Employer
                </label>

                <input
                    v-model="form.employer_name"
                    type="text"
                    class="form-control"
                >

            </div>


            <div class="col-md-6 mb-3">

                <label class="form-label">
                    Current Title
                </label>

                <input
                    v-model="form.current_title"
                    type="text"
                    class="form-control"
                >

            </div>

        </div>


        <!-- Criminal Record -->

        <h5 class="fw-bold border-bottom pb-2 mb-3 mt-4">
            Legal Information
        </h5>

        <div class="mb-3">

            <label class="form-label">
                Have you ever been convicted of a crime?
            </label>

            <div class="d-flex gap-4">

                <div class="form-check">

                    <input
                        id="crime-no"
                        class="form-check-input"
                        type="radio"
                        :value="false"
                        v-model="form.convicted_of_crime"
                    >

                    <label
                        class="form-check-label"
                        for="crime-no"
                    >
                        No
                    </label>

                </div>


                <div class="form-check">

                    <input
                        id="crime-yes"
                        class="form-check-input"
                        type="radio"
                        :value="true"
                        v-model="form.convicted_of_crime"
                    >

                    <label
                        class="form-check-label"
                        for="crime-yes"
                    >
                        Yes
                    </label>

                </div>

            </div>

        </div>


        <div
            v-if="form.convicted_of_crime"
            class="mb-3"
        >

            <label class="form-label">
                If yes, specify crime type
            </label>

            <textarea
                v-model="form.crime_type"
                class="form-control"
                rows="3"
            ></textarea>

        </div>

        <div class="col-md-4 mb-3">
    <label class="form-label">
        Date
    </label>

    <input
        v-model="form.crime_date"
        type="date"
        class="form-control"
    >
</div>

<div class="col-md-6 mb-3">
    <label class="form-label">
        Visitor Name
    </label>

    <input
        v-model="form.visitor_name"
        type="text"
        class="form-control"
        placeholder="Enter visitor name"
    >
</div>
   

        <div class="alert alert-warning mt-3">

            <strong>Important:</strong>

            This registration is for foreign persons wishing
            to perform paragliding in Lebanon.

            Registration does not itself constitute permission
            to fly. Additional authorization may be required.

        </div>

    </div>

</div>
                  </div>


                  <!-- Disciplines -->
<div class="mb-4">
  <label class="form-label fw-bold"> Disciplines <span class="text-danger">*</span>

  </label>
  
  <!-- Always show this container -->
  <div class="border rounded p-3 bg-white">
    
    <!-- Loading State -->
    <div v-if="loadingSports" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2 text-muted">Loading disciplines...</span>
    </div>

    <!-- Disciplines List -->
    <template v-else-if="sports && sports.length">
      <div 
        v-for="sport in sports" 
        :key="sport.id" 
        class="form-check"
      >
        <input
          class="form-check-input"
          type="checkbox"
          :value="sport.id"
          v-model="form.disciplines"
          @change="evaluateDynamicRatings"
          :id="'sport-'+sport.id"
        >
        <label class="form-check-label" :for="'sport-'+sport.id">
          {{ sport.name }}
        </label>
      </div>
    </template>

    <!-- No Disciplines -->
    <div v-else class="text-center py-3 text-muted">
      <i class="bi bi-exclamation-circle me-2"></i>
      No disciplines available.
      <button 
        @click="loadSports" 
        type="button"
        class="btn btn-sm btn-outline-primary ms-2"
      >
        <i class="bi bi-arrow-repeat me-1"></i> Retry
      </button>
    </div>
    
  </div>
</div>
                  <!-- Ratings -->

                  <div
                    class="mb-4"
                    v-if="allowedRatingsOptions.length"
                  >

                    <label class="form-label fw-bold">
                       Ratings <span class="text-danger">*</span>
                    </label>

                    <div class="border rounded p-3">

                      <div
                        v-for="rating in allowedRatingsOptions"
                        :key="rating"
                        class="form-check"
                      >

                        <input
                          class="form-check-input"
                          type="checkbox"
                          :value="rating"
                          v-model="form.ratings"
                          :id="'rating-'+rating"
                        >

                        <label
                          class="form-check-label"
                          :for="'rating-'+rating"
                        >
                          {{ rating }}
                        </label>

                      </div>

                    </div>

                  </div>
                                    <!-- Profile Picture -->

                  <div class="row">

                    <div class="col-md-6 mb-4">

                      <label class="form-label fw-semibold">
                        Profile Picture
                      </label>

                      <input
                        ref="imageInput"
                        type="file"
                        class="form-control"
                        accept="image/jpeg,image/png,image/webp"
                        @change="handleImage"
                      >

                      <small class="text-muted d-block mt-2">
                        Allowed: JPG, PNG, WEBP (Maximum 2 MB)
                      </small>

                      <div
                        v-if="imageFile"
                        class="alert alert-success py-2 mt-3 mb-0"
                      >
                        <i class="bi bi-image-fill me-2"></i>
                        {{ imageFile.name }}
                      </div>

                    </div>

                    <!-- License -->

                    <div class="col-md-6 mb-4">

                      <label class="form-label fw-semibold">
                        Pilot License
                      </label>

                      <input
                        ref="licenseInput"
                        type="file"
                        class="form-control"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        @change="onLicenseChange"
                      >

                      <small class="text-muted d-block mt-2">
                        Allowed: PDF, JPG, PNG, WEBP (Maximum 5 MB)
                      </small>

                      <div
                        v-if="licenseAttachment"
                        class="alert alert-success py-2 mt-3 mb-0"
                      >
                        <i class="bi bi-file-earmark-check-fill me-2"></i>
                        {{ licenseAttachment.name }}
                      </div>

                    </div>

                  </div>

                  <!-- Submit -->

                  <div class="mt-4">

                    <button
                      type="submit"
                      class="btn btn-success w-100 py-3 fw-bold fs-5"
                      :disabled="loading"
                    >

                      <span
                        v-if="loading"
                        class="spinner-border spinner-border-sm me-2"
                      ></span>

                      <i
                        v-else
                        class="bi bi-person-check-fill me-2"
                      ></i>
{{
    loading
        ? 'Submitting Registration...'
        : (
            isInternational
                ? 'Submit Visitor Registration'
                : 'Register Pilot'
        )
}}

                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>

  </ClientOnly>

</template>

<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

const config = useRuntimeConfig()
const route = useRoute()

const isInternational = computed(() => {
  return route.query.type === 'international'
})

const loading = ref(false)
const loadingSports = ref(true) // Add this
const error = ref('')
const successMessage = ref('')

const sports = ref([])
const selectedClub = ref(null)

const imageFile = ref(null)
const licenseAttachment = ref(null)

const passportDocument = ref(null)
const nationalIdDocument = ref(null)
const signatureFile = ref(null)

const imageInput = ref(null)
const licenseInput = ref(null)

const passportInput = ref(null)
const nationalIdInput = ref(null)
const signatureInput = ref(null)

const allowedRatingsOptions = ref([])

// Form validation errors
const formErrors = reactive({
  name: '',
  email: '',
  phone: '',
  blood_type: '',
  password: '',
  password_confirmation: '',
  insurance_provider: '',
  insurance_number: '',
  club: '',
  disciplines: '',
  ratings: '',

  first_name: '',
  father_name: '',
  last_name: '',
  nationality: '',
  sex: '',
  marital_status: '',
  languages: '',
  passport_number: '',
  passport_issuing_authority: '',
  passport_issued_date: '',
  passport_expiry_date: '',
  current_country: '',
  current_city: ''
})

const form = reactive({

  /*
  |--------------------------------------------------------------------------
  | Common LASF registration
  |--------------------------------------------------------------------------
  */

  name: '',
  email: '',
  phone: '',
  date_of_birth: '',

  international_date_of_birth: '',

  password: '',
  password_confirmation: '',

  blood_type: '',

  insurance_provider: '',
  insurance_number: '',

  club_name: '',
  club_code: '',

  disciplines: [],
  ratings: [],


  /*
  |--------------------------------------------------------------------------
  | International Pilot Information
  |--------------------------------------------------------------------------
  */

  first_name: '',
  father_name: '',
  last_name: '',

  mother_full_name: '',
  wife_full_name: '',

  place_of_birth: '',
  nationality: '',

  sex: '',
  marital_status: '',

  languages: '',

  national_id_number: '',
  file_number: '',

  passport_number: '',
  passport_issuing_authority: '',
  passport_issued_date: '',
  passport_expiry_date: '',

  mobile_phone: '',
  alternative_phone: '',

  work_email: '',
  personal_email: '',


  /*
  |--------------------------------------------------------------------------
  | Current Address
  |--------------------------------------------------------------------------
  */

  current_country: '',
  current_city: '',
  current_street_area: '',
  current_building: '',
  current_floor: '',


  /*
  |--------------------------------------------------------------------------
  | Alternative Address
  |--------------------------------------------------------------------------
  */

  alternative_country: '',
  alternative_city: '',
  alternative_street_area: '',
  alternative_building: '',
  alternative_floor: '',


  /*
  |--------------------------------------------------------------------------
  | Employment
  |--------------------------------------------------------------------------
  */

  employer_name: '',
  current_title: '',


  /*
  |--------------------------------------------------------------------------
  | Criminal Record
  |--------------------------------------------------------------------------
  */

  convicted_of_crime: false,
  crime_type: '',

})

const clubs = [
  { code: '01', name: 'Thermique' },
  { code: '02', name: 'CLVL' },
  { code: '03', name: 'Northen Eagles' },
  { code: '04', name: 'Sama Lebnan' },
  { code: '05', name: 'Cedars Paragliding' },
  { code: '06', name: 'Sky to Sea' },
  { code: '07', name: 'Paragliding 961' },
  { code: '08', name: 'Fly GYM' },
  { code: '09', name: 'Gravity Outdoors' },
  { code: '10', name: 'Exit to Nature' },
  { code: '11', name: 'Delta Sports' },
  { code: '12', name: 'FAL' },
  { code: '13', name: 'Fly Paragliding' },
  { code: '14', name: 'Paragliding LB' },
  { code: '15', name: 'ROS Outdoors' }
]

const evaluateDynamicRatings = () => {
  const optionsSet = new Set()

  const selectedSportNames = sports.value
    .filter(s => form.disciplines.includes(s.id))
    .map(s => s.name.toLowerCase())

  const hasParaglideGroup = selectedSportNames.some(name =>
    [
      'paragliding',
      'paramotor',
      'paratrike',
      'speedwing',
      'delta plane',
      'speed wing'
    ].includes(name)
  )

  const hasSkydiveGroup =
    selectedSportNames.some(name =>
      name.includes('skydive')
    )

  if (hasParaglideGroup) {
    [
      'P1',
      'P2',
      'P3',
      'P4',
      'TP Non Commercial',
      'TP Commercial',
      'AI',
      'I',
      'MI'
    ].forEach(rate => optionsSet.add(rate))
  }

  if (hasSkydiveGroup) {
    [
      'A',
      'B',
      'C',
      'D',
      'PRO',
      'Coach',
      'Instructor',
      'Examiner',
      'TAN'
    ].forEach(rate => optionsSet.add(rate))
  }

  allowedRatingsOptions.value = [...optionsSet]

  form.ratings = form.ratings.filter(rate =>
    allowedRatingsOptions.value.includes(rate)
  )
}

const handleImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Profile image must be less than 2 MB.'
    return
  }

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!allowed.includes(file.type)) {
    error.value = 'Profile image must be JPG, PNG or WEBP.'
    return
  }

  error.value = ''
  imageFile.value = file
}

const onLicenseChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'License attachment must be less than 5 MB.'
    return
  }

  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!allowed.includes(file.type)) {
    error.value = 'License must be PDF, JPG, PNG or WEBP.'
    return
  }

  error.value = ''
  licenseAttachment.value = file
}


const onInternationalFileChange = (
  event,
  target,
  maxSize,
  allowedTypes,
  label
) => {

  const file = event.target.files[0]

  if (!file) return

  if (file.size > maxSize) {

    error.value =
      `${label} must be less than ${maxSize / 1024 / 1024} MB.`

    event.target.value = ''

    return
  }

  if (!allowedTypes.includes(file.type)) {

    error.value =
      `${label} has an invalid file format.`

    event.target.value = ''

    return
  }

  error.value = ''

  target.value = file
}


const handlePassportDocument = (event) => {

  onInternationalFileChange(
    event,
    passportDocument,
    10 * 1024 * 1024,
    [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    'Passport document'
  )

}


const handleNationalIdDocument = (event) => {

  onInternationalFileChange(
    event,
    nationalIdDocument,
    10 * 1024 * 1024,
    [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    'National ID document'
  )

}


const handleSignature = (event) => {

  onInternationalFileChange(
    event,
    signatureFile,
    5 * 1024 * 1024,
    [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ],
    'Signature'
  )

}


const updateClub = () => {
  if (!selectedClub.value) return
  form.club_name = selectedClub.value.name
  form.club_code = selectedClub.value.code
}

const loadSports = async (retryCount = 0) => {
  loadingSports.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`${config.public.apiBase}/sports`, {
      timeout: 10000
    })
    
    if (response.data) {
      sports.value = response.data
    } else if (Array.isArray(response)) {
      sports.value = response
    } else {
      sports.value = []
    }
    
    console.log('✅ Sports loaded:', sports.value.length, 'items')
    
    if (sports.value.length === 0 && retryCount < 3) {
      console.log('⚠️ No sports found, retrying...')
      setTimeout(() => loadSports(retryCount + 1), 1000)
    }
    
  } catch (e) {
    console.log('❌ Error loading sports:', e)
    
    if (retryCount < 3) {
      console.log(`🔄 Retrying (${retryCount + 1}/3)...`)
      setTimeout(() => loadSports(retryCount + 1), 2000)
    } else {
      error.value = 'Failed to load disciplines. Please refresh the page.'
      sports.value = []
    }
  } finally {
    loadingSports.value = false
  }
}

// Validate form before submission
const validateForm = () => {
  let isValid = true
  
  // Clear previous errors
  Object.keys(formErrors).forEach(key => formErrors[key] = '')
  
  // Validate Name
  if (!form.name.trim()) {
    formErrors.name = 'Full name is required'
    isValid = false
  }
  
  // Validate Email
  if (!form.email.trim()) {
    formErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Validate Phone
  if (!form.phone.trim()) {
    formErrors.phone = 'Phone number is required'
    isValid = false
  }
  
  // Validate Blood Type
  if (!form.blood_type) {
    formErrors.blood_type = 'Blood type is required'
    isValid = false
  }
  
  // Validate Password
  if (!form.password) {
    formErrors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    formErrors.password = 'Password must be at least 8 characters'
    isValid = false
  }
  
  // Validate Confirm Password
  if (!form.password_confirmation) {
    formErrors.password_confirmation = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.password_confirmation) {
    formErrors.password_confirmation = 'Passwords do not match'
    isValid = false
  }
  
  // Validate Insurance Provider
  if (!form.insurance_provider.trim()) {
    formErrors.insurance_provider = 'Insurance provider is required'
    isValid = false
  }
  
  // Validate Insurance Number
  if (!form.insurance_number.trim()) {
    formErrors.insurance_number = 'Insurance number is required'
    isValid = false
  }
  
// Validate Club

if (isInternational.value) {

  if (!form.club_name.trim()) {

    formErrors.club = 'Club name is required'

    isValid = false

  }

} else {

  if (!selectedClub.value) {

    formErrors.club = 'Please select a club'

    isValid = false

  }

}


  // Validate Disciplines
  if (form.disciplines.length === 0) {
    formErrors.disciplines = 'Please select at least one discipline'
    isValid = false
  }
  
  // Validate Ratings
  if (form.ratings.length === 0) {
    formErrors.ratings = 'Please select at least one rating'
    isValid = false
  }
  
  /*
|--------------------------------------------------------------------------
| International Pilot Validation
|--------------------------------------------------------------------------
*/

if (isInternational.value) {

  if (!form.first_name.trim()) {
    formErrors.first_name = 'First name is required'
    isValid = false
  }

  if (!form.father_name.trim()) {
    formErrors.father_name = 'Father name is required'
    isValid = false
  }

  if (!form.last_name.trim()) {
    formErrors.last_name = 'Last name is required'
    isValid = false
  }

  if (!form.nationality.trim()) {
    formErrors.nationality = 'Nationality is required'
    isValid = false
  }

  if (!form.sex) {
    formErrors.sex = 'Sex is required'
    isValid = false
  }

  if (!form.marital_status) {
    formErrors.marital_status = 'Marital status is required'
    isValid = false
  }

  if (!form.languages.trim()) {
    formErrors.languages = 'Languages are required'
    isValid = false
  }

  if (!form.passport_number.trim()) {
    formErrors.passport_number = 'Passport number is required'
    isValid = false
  }

  if (!form.passport_issuing_authority.trim()) {
    formErrors.passport_issuing_authority =
      'Passport issuing authority is required'

    isValid = false
  }

  if (!form.passport_issued_date) {
    formErrors.passport_issued_date =
      'Passport issued date is required'

    isValid = false
  }

  if (!form.passport_expiry_date) {
    formErrors.passport_expiry_date =
      'Passport expiry date is required'

    isValid = false
  }

  if (!form.current_country.trim()) {
    formErrors.current_country =
      'Current country is required'

    isValid = false
  }

  if (!form.current_city.trim()) {
    formErrors.current_city =
      'Current city is required'

    isValid = false
  }

}

  return isValid
}

// Format phone number - remove spaces and special characters
const formatPhoneNumber = (e) => {
  // Remove all spaces and special characters except numbers and +
  form.phone = form.phone.replace(/[^\d+]/g, '')
  
  // Optional: Limit to 15 characters (international standard)
  if (form.phone.length > 15) {
    form.phone = form.phone.slice(0, 15)
  }
}
const registerPilot = async () => {

  error.value = ''
  successMessage.value = ''

  /*
  |--------------------------------------------------------------------------
  | Validate
  |--------------------------------------------------------------------------
  */

  if (!validateForm()) {

    const firstError =
      document.querySelector('.is-invalid')

    if (firstError) {

      firstError.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })

      firstError.focus()
    }

    return
  }


  loading.value = true


  try {

    const formData = new FormData()

console.log('IS INTERNATIONAL:', isInternational.value)

console.log(
    'FORM DATA is_international:',
    isInternational.value ? '1' : '0'
)
    /*
    |--------------------------------------------------------------------------
    | Registration Type
    |--------------------------------------------------------------------------
    */

    formData.append(
      'is_international',
      isInternational.value ? '1' : '0'
    )


    /*
    |--------------------------------------------------------------------------
    | Common LASF Information
    |--------------------------------------------------------------------------
    */

    formData.append('name', form.name)

    formData.append('email', form.email)

    formData.append('phone', form.phone)

    formData.append(
      'date_of_birth',
      form.date_of_birth || ''
    )

formData.append(
    'crime_date',
    form.crime_date || ''
)

formData.append(
    'visitor_name',
    form.visitor_name || ''
)
    formData.append(
      'password',
      form.password
    )

    formData.append(
      'password_confirmation',
      form.password_confirmation
    )

    formData.append(
      'blood_type',
      form.blood_type
    )

    formData.append(
      'insurance_provider',
      form.insurance_provider || ''
    )

    formData.append(
      'insurance_number',
      form.insurance_number || ''
    )


    /*
    |--------------------------------------------------------------------------
    | Club
    |--------------------------------------------------------------------------
    */

    formData.append(
      'club_name',
      form.club_name || ''
    )

    formData.append(
      'club_code',
      form.club_code || ''
    )


    /*
    |--------------------------------------------------------------------------
    | Disciplines
    |--------------------------------------------------------------------------
    */

    form.disciplines.forEach(id => {

      formData.append(
        'disciplines[]',
        id
      )

    })


    /*
    |--------------------------------------------------------------------------
    | Ratings
    |--------------------------------------------------------------------------
    */

    form.ratings.forEach(rate => {

      formData.append(
        'ratings[]',
        rate
      )

    })


    /*
    |--------------------------------------------------------------------------
    | Profile Image
    |--------------------------------------------------------------------------
    */

    if (imageFile.value) {

      formData.append(
        'image',
        imageFile.value
      )

    }


    /*
    |--------------------------------------------------------------------------
    | Pilot License
    |--------------------------------------------------------------------------
    */

    if (licenseAttachment.value) {

      formData.append(
        'license_attachment',
        licenseAttachment.value
      )

    }


    /*
    |--------------------------------------------------------------------------
    | INTERNATIONAL PILOT
    |--------------------------------------------------------------------------
    */

    if (isInternational.value) {

      /*
      | Personal Information
      */

      formData.append(
        'first_name',
        form.first_name
      )

      formData.append(
        'father_name',
        form.father_name
      )

      formData.append(
        'last_name',
        form.last_name
      )

      formData.append(
        'mother_full_name',
        form.mother_full_name || ''
      )

      formData.append(
        'wife_full_name',
        form.wife_full_name || ''
      )

      formData.append(
        'place_of_birth',
        form.place_of_birth || ''
      )

      formData.append(
        'nationality',
        form.nationality
      )

      formData.append(
        'sex',
        form.sex
      )

      formData.append(
        'marital_status',
        form.marital_status
      )

      formData.append(
        'languages',
        form.languages
      )


      /*
      | Identity
      */

      formData.append(
        'national_id_number',
        form.national_id_number || ''
      )

      formData.append(
        'file_number',
        form.file_number || ''
      )


      /*
      | Passport
      */

      formData.append(
        'passport_number',
        form.passport_number
      )

      formData.append(
        'passport_issuing_authority',
        form.passport_issuing_authority
      )

      formData.append(
        'passport_issued_date',
        form.passport_issued_date
      )

      formData.append(
        'passport_expiry_date',
        form.passport_expiry_date
      )


      /*
      | Phones
      */

      formData.append(
        'mobile_phone',
        form.mobile_phone || ''
      )

      formData.append(
        'alternative_phone',
        form.alternative_phone || ''
      )


      /*
      | Emails
      */

      formData.append(
        'work_email',
        form.work_email || ''
      )

      formData.append(
        'personal_email',
        form.personal_email || ''
      )


      /*
      | Current Address
      */

      formData.append(
        'current_country',
        form.current_country
      )

      formData.append(
        'current_city',
        form.current_city
      )

      formData.append(
        'current_street_area',
        form.current_street_area || ''
      )

      formData.append(
        'current_building',
        form.current_building || ''
      )

      formData.append(
        'current_floor',
        form.current_floor || ''
      )


      /*
      | Alternative Address
      */

      formData.append(
        'alternative_country',
        form.alternative_country || ''
      )

      formData.append(
        'alternative_city',
        form.alternative_city || ''
      )

      formData.append(
        'alternative_street_area',
        form.alternative_street_area || ''
      )

      formData.append(
        'alternative_building',
        form.alternative_building || ''
      )

      formData.append(
        'alternative_floor',
        form.alternative_floor || ''
      )


      /*
      | Employment
      */

      formData.append(
        'employer_name',
        form.employer_name || ''
      )

      formData.append(
        'current_title',
        form.current_title || ''
      )


      /*
      | Criminal Record
      */

      formData.append(
        'convicted_of_crime',
        form.convicted_of_crime ? '1' : '0'
      )

      formData.append(
        'crime_type',
        form.crime_type || ''
      )


      /*
      | Documents
      */

      if (passportDocument.value) {

        formData.append(
          'passport_document',
          passportDocument.value
        )

      }

      if (nationalIdDocument.value) {

        formData.append(
          'national_id_document',
          nationalIdDocument.value
        )

      }

      if (signatureFile.value) {

        formData.append(
          'signature',
          signatureFile.value
        )

      }

    }


    /*
    |--------------------------------------------------------------------------
    | Send to Laravel
    |--------------------------------------------------------------------------
    */

    const response = await $fetch(
      `${config.public.apiBase}/register`,
      {
        method: 'POST',
        body: formData
      }
    )


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    successMessage.value =
      `Registration successful. Your LASF member number is ${response.license_number}. Redirecting to home page...`


    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    Object.assign(form, {

      name: '',
      email: '',
      phone: '',
      date_of_birth: '',

      password: '',
      password_confirmation: '',

      blood_type: '',

      insurance_provider: '',
      insurance_number: '',

      club_name: '',
      club_code: '',

      disciplines: [],
      ratings: [],

      first_name: '',
      father_name: '',
      last_name: '',

      mother_full_name: '',
      wife_full_name: '',

      place_of_birth: '',
      nationality: '',

      sex: '',
      marital_status: '',
      languages: '',

      national_id_number: '',
      file_number: '',

      passport_number: '',
      passport_issuing_authority: '',
      passport_issued_date: '',
      passport_expiry_date: '',

      mobile_phone: '',
      alternative_phone: '',

      work_email: '',
      personal_email: '',

      current_country: '',
      current_city: '',
      current_street_area: '',
      current_building: '',
      current_floor: '',

      alternative_country: '',
      alternative_city: '',
      alternative_street_area: '',
      alternative_building: '',
      alternative_floor: '',

      employer_name: '',
      current_title: '',

  convicted_of_crime: false,
crime_type: '',
crime_date: '',
visitor_name: '',
    })


    selectedClub.value = null

    imageFile.value = null
    licenseAttachment.value = null

    passportDocument.value = null
    nationalIdDocument.value = null
    signatureFile.value = null

    allowedRatingsOptions.value = []


    /*
    |--------------------------------------------------------------------------
    | Clear file inputs
    |--------------------------------------------------------------------------
    */

    if (imageInput.value) {
      imageInput.value.value = ''
    }

    if (licenseInput.value) {
      licenseInput.value.value = ''
    }

    if (passportInput.value) {
      passportInput.value.value = ''
    }

    if (nationalIdInput.value) {
      nationalIdInput.value.value = ''
    }

    if (signatureInput.value) {
      signatureInput.value.value = ''
    }


    /*
    |--------------------------------------------------------------------------
    | Redirect
    |--------------------------------------------------------------------------
    */

    setTimeout(() => {

      navigateTo('/')

    }, 2500)


  } catch (err) {

    console.log(err)
    console.log(err.data)


    if (err?.data?.errors) {

      const serverErrors =
        err.data.errors


      Object.keys(serverErrors).forEach(key => {

        if (formErrors[key] !== undefined) {

          formErrors[key] =
            serverErrors[key][0]

        }

      })


      error.value =
        Object.values(serverErrors)
          .flat()
          .join('\n')

    } else {

      error.value =
        err?.data?.message ||
        err?.message ||
        'Registration failed.'

    }

  } finally {

    loading.value = false

  }

}

onMounted(() => {
  loadSports()
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #f5f7fa 0%,
    #c3cfe2 100%
  );
  padding-top: 100px;
}

.card {
  border-radius: 20px;
}

/* Make sure disciplines are always visible */
.form-check {
  padding: 4px 0 !important;
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block !important;
}

/* Ensure the disciplines border shows error state */
.border.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.text-danger {
  color: #dc3545 !important;
}
.form-check .form-check-input {
    float: left;
    margin-left: 0.5em;
}
.form-check-label{
  margin-left: 5px;
}
</style>