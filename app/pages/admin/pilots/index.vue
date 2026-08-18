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
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success shadow-sm" @click="exportPilots">
            <i class="bi bi-download me-1"></i> Export
          </button>
          <label class="btn btn-outline-primary mb-0 cursor-pointer shadow-sm">
            <i class="bi bi-upload me-1"></i> Import CSV
            <input type="file" @change="importPilots" hidden accept=".csv">
          </label>
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
                      @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
                    >
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
              <button class="btn btn-light px-4 border" @click="activeCardPilot = null">Close Preview</button>
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
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })
const showLicensesModal = ref(false)

const pilotLicenses = ref([])
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const fieldErrors = ref({})
const pilots = ref([])
const availableSports = ref([])

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPilot = ref(null)
const pilotToDelete = ref(null)
const activeCardPilot = ref(null)

const imageFile = ref(null)
const licensesFileList = ref([])

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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


const fetchPilots = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await $fetch(`${config.public.apiBase}/admin/pilots`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    pilots.value = data.data || data

    const sportsData = await $fetch(`${config.public.apiBase}/admin/sports`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    availableSports.value = sportsData
  } catch (err) {
    error.value = "Failed processing server content."
  } finally {
    loading.value = false
  }
}

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
const generateCardView = (pilot) => { activeCardPilot.value = pilot }
const printMembershipCard = () => { window.print() }

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
  background-color: #ffffff !important; /* Added important to lock white card background */
  border-radius: 0px !important; 
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  border: 1px solid #d3d3d3;
  box-sizing: border-box;
  print-color-adjust: exact !important;         /* Forces color rendering on print */
  -webkit-print-color-adjust: exact !important; /* Forces color rendering on print */
}
.lasf-official-cardtwo {
    height: 200px !important;
}
.brand-top-band {
  background-color: #e52427 !important; /* Added important */
  height: 30px;
  width: 100%;
  print-color-adjust: exact !important;         /* Forces color rendering on print */
  -webkit-print-color-adjust: exact !important; /* Forces color rendering on print */
}

/* Front Side Layout Changes */
.brand-header-area {
  height: 110px;
  padding: 0 30px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
}
.brand-title-text .main-title {
  font-size: 1rem;
  color: #333333;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 1.5px;
}

/* Disclaimer Red Box Changes */
.disclaimer-red-block {
  background-color: #e52427 !important;
  height: 116px;
  padding: 12px 20px;
  color: #ffffff !important;
  print-color-adjust: exact !important;         /* Forces background color rendering on print */
  -webkit-print-color-adjust: exact !important; /* Forces background color rendering on print */
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

/* Back Side Profile Card Changes */
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

/* Metadata Parameters Matrix Grid Grid alignment rules matching layout */
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

/* Screen Mode Layout Enhancements */
@media screen {
  .print-friendly-overlay {
    background: rgba(0, 0, 0, 0.6);
  }
}

/* Strict Print Rule Config matching view standard metrics */
@media print {
  /* Hides everything including background leakages cleanly */
  body, html, #__nuxt, #layout-wrapper {
    visibility: hidden !important;
    background: none !important;
  }
  
  /* Keeps only the badge view visible */
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
    border: 1px solid #d3d3d3 !important; /* Retain your design border outline on paper */
    page-break-inside: avoid;
    margin-bottom: 20px;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
</style>