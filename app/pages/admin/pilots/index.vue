<template>
  <div class="pilots-admin container-fluid">
    
<div class="dashboard-header mb-4 shadow-sm p-4 bg-white rounded hide-on-print">
  <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
    <div>
      <h1 class="display-6 fw-bold text-dark mb-1">
        <i class="bi bi-people-fill me-2 text-primary"></i> Pilots Registry
      </h1>
      <p class="text-muted mb-0">Manage member logs, tracking configurations, and badge metrics.</p>
    </div>
    <div class="d-flex gap-2 align-items-center flex-wrap">
      <!-- Search Input -->
      <div class="position-relative">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search pilots..."
          style="width: 200px; padding-right: 30px;"
        />
        <i
          v-if="searchQuery"
          class="bi bi-x-circle position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
          style="cursor: pointer;"
          @click="searchQuery = ''; handleSearch();"
        ></i>
        <i
          v-else
          class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
        ></i>
      </div>

<button
  class="btn btn-outline-danger shadow-sm"
  @click="downloadAllBadges"
  :disabled="downloadingBadges"
>
  <span
    v-if="downloadingBadges"
    class="spinner-border spinner-border-sm me-1"
  ></span>

  <i
    v-else
    class="bi bi-file-earmark-zip-fill me-1"
  ></i>

  {{ downloadingBadges ? 'Creating ZIP...' : 'Download All Badges' }}
</button>

      <button class="btn btn-primary shadow-sm" @click="openCreateModal">
        <i class="bi bi-plus-circle me-1"></i> Register Member
      </button>
    </div>
  </div>
</div>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show shadow-sm hide-on-print" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <div class="card shadow-sm border-0 hide-on-print">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Pilot Info</th>
                <th>License Number</th>
                <th>Disciplines</th>
                <th>Ratings Matrix</th>
                <th>Club Connection</th>
                <th>Socials</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pilot in pilots" :key="pilot.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img 
                      :src="getAvatarUrl(pilot.pilot_profile?.image)" 
                      class="rounded-circle me-3 border" 
                      style="width: 45px; height: 45px; object-fit: cover;"
                      @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
                    >
                    <div>
                      <div class="fw-bold text-dark">{{ pilot.name }}</div>
                      <small class="text-muted d-block">{{ pilot.email }}</small>
                      <small v-if="pilot.phone" class="text-secondary font-roboto text-xs">{{ pilot.phone }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-dark font-roboto px-2 py-1">
                    {{ pilot.pilot_profile?.license_number || 'Pending' }}
                  </span>
                  <div class="text-muted text-xs font-semibold mt-1">{{ pilot.pilot_profile?.designation || 'Pilot Member' }}</div>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-for="disc in pilot.pilot_profile?.disciplines" :key="disc.id" class="badge bg-info text-dark text-capitalize px-2 py-1">
                      {{ disc.name }}
                    </span>
                    <span v-if="!pilot.pilot_profile?.disciplines?.length" class="text-muted small italic">None</span>
                  </div>
                </td>
                <td><span class="small fw-bold text-secondary font-roboto">{{ pilot.pilot_profile?.ratings || 'N/A' }}</span></td>
                <td>
                  <span class="small d-block fw-bold text-dark">{{ pilot.pilot_profile?.club_name || 'N/A' }}</span>
                  <small class="text-muted font-roboto text-xs">Code: {{ pilot.pilot_profile?.club_code || '--' }}</small>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <a v-if="pilot.pilot_profile?.facebook_url" :href="pilot.pilot_profile.facebook_url" target="_blank" class="text-primary"><i class="bi bi-facebook h5 mb-0"></i></a>
                    <a v-if="pilot.pilot_profile?.instagram_url" :href="pilot.pilot_profile.instagram_url" target="_blank" class="text-danger"><i class="bi bi-instagram h5 mb-0"></i></a>
                    <span v-if="!pilot.pilot_profile?.facebook_url && !pilot.pilot_profile?.instagram_url" class="text-muted small text-xs">--</span>
                  </div>
                </td>
            <td>
  <span class="text-success small fw-bold font-roboto">
    19/05/2027
  </span>
</td>

<td>

    <!-- Pending -->
    <span
        v-if="!pilot.is_approved"
        class="badge bg-warning text-dark"
    >
        Pending Approval
    </span>

    <!-- Approved + Active -->
    <span
        v-else-if="!pilot.pilot_profile?.is_banned"
        class="badge bg-success"
    >
        Approved
    </span>

    <!-- Banned -->
    <div
        v-else
        class="d-flex flex-column gap-1"
    >

        <span class="badge bg-danger">
            Banned
        </span>

        <small class="text-danger fw-bold">

            Until

            {{ formatDate(pilot.pilot_profile.ban_until) }}

        </small>
        <small
    v-if="pilot.pilot_profile?.ban_reason"
    class="text-muted"
>

    {{ pilot.pilot_profile.ban_reason }}

</small>

    </div>

</td>

<td class="text-center">
              <div class="btn-group">

  <button
    v-if="!pilot.is_approved"
    class="btn btn-sm btn-success"
    @click="approvePilot(pilot.id)"
  >
    Approve
  </button>

  <button
    class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
    @click="generateCardView(pilot)"
  >
    <i class="bi bi-printer"></i> Badge
  </button>

  <button
    class="btn btn-sm btn-outline-primary"
    @click="editPilot(pilot)"
  >
    <i class="bi bi-pencil"></i>
  </button>

  <button
    class="btn btn-sm btn-outline-danger"
    @click="confirmDelete(pilot)"
  >
    <i class="bi bi-trash"></i>
  </button>
<button
    class="btn btn-sm btn-outline-secondary"
    @click="viewLicenses(pilot)"
>
    <i class="bi bi-file-earmark-pdf"></i>
</button>
</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Pagination -->
<div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center flex-wrap gap-3 py-3 hide-on-print">
  <div class="text-muted small">
    Showing <strong>{{ pilots.length }}</strong> of <strong>{{ total }}</strong> pilots
    <span v-if="perPage < total" class="ms-2">
      (Page {{ currentPage }} of {{ lastPage }})
    </span>
  </div>
  
  <nav aria-label="Pilot pagination">
    <ul class="pagination pagination-sm mb-0">
      <li class="page-item" :class="{ disabled: currentPage <= 1 }">
        <a class="page-link" href="#" @click.prevent="prevPage">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
      
      <li 
        v-for="page in visiblePages" 
        :key="page" 
        class="page-item" 
        :class="{ active: page === currentPage }"
      >
        <a class="page-link" href="#" @click.prevent="goToPage(page)">
          {{ page }}
        </a>
      </li>
      
      <li class="page-item" :class="{ disabled: currentPage >= lastPage }">
        <a class="page-link" href="#" @click.prevent="nextPage">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    </ul>
  </nav>
</div>

    <!-- Modals (Create/Edit & Delete) -->
    <div v-if="showCreateModal" class="modal-backdrop fade show hide-on-print"></div>
    <div v-if="showCreateModal" class="modal fade show d-block hide-on-print" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-sliders me-2"></i> {{ editingPilot ? 'Modify Pilot Profile' : 'Register New Profile' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="savePilot" class="d-flex flex-column overflow-hidden">
            <div class="modal-body p-4 bg-light">
              <div class="row g-3 bg-white p-3 rounded shadow-sm border mb-3">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2"><i class="bi bi-person-badge"></i> Account & Personal Info</h6>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Full Name</label>
                  <input v-model="form.name" type="text" class="form-control" :class="{'is-invalid': fieldErrors.name}" required>
                  <div class="invalid-feedback" v-if="fieldErrors.name">{{ fieldErrors.name[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Email Address</label>
                  <input v-model="form.email" type="email" class="form-control" :class="{'is-invalid': fieldErrors.email}" required>
                  <div class="invalid-feedback" v-if="fieldErrors.email">{{ fieldErrors.email[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Phone Number</label>
                  <input v-model="form.phone" type="text" class="form-control" placeholder="+961..." :class="{'is-invalid': fieldErrors.phone}">
                </div>
                <div class="col-md-6">
  <label class="form-label fw-bold small">
    Date of Birth
  </label>

  <input
    v-model="form.date_of_birth"
    type="date"
    class="form-control"
  >
</div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Blood Type</label>
                  <select v-model="form.blood_type" class="form-select">
                    <option v-for="bt in bloodTypes" :key="bt" :value="bt">{{ bt }}</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 bg-white p-3 rounded shadow-sm border mb-3">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2"><i class="bi bi-shield-shaded"></i> Club Connection & Policy Records</h6>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Club Association</label>
                  <select v-model="selectedClubIndex" class="form-select" :class="{'is-invalid': fieldErrors.club_name}" @change="syncClubFields">
                    <option value="" disabled>Choose Affiliated Registered Club</option>
                    <option v-for="(club, index) in clubsList" :key="index" :value="index">
                      {{ club.code }}) {{ club.name }}
                    </option>
                  </select>
                  <div class="invalid-feedback" v-if="fieldErrors.club_name">{{ fieldErrors.club_name[0] }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Designation Label</label>
                  <input v-model="form.designation" type="text" class="form-control" placeholder="e.g. Tandem Pilot">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Insurance Provider</label>
                  <input v-model="form.insurance_provider" type="text" class="form-control" placeholder="e.g. Commercial Insurance">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Insurance Policy Number</label>
                  <input v-model="form.insurance_number" type="text" class="form-control" placeholder="Policy ID Tag">
                </div>
              </div>

              <div class="row g-3 bg-white p-3 rounded shadow-sm border mb-3">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2"><i class="bi bi-share"></i> Communication Channels</h6>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Facebook URL</label>
                  <input v-model="form.facebook_url" type="url" class="form-control" placeholder="https://facebook.com/username">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Instagram URL</label>
                  <input v-model="form.instagram_url" type="url" class="form-control" placeholder="https://instagram.com/username">
                </div>
              </div>

              <div class="row g-3 bg-white p-3 rounded shadow-sm border mb-3">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2"><i class="bi bi-award"></i> Sports & Associated Ratings</h6>
                <div class="col-12">
                  <label class="form-label fw-bold text-dark small d-block">Active Registered Disciplines</label>
                  <div class="d-flex flex-wrap gap-3 p-3 bg-light rounded border">
                    <div v-for="sport in availableSports" :key="sport.id" class="form-check">
                      <input type="checkbox" class="form-check-input" :id="'sport-' + sport.id" :value="sport.id" v-model="form.disciplines" @change="evaluateDynamicRatings">
                      <label class="form-check-label cursor-pointer text-capitalize small fw-semibold" :for="'sport-' + sport.id">
                        {{ sport.name }}
                      </label>
                    </div>
                  </div>
                </div>

                <div class="col-12" v-if="allowedRatingsOptions.length">
                  <label class="form-label fw-bold text-dark small d-block">Qualified Skill Ratings Matrix</label>
                  <div class="d-flex flex-wrap gap-2 p-2 bg-light rounded border">
                    <div v-for="rate in allowedRatingsOptions" :key="rate" class="form-check bg-white px-3 py-1 rounded border">
                      <input type="checkbox" class="form-check-input" :id="'rate-'+rate" :value="rate" v-model="form.ratings">
                      <label class="form-check-label cursor-pointer font-roboto small fw-bold text-secondary" :for="'rate-'+rate">{{ rate }}</label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-3 bg-white p-3 rounded shadow-sm border">
                <h6 class="text-primary fw-bold border-bottom pb-2 mb-2"><i class="bi bi-folder-symlink"></i> Media Vault Assets</h6>
                <div class="row g-3 bg-white p-3 rounded shadow-sm border mt-3">

    <h6 class="text-danger fw-bold border-bottom pb-2 mb-2">
        <i class="bi bi-shield-lock"></i>
        Pilot Restrictions
    </h6>

    <div class="col-md-12">

        <div class="form-check form-switch">

            <input
                class="form-check-input"
                type="checkbox"
                id="isBanned"
                v-model="form.is_banned"
            >

            <label
                class="form-check-label fw-bold"
                for="isBanned"
            >
                Ban this Pilot
            </label>

        </div>

    </div>

    <template v-if="form.is_banned">

        <div class="col-md-6">

            <label class="form-label fw-bold">
                Ban Until
            </label>

            <input
                type="date"
                class="form-control"
                v-model="form.ban_until"
            >

        </div>

        <div class="col-md-12">

            <label class="form-label fw-bold">
                Ban Reason
            </label>

            <textarea
                class="form-control"
                rows="4"
                v-model="form.ban_reason"
                placeholder="Explain why this pilot is banned..."
            ></textarea>

        </div>

    </template>

</div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Primary Avatar Picture</label>
                  <input type="file" @change="handleFileUpload" class="form-control" accept="image/*">
                  <div v-if="editingPilot && form.image && !imageFile" class="mt-2 text-muted text-xs text-truncate">
                    Current: {{ form.image.split('/').pop() }}
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Supporting Documents File</label>
                  <input type="file" @change="handleMultipleLicenses" class="form-control" multiple accept=".pdf,image/*">
                </div>
              </div>
            </div>
            <div class="modal-footer bg-white border-top mt-auto">
              <button type="button" class="btn btn-light border" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-dark px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span> Save Membership Info
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop fade show hide-on-print"></div>
    <div v-if="showDeleteModal" class="modal fade show d-block hide-on-print" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title fw-bold">Revoke Account Entry</h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body py-4">
            Are you completely sure you want to drop pilot <strong>{{ pilotToDelete?.name }}</strong>? This clears all vault attachments.
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger px-3" @click="deletePilot" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span> Confirm Wipe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview/Print Modal matching image_9caf9d.jpg exactly -->
    <div v-if="activeCardPilot" class="modal-backdrop fade show hide-on-print"></div>
    <div v-if="activeCardPilot" class="modal fade show d-block print-friendly-overlay" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg printable-modal-dialog">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-body p-0 d-flex flex-column align-items-center gap-4">
            
            <div class="lasf-badge-container">
              
              <!-- FRONT OF BADGE -->
              <div id="print-badge-front" class="lasf-official-card front-side position-relative">
                <div class="brand-top-band"></div>
                
                <div class="brand-header-area d-flex align-items-center justify-content-center">
                  <div class="brand-logo-graphics">
                    <img src="/assets/images/logocard.png" alt="LASF" class="img-fluid" @error="(e) => e.target.style.display='none'">
                  </div>
                  <div class="brand-title-text"></div>

                  <div class="qr-code-wrapper">
                    <img 
                      v-if="qrCodeData" 
                      :src="qrCodeData" 
                      alt="QR Code" 
                      class="qr-code-image"
                    >
                    <div v-else class="qr-placeholder">
                      <i class="bi bi-qr-code"></i>
                    </div>
                  </div>
                </div>

                <div class="disclaimer-red-block text-start">
                  <p class="m-0 disclaimer-paragraph">
                    The holder of this card pledges to comply with and respect the safety standards and the instructions of the federation and the instructors. He fully understands the risks associated with this sport and releases the LASF from all liability, assuming full responsibility for any damages or losses to property or life, whether caused intentionally or unintentionally.
                  </p>
                  <p class="m-0 contact-line mt-1">
                    For more information or to initiate a claim, please call 71909008.
                  </p>
                </div>
              </div>

              <!-- BACK OF BADGE -->
              <div id="print-badge-back" class="lasf-official-card lasf-official-cardtwo back-side text-start position-relative">
                <div class="brand-top-band"></div>

                <div class="pilot-header-row d-flex align-items-end px-4 pt-3 mb-3">
                  <div class="pilot-photo-frame me-3 position-relative">
<img
    :src="getAvatarUrl(activeCardPilot.pilot_profile?.image)"
    class="pilot-card-img"
/>
                  </div>
                  <div class="pilot-identity pb-1">
                    <div class="p-0 m-0"></div>
                    <div class="pt-5"></div>
                    <div></div>
                    <h2 class="m-0 pilot-fullname text-dark text-truncate">{{ activeCardPilot.name }}</h2>
                    <div class="m-0 pilot-disciplines text-muted text-truncate text-capitalize">
                      {{ formatDisciplinesString(activeCardPilot) }}
                    </div>
                  </div>
                </div>

                <div class="px-4 data-grid-matrix row m-0 g-0">
                  <div class="col-6 p-0 pe-2 d-flex flex-column gap-2">
                    <div>
                      <label class="matrix-label">Member No.</label>
                      <div class="matrix-value text-dark font-roboto">{{ activeCardPilot.pilot_profile?.license_number || 'Pending' }}</div>
                    </div>
                    <div>
                      <label class="matrix-label">Blood type</label>
                      <div class="matrix-value text-dark font-roboto">{{ activeCardPilot.pilot_profile?.blood_type || 'O+' }}</div>
                    </div>
                    <div>
                      <label class="matrix-label">Ratings</label>
                      <div class="matrix-value text-dark font-roboto">{{ activeCardPilot.pilot_profile?.ratings || 'None' }}</div>
                    </div>
                  </div>

                  <div class="col-6 p-0 ps-2 d-flex flex-column gap-2">
                    <div>
                      <label class="matrix-label">Insurance</label>
                      <div class="matrix-value text-dark text-truncate font-roboto" style="max-width: 160px;">
                        {{ activeCardPilot.pilot_profile?.insurance_provider || 'N/A' }} <span v-if="activeCardPilot.pilot_profile?.insurance_number">#{{ activeCardPilot.pilot_profile.insurance_number }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="matrix-label">Club member of</label>
                      <div class="matrix-value text-dark text-truncate font-roboto">{{ activeCardPilot.pilot_profile?.club_name || 'N/A' }}</div>
                    </div>
                    <div>
                      <label class="matrix-label">Valid until</label>
                      <div class="matrix-value text-dark font-roboto">{{ formatDate(activeCardPilot.pilot_profile?.valid_until) || '19/05/2027' }}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="d-flex gap-2 hide-on-print">
              <button class="btn btn-light px-4 border" @click="closeCardPreview">Close Preview</button>
              <button class="btn btn-primary px-4 shadow" @click="printMembershipCard"><i class="bi bi-printer-fill me-2"></i> Print Dual Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showLicensesModal"
    class="modal fade show d-block"
>
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5>License Attachments</h5>

                <button
                    class="btn-close"
                    @click="showLicensesModal=false"
                ></button>
            </div>

            <div class="modal-body">

                <div
                    v-if="!pilotLicenses.length"
                    class="text-muted"
                >
                    No attachments.
                </div>

                <div
                    v-for="file in pilotLicenses"
                    :key="file.index"
                    class="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                >

                    <span>{{ file.name }}</span>

                    <div>

               <a  
    :href="file.view"
    target="_blank"
    class="btn btn-primary btn-sm me-2"
      @click="showLicensesModal = false"
>
    View
</a>


                    </div>

                </div>

            </div>

        </div>
    </div>
</div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick
} from 'vue'
import { useAuthStore } from '~/stores/auth'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
definePageMeta({ layout: 'admin' })
const showLicensesModal = ref(false)

const pilotLicenses = ref([])
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const downloadingBadges = ref(false)
const error = ref(null)
const fieldErrors = ref({})
const pilots = ref([])
const availableSports = ref([])

const qrCodeData = ref(null)

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPilot = ref(null)
const pilotToDelete = ref(null)
const activeCardPilot = ref(null)

const imageFile = ref(null)
const licensesFileList = ref([])
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(20)
const total = ref(0)
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']


// Add search query
const searchQuery = ref('')
let searchTimeout = null

const handleBadgeImageError = (event) => {
  if (event.target.dataset.fallbackApplied) {
    return
  }

  event.target.dataset.fallbackApplied = 'true'
  event.target.src = '/assets/images/avatarpilot.jpg'
}
const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject

    reader.readAsDataURL(blob)
  })
}

const loadImageAsDataUrl = async (img, pilot = null) => {
    if (!img) {
        return false
    }

    if (img.src && img.src.startsWith('data:')) {
        return true
    }

    try {
        let imageUrl = img.src

        /*
         * Pilot photo:
         * Load it through Laravel API so we can authenticate
         * and convert it to Base64 safely for html2canvas.
         */
        if (img.classList.contains('pilot-card-img') && pilot?.id) {
            imageUrl =
                `${config.public.apiBase}/admin/pilots/${pilot.id}/avatar`
        }

        console.log('Loading badge image:', imageUrl)

        const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authStore.token}`,
                Accept: 'image/*'
            },
            cache: 'no-cache'
        })

        if (!response.ok) {
            throw new Error(
                `Image request failed: HTTP ${response.status}`
            )
        }

        const blob = await response.blob()

        if (!blob || !blob.type.startsWith('image/')) {
            throw new Error('Response is not an image.')
        }

        const dataUrl = await blobToDataUrl(blob)

        img.src = dataUrl

        await new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
                resolve()
                return
            }

            img.onload = resolve
            img.onerror = resolve
        })

        console.log('Badge image converted successfully.')

        return true

    } catch (error) {
        console.error(
            'Badge image conversion failed:',
            imageUrl,
            error
        )

        return false
    }
}

const convertImagesToDataUrls = async (element, pilot) => {
    if (!element) {
        return
    }

    const images = element.querySelectorAll('img')

    console.log(
        `Found ${images.length} image(s) inside badge.`
    )

    for (const img of images) {
        await loadImageAsDataUrl(img, pilot)
    }
}



const clubsList = [
  { code: '01', name: 'Thermique' }, { code: '02', name: 'CLVL' },
  { code: '03', name: 'Northen Eagles' }, { code: '04', name: 'Sama Lebnan' },
  { code: '05', name: 'Cedars Paragliding' }, { code: '06', name: 'Sky to Sea' },
  { code: '07', name: 'Paragliding 961' }, { code: '08', name: 'Fly GYM' },
  { code: '09', name: 'Gravity Outdoors' }, { code: '10', name: 'Exit to Nature' },
  { code: '11', name: 'Delta Sports' }, { code: '12', name: 'FAL' },
  { code: '13', name: 'Fly Paragliding' }, { code: '14', name: 'Paragliding LB' },
  { code: '15', name: 'ROS Outdoors' }
]

const selectedClubIndex = ref('')
const allowedRatingsOptions = ref([])

const form = reactive({

  name: '',
  email: '',
  phone: '',

  blood_type: 'O+',

  club_name: '',
  club_code: '',

  insurance_provider: '',
  insurance_number: '',

  facebook_url: '',
  instagram_url: '',

  designation: 'Professional Pilot',

  disciplines: [],

  ratings: [],

  valid_until: '2027-05-19',

  image: '',

  date_of_birth: '',

  // NEW
  is_banned: false,
  ban_until: '',
  ban_reason: ''

})

const getAvatarUrl = (imagePath) => {
  if (!imagePath) return '/assets/images/avatarpilot.jpg'
  let baseUrl = config.public.apiBase
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace(/\/api$/, '')
  }
  return `${baseUrl}${imagePath}`
}

const evaluateDynamicRatings = () => {

  allowedRatingsOptions.value = [
    'P1',
    'P2',
    'P3',
    'P4',
    'TP Non Commercial',
    'TP Commercial',
    'AI',
    'I',
    'MI',
    'A',
    'B',
    'C',
    'D',
    'PRO',
    'Coach',
    'Instructor',
    'Examiner',
    'TAN'
  ]

}
const syncClubFields = () => {
  if (selectedClubIndex.value !== '') {
    const targetClub = clubsList[selectedClubIndex.value]
    form.club_name = targetClub.name
    form.club_code = targetClub.code
  } else {
    form.club_name = ''
    form.club_code = ''
  }
}


const fetchPilots = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const url = `${config.public.apiBase}/admin/pilots?page=${page}&per_page=${perPage.value}`
    const search = searchQuery.value.trim()
    const finalUrl = search ? `${url}&search=${encodeURIComponent(search)}` : url

    const response = await $fetch(finalUrl, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (response.data && response.current_page !== undefined) {
      pilots.value = response.data
      currentPage.value = response.current_page
      lastPage.value = response.last_page
      total.value = response.total
    } else {
      pilots.value = response.data || response
      currentPage.value = 1
      lastPage.value = 1
      total.value = pilots.value.length
    }

    const sportsData = await $fetch(`${config.public.apiBase}/admin/sports`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    availableSports.value = sportsData
  } catch (err) {
    error.value = "Failed processing server content."
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Debounced search handler
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchPilots(1) // Reset to page 1 on search
  }, 500)
}


// Add pagination methods
const goToPage = (page) => {
  if (page < 1 || page > lastPage.value) return
  fetchPilots(page)
}

const nextPage = () => {
  if (currentPage.value < lastPage.value) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}
const visiblePages = computed(() => {
  const pages = []
  const total = lastPage.value
  const current = currentPage.value
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Show first page, last page, and pages around current
    if (current <= 3) {
      // Near start
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      // Near end
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      // Middle
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const savePilot = async () => {
  saving.value = true
  fieldErrors.value = {}
  error.value = null
  
  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('email', form.email)
  formData.append('phone', form.phone || '')
  formData.append(
  'date_of_birth',
  form.date_of_birth || ''
)
formData.append(
    'is_banned',
    form.is_banned ? 1 : 0
)

formData.append(
    'ban_until',
    form.ban_until || ''
)

formData.append(
    'ban_reason',
    form.ban_reason || ''
)
  formData.append('blood_type', form.blood_type)
  formData.append('club_name', form.club_name)
  formData.append('club_code', form.club_code)
  formData.append('insurance_provider', form.insurance_provider || '')
  formData.append('insurance_number', form.insurance_number || '')
  formData.append('facebook_url', form.facebook_url || '')
  formData.append('instagram_url', form.instagram_url || '')
  formData.append('designation', form.designation || '')
  formData.append('valid_until', form.valid_until || '2027-05-19')

  form.disciplines.forEach(id => formData.append('disciplines[]', id))
  form.ratings.forEach(rate => formData.append('ratings[]', rate))

  if (imageFile.value) formData.append('image', imageFile.value)

  if (licensesFileList.value.length) {
    for (let i = 0; i < licensesFileList.value.length; i++) {
      formData.append('licenses[]', licensesFileList.value[i])
    }
  }

  const isEdit = !!editingPilot.value
  if (isEdit) formData.append('_method', 'PUT')

  const url = isEdit 
    ? `${config.public.apiBase}/admin/pilots/${editingPilot.value.id}` 
    : `${config.public.apiBase}/admin/pilots`

  try {
    await $fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}`, 'Accept': 'application/json' },
      body: formData
    })
    alert('Pilot metrics saved successfully!')
    closeModal()
    fetchPilots()
  } catch (err) {
    if (err.status === 422) {
      fieldErrors.value = err.data.errors
      const errMsgs = Object.values(err.data.errors).flat()
      alert(`Validation Failure: ${errMsgs[0] || 'Check syntax.'}`)
    } else {
      console.log(err)

    alert(
        err.data?.error ||
        err.data?.message ||
        'Transaction aborted.'
    )
    }
  } finally {
    saving.value = false
  }
}

const editPilot = (p) => {
  editingPilot.value = p
  Object.assign(form, p)
  
  const prof = p.pilot_profile
  form.blood_type = prof?.blood_type || 'O+'
  form.club_name = prof?.club_name || ''
  form.club_code = prof?.club_code || ''
  form.insurance_provider = prof?.insurance_provider || ''
  form.insurance_number = prof?.insurance_number || ''
  form.facebook_url = prof?.facebook_url || ''
  form.instagram_url = prof?.instagram_url || ''
  form.designation = prof?.designation || 'Professional Pilot'
  form.valid_until = prof?.valid_until || '2027-05-19'
  form.image = prof?.image || ''
  form.date_of_birth =
  prof?.date_of_birth
    ? prof.date_of_birth.substring(0,10)
    : ''
    form.is_banned = prof?.is_banned ?? false

form.ban_until =
    prof?.ban_until
        ? prof.ban_until.substring(0,10)
        : ''

form.ban_reason = prof?.ban_reason ?? ''
  form.disciplines = prof?.disciplines ? prof.disciplines.map(d => d.id) : []
  form.ratings = prof?.ratings ? prof.ratings.split(' | ') : []

  const foundIndex = clubsList.findIndex(c => String(c.code).padStart(2, '0') === String(form.club_code).padStart(2, '0'))
  selectedClubIndex.value = foundIndex !== -1 ? foundIndex : ''
  
  evaluateDynamicRatings()
  showCreateModal.value = true
}

const confirmDelete = (pilot) => {
  pilotToDelete.value = pilot
  showDeleteModal.value = true
}
const approvePilot = async (id) => {

  try {

    await $fetch(
      `${config.public.apiBase}/admin/pilots/${id}/approve`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    alert('Pilot approved successfully')

    fetchPilots()

  } catch (err) {

    alert(
      err?.data?.message ||
      'Approval failed'
    )

  }
}

const deletePilot = async () => {
  deleting.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/pilots/${pilotToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    showDeleteModal.value = false
    alert('Pilot dropped successfully.')
    fetchPilots()
  } catch (err) {
    alert(err.data?.message || 'Wipe action rejected.')
  } finally {
    deleting.value = false
  }
}

const exportPilots = () => {
  window.open(`${config.public.apiBase}/admin/pilots/export?token=${authStore.token}`, '_blank')
}

const importPilots = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    loading.value = true
    const res = await $fetch(`${config.public.apiBase}/admin/pilots/import`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })
    alert(res.message)
    fetchPilots()
  } catch (err) {
    alert(err.data?.message || 'CSV processing rejected.')
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

const viewLicenses = async (pilot) => {

    try {

        pilotLicenses.value = await $fetch(

            `${config.public.apiBase}/admin/pilots/${pilot.id}/licenses`,

            {
                headers:{
                    Authorization:`Bearer ${authStore.token}`
                }
            }

        )

        showLicensesModal.value = true

    } catch(err){

        alert('Unable to load licenses.')

    }

}

/**
 * Generate a QR code for a specific pilot's public profile URL.
 */
const generateQRCodeForPilot = async (pilot) => {
  const license = pilot?.pilot_profile?.license_number

  console.log('License:', license)

  if (!license) {
    qrCodeData.value = null
    return
  }

  try {
    const baseUrl = window.location.origin

    const profileUrl =
      `${baseUrl}/pilot/${encodeURIComponent(license)}`

    console.log('Profile URL:', profileUrl)

    qrCodeData.value = await QRCode.toDataURL(profileUrl)

    console.log('QR generated:', qrCodeData.value)

  } catch (err) {
    console.error(err)

    qrCodeData.value = null
  }
}

const generateCardView = async (pilot) => {
  activeCardPilot.value = pilot

  await generateQRCodeForPilot(pilot)
}

const closeCardPreview = () => {
  activeCardPilot.value = null
  qrCodeData.value = null
}

const printMembershipCard = () => { window.print() }
/*
|--------------------------------------------------------------------------
| Wait for badge images
|--------------------------------------------------------------------------
*/

const waitForBadgeImages = (element) => {

  return new Promise(resolve => {

    const images =
      element.querySelectorAll('img')

    if (!images.length) {
      resolve()
      return
    }

    let completed = 0

    const finish = () => {

      completed++

      if (completed >= images.length) {
        resolve()
      }

    }

    images.forEach(img => {

      if (img.complete) {

        finish()

      } else {

        img.addEventListener(
          'load',
          finish,
          { once: true }
        )

        img.addEventListener(
          'error',
          finish,
          { once: true }
        )

      }

    })

    /*
    |--------------------------------------------------------------------------
    | Safety timeout
    |--------------------------------------------------------------------------
    */

    setTimeout(
      resolve,
      5000
    )

  })
}


/*
|--------------------------------------------------------------------------
| Convert canvas to PNG Blob
|--------------------------------------------------------------------------
*/

const canvasToBlob = (canvas) => {

  return new Promise((resolve, reject) => {

    canvas.toBlob(
      blob => {

        if (blob) {
          resolve(blob)
        } else {
          reject(
            new Error(
              'Could not create PNG blob.'
            )
          )
        }

      },
      'image/png'
    )

  })
}


/*
|--------------------------------------------------------------------------
| Make safe filename
|--------------------------------------------------------------------------
*/

const sanitizeFileName = (name) => {

  return String(name || 'pilot')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'pilot'

}

const downloadAllBadges = async () => {

  if (downloadingBadges.value) {
    return
  }

  downloadingBadges.value = true
  error.value = null

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Get ALL pilots
    |--------------------------------------------------------------------------
    |
    | Your table is paginated at 20 pilots.
    | We do NOT use pilots.value because that contains only
    | the current page.
    |
    */

    const response = await $fetch(
      `${config.public.apiBase}/admin/pilots?per_page=10000`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json'
        }
      }
    )

    const allPilots = response?.data || response || []

    if (!Array.isArray(allPilots) || allPilots.length === 0) {
      alert('No pilots found.')
      return
    }

    console.log(
      `Preparing badges for ${allPilots.length} pilots...`
    )

    /*
    |--------------------------------------------------------------------------
    | 2. Create ZIP
    |--------------------------------------------------------------------------
    */

    const zip = new JSZip()

    /*
    |--------------------------------------------------------------------------
    | 3. Process each pilot one by one
    |--------------------------------------------------------------------------
    */

    let generated = 0

    for (const pilot of allPilots) {

      try {

        /*
        |--------------------------------------------------------------------------
        | Set current pilot
        |--------------------------------------------------------------------------
        */

        activeCardPilot.value = pilot

        /*
        |--------------------------------------------------------------------------
        | Generate this pilot's QR code
        |--------------------------------------------------------------------------
        */

        await generateQRCodeForPilot(pilot)

        /*
        |--------------------------------------------------------------------------
        | Wait until Vue renders the badge
        |--------------------------------------------------------------------------
        */

        await nextTick()

        /*
        |--------------------------------------------------------------------------
        | Wait for images
        |--------------------------------------------------------------------------
        */

        const frontElement =
          document.getElementById('print-badge-front')

        const backElement =
          document.getElementById('print-badge-back')

        if (!frontElement || !backElement) {

          console.warn(
            `Badge elements not found for ${pilot.name}`
          )

          continue
        }

await waitForBadgeImages(frontElement)
await waitForBadgeImages(backElement)

await convertImagesToDataUrls(frontElement, pilot)
await convertImagesToDataUrls(backElement, pilot)

await new Promise(resolve => setTimeout(resolve, 200))

const frontCanvas = await html2canvas(frontElement, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false
})

const backCanvas = await html2canvas(backElement, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false
})
        /*
        |--------------------------------------------------------------------------
        | Convert to PNG blobs
        |--------------------------------------------------------------------------
        */

        const frontBlob = await canvasToBlob(frontCanvas)
        const backBlob = await canvasToBlob(backCanvas)

        /*
        |--------------------------------------------------------------------------
        | Safe filename
        |--------------------------------------------------------------------------
        */

        const pilotName = sanitizeFileName(
          pilot.name || 'pilot'
        )

        const license =
          sanitizeFileName(
            pilot.pilot_profile?.license_number || ''
          )

        const folderName = license
          ? `${pilotName}-${license}`
          : pilotName

        /*
        |--------------------------------------------------------------------------
        | Add files to ZIP
        |--------------------------------------------------------------------------
        */

        zip.file(
          `${folderName}/${folderName}-front.png`,
          frontBlob
        )

        zip.file(
          `${folderName}/${folderName}-back.png`,
          backBlob
        )

        generated++

        console.log(
          `Badge ${generated}/${allPilots.length}: ${pilot.name}`
        )

      } catch (pilotError) {

        console.error(
          `Failed to generate badge for ${pilot.name}`,
          pilotError
        )

      }
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Remove active badge
    |--------------------------------------------------------------------------
    */

    activeCardPilot.value = null
    qrCodeData.value = null

    await nextTick()

    /*
    |--------------------------------------------------------------------------
    | 5. Make ZIP
    |--------------------------------------------------------------------------
    */

    if (generated === 0) {
      throw new Error(
        'No badges could be generated.'
      )
    }

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      },
      metadata => {

        console.log(
          `Creating ZIP: ${Math.round(metadata.percent)}%`
        )

      }
    )

    /*
    |--------------------------------------------------------------------------
    | 6. Download ZIP
    |--------------------------------------------------------------------------
    */

    const downloadUrl =
      window.URL.createObjectURL(zipBlob)

    const link =
      document.createElement('a')

    link.href = downloadUrl

    link.download =
      `LASF-badges-${new Date().toISOString().slice(0, 10)}.zip`

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(downloadUrl)

    alert(
      `Successfully generated ${generated} pilot badges.`
    )

  } catch (err) {

    console.error(
      'Download all badges error:',
      err
    )

    error.value =
      err?.data?.message ||
      err?.message ||
      'Unable to generate all badges.'

    alert(
      error.value
    )

  } finally {

    activeCardPilot.value = null
    qrCodeData.value = null

    downloadingBadges.value = false

  }
}
const formatDisciplinesString = (pilot) => {
  if (!pilot.pilot_profile?.disciplines?.length) return 'No Active Disciplines'
  return pilot.pilot_profile.disciplines.map(d => d.name).join(' | ')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const handleFileUpload = (e) => imageFile.value = e.target.files[0]
const handleMultipleLicenses = (e) => licensesFileList.value = e.target.files

const openCreateModal = () => { resetForm(); showCreateModal.value = true }
const closeModal = () => { showCreateModal.value = false; editingPilot.value = null; imageFile.value = null; licensesFileList.value = []; fieldErrors.value = {} }
const resetForm = () => {

  selectedClubIndex.value = ''

  allowedRatingsOptions.value = []

  Object.assign(form, {

    name: '',
    email: '',
    phone: '',

    blood_type: 'O+',

    club_name: '',
    club_code: '',

    insurance_provider: '',
    insurance_number: '',

    facebook_url: '',
    instagram_url: '',

    designation: 'Professional Pilot',

    disciplines: [],

    ratings: [],

    valid_until: '2027-05-19',

    image: '',

    date_of_birth: '',

    // NEW
    is_banned: false,
    ban_until: '',
    ban_reason: ''

  })

}

onMounted(fetchPilots)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

.cursor-pointer { cursor: pointer; }
.italic { font-style: italic; }
.text-xs { font-size: 0.68rem; }
.font-roboto { font-family: 'Roboto', sans-serif; }

.lasf-badge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.lasf-official-card {
  width: 340px;
  height: 250px;
  background-color: #ffffff !important;
  border-radius: 0px !important; 
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  border: 1px solid #d3d3d3;
  box-sizing: border-box;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}
.lasf-official-cardtwo {
    height: 200px !important;
}
.brand-top-band {
  background-color: #e52427 !important;
  height: 30px;
  width: 100%;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}

.brand-header-area {
  height: 110px;
  padding: 0 30px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.brand-logo-graphics {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-logo-graphics .logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.brand-title-text {
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}
.brand-title-text .main-title {
  font-size: 1rem;
  color: #333333;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 1.5px;
}

.qr-code-wrapper {
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 3px;
}
.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.qr-placeholder {
  font-size: 1.5rem;
  color: #ccc;
}

.disclaimer-red-block {
  background-color: #e52427 !important;
  height: 116px;
  padding: 12px 20px;
  color: #ffffff !important;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}
.disclaimer-paragraph {
  font-size: 0.9rem !important;
  line-height: 1.4;
  font-weight: 400;
  text-align: justify;
}
.contact-line {
  font-size: 0.9rem !important;
  font-weight: 500;
}

.pilot-header-row {
  height: 34px;
}
.pilot-photo-frame {
  width: 55px;
  height: 65px;
  background: #f0f0f0 !important;
  overflow: hidden;
  margin-top: -15px; 
  border: 1px solid #d3d3d3;
  z-index: 10;
  print-color-adjust: exact !important;
  -webkit-print-color-adjust: exact !important;
}
.pilot-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pilot-identity {
  max-width: calc(100% - 75px);
}
.pilot-fullname {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111111;
}
.pilot-disciplines {
  font-size: 0.9rem;
  font-weight: 400;
}

.data-grid-matrix .matrix-label {
  display: block;
  font-size: 0.9rem;
  color: #222222;
  margin-bottom: 1px;
  font-weight: 600;
}
.data-grid-matrix .matrix-value {
  font-size: 0.85rem;
  font-weight: 400;
  color: #777777;
}

@media screen {
  .print-friendly-overlay {
    background: rgba(0, 0, 0, 0.6);
  }
}

@media print {
  body, html, #__nuxt, #layout-wrapper {
    visibility: hidden !important;
    background: none !important;
  }
  
  .print-friendly-overlay,
  .printable-modal-dialog,
  .lasf-badge-container,
  .lasf-official-card,
  .lasf-official-card * {
    visibility: visible !important;
  }
  
  .print-friendly-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: none !important;
  }
  
  .hide-on-print {
    display: none !important;
  }
  
  .lasf-official-card {
    border: 1px solid #d3d3d3 !important;
    page-break-inside: avoid;
    margin-bottom: 20px;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
</style>