<template>
    <div class="board-admin container-fluid">

        <!-- Header -->
        <div class="dashboard-header mb-4">
            <div class="d-flex justify-content-between align-items-center">

                <div>
                    <h1 class="display-6 fw-bold text-dark mb-2">
                        <i class="bi bi-person-badge me-3 text-primary"></i>
                        LASF Board
                    </h1>

                    <p class="text-muted mb-0">
                        Manage LASF board members and their information
                    </p>
                </div>

                <button
                    class="btn btn-primary d-flex align-items-center"
                    @click="openCreateModal"
                >
                    <i class="bi bi-plus-circle me-2"></i>
                    Add Board Member
                </button>

            </div>
        </div>


        <!-- Statistics -->
        <div class="row g-4 mb-4">

            <div class="col-md-4">
                <div class="card border-0 bg-primary-subtle h-100">
                    <div class="card-body text-center p-4">

                        <div class="fw-bold fs-3 text-primary">
                            {{ members.length }}
                        </div>

                        <small class="text-muted">
                            Total Board Members
                        </small>

                    </div>
                </div>
            </div>


            <div class="col-md-4">
                <div class="card border-0 bg-success-subtle h-100">
                    <div class="card-body text-center p-4">

                        <div class="fw-bold fs-3 text-success">
                            {{ activeMembers }}
                        </div>

                        <small class="text-muted">
                            Active Members
                        </small>

                    </div>
                </div>
            </div>


            <div class="col-md-4">
                <div class="card border-0 bg-secondary-subtle h-100">
                    <div class="card-body text-center p-4">

                        <div class="fw-bold fs-3 text-secondary">
                            {{ inactiveMembers }}
                        </div>

                        <small class="text-muted">
                            Inactive Members
                        </small>

                    </div>
                </div>
            </div>

        </div>


        <!-- Board Members -->
        <div class="card shadow-sm border-0">

            <div class="card-header bg-white border-0 py-3">
                <div class="d-flex justify-content-between align-items-center">

                    <div>
                        <h5 class="mb-1 fw-bold">
                            Board Members
                        </h5>

                        <small class="text-muted">
                            Manage the members displayed on the LASF website
                        </small>
                    </div>

                </div>
            </div>


            <div class="card-body">

                <!-- Loading -->
                <div
                    v-if="loading"
                    class="text-center py-5"
                >
                    <div
                        class="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p class="mt-2 text-muted">
                        Loading board members...
                    </p>
                </div>


                <!-- Empty -->
                <div
                    v-else-if="members.length === 0"
                    class="text-center py-5"
                >
                    <i class="bi bi-people display-4 text-muted"></i>

                    <h5 class="mt-3">
                        No board members yet
                    </h5>

                    <p class="text-muted">
                        Add your first LASF board member.
                    </p>

                    <button
                        class="btn btn-primary"
                        @click="openCreateModal"
                    >
                        <i class="bi bi-plus-circle me-2"></i>
                        Add Board Member
                    </button>
                </div>


                <!-- Members Grid -->
                <div
                    v-else
                    class="row g-4"
                >

                    <div
                        v-for="member in members"
                        :key="member.id"
                        class="col-xl-3 col-lg-4 col-md-6"
                    >

                        <div class="card board-member-card h-100 border shadow-sm">

                            <!-- Image -->
                            <div class="member-image-wrapper">

                                <img
                                    v-if="member.image"
                                    :src="getImageUrl(member.image)"
                                    :alt="member.name"
                                    class="member-image"
                                >

                                <div
                                    v-else
                                    class="member-placeholder"
                                >
                                    <i class="bi bi-person"></i>
                                </div>

                                <!-- Status -->
                                <span
                                    class="status-badge"
                                    :class="member.is_active
                                        ? 'bg-success'
                                        : 'bg-secondary'"
                                >
                                    {{ member.is_active ? 'Active' : 'Inactive' }}
                                </span>

                            </div>


                            <!-- Content -->
                            <div class="card-body">

                                <h5 class="fw-bold text-dark mb-1">
                                    {{ member.name }}
                                </h5>

                                <div class="text-primary fw-semibold mb-3">
                                    {{ member.position }}
                                </div>

                                <p
                                    v-if="member.short_bio"
                                    class="text-muted small mb-3"
                                >
                                    {{ member.short_bio }}
                                </p>

                                <div class="small text-muted mb-3">
                                    <i class="bi bi-sort-numeric-down me-2"></i>
                                    Display order: {{ member.sort_order }}
                                </div>


                                <!-- Actions -->
                                <div class="d-flex gap-2">

                                    <button
                                        class="btn btn-sm btn-outline-primary flex-fill"
                                        @click="editMember(member)"
                                    >
                                        <i class="bi bi-pencil me-1"></i>
                                        Edit
                                    </button>

                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        @click="confirmDelete(member)"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- Create / Edit Modal -->
        <div
            v-if="showModal"
            class="modal-backdrop-custom"
        ></div>

        <div
            v-if="showModal"
            class="modal-custom"
            @click.self="closeModal"
        >

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content border-0 shadow">

                    <!-- Header -->
                    <div
                        class="modal-header text-white"
                        :class="editingMember ? 'bg-primary' : 'bg-success'"
                    >

                        <h5 class="modal-title">

                            <i
                                class="bi me-2"
                                :class="editingMember
                                    ? 'bi-pencil-square'
                                    : 'bi-plus-circle'"
                            ></i>

                            {{ editingMember
                                ? 'Edit Board Member'
                                : 'Add Board Member'
                            }}

                        </h5>

                        <button
                            type="button"
                            class="btn-close btn-close-white"
                            @click="closeModal"
                        ></button>

                    </div>


                    <!-- Form -->
                    <form
                        @submit.prevent="saveMember"
                        enctype="multipart/form-data"
                    >

                        <div class="modal-body p-4">

                            <div class="row g-3">

                                <!-- Image -->
                                <div class="col-12">

                                    <label class="form-label fw-bold">
                                        Member Photo
                                    </label>

                                    <div
                                        v-if="imagePreview"
                                        class="mb-3"
                                    >

                                        <img
                                            :src="imagePreview"
                                            class="rounded border"
                                            style="
                                                width: 120px;
                                                height: 120px;
                                                object-fit: cover;
                                            "
                                        >

                                        <div>
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-link text-danger px-0"
                                                @click="removeImage"
                                            >
                                                Remove Photo
                                            </button>
                                        </div>

                                    </div>

                                    <input
                                        ref="fileInput"
                                        type="file"
                                        class="form-control"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        @change="handleImageUpload"
                                    >

                                    <small class="text-muted">
                                        JPG, PNG or WEBP. Maximum 5MB.
                                    </small>

                                </div>


                                <!-- Name -->
                                <div class="col-md-6">

                                    <label class="form-label fw-bold">
                                        Name
                                        <span class="text-danger">*</span>
                                    </label>

                                    <input
                                        v-model="form.name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Enter member name"
                                        required
                                    >

                                </div>


                                <!-- Position -->
                                <div class="col-md-6">

                                    <label class="form-label fw-bold">
                                        Position
                                        <span class="text-danger">*</span>
                                    </label>

                                    <input
                                        v-model="form.position"
                                        type="text"
                                        class="form-control"
                                        placeholder="e.g. President"
                                        required
                                    >

                                </div>


                                <!-- Bio -->
                                <div class="col-12">

                                    <label class="form-label fw-bold">
                                        Short Bio
                                    </label>

                                    <textarea
                                        v-model="form.short_bio"
                                        class="form-control"
                                        rows="4"
                                        placeholder="Short description about this board member..."
                                    ></textarea>

                                </div>


                                <!-- Sort Order -->
                                <div class="col-md-6">

                                    <label class="form-label fw-bold">
                                        Display Order
                                    </label>

                                    <input
                                        v-model.number="form.sort_order"
                                        type="number"
                                        min="0"
                                        class="form-control"
                                    >

                                    <small class="text-muted">
                                        Lower numbers appear first.
                                    </small>

                                </div>


                                <!-- Active -->
                                <div class="col-md-6">

                                    <label class="form-label fw-bold">
                                        Status
                                    </label>

                                    <select
                                        v-model="form.is_active"
                                        class="form-select"
                                    >
                                        <option :value="true">
                                            Active
                                        </option>

                                        <option :value="false">
                                            Inactive
                                        </option>
                                    </select>

                                </div>

                            </div>

                        </div>


                        <div class="modal-footer bg-light">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                @click="closeModal"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                class="btn btn-primary"
                                :disabled="saving"
                            >

                                <span
                                    v-if="saving"
                                    class="spinner-border spinner-border-sm me-2"
                                ></span>

                                {{ editingMember
                                    ? 'Update Member'
                                    : 'Save Member'
                                }}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>


        <!-- Delete Modal -->
        <div
            v-if="showDeleteModal"
            class="modal-backdrop-custom"
        ></div>

        <div
            v-if="showDeleteModal"
            class="modal-custom"
            @click.self="closeDeleteModal"
        >

            <div class="modal-dialog modal-dialog-centered">

                <div class="modal-content border-0 shadow">

                    <div class="modal-header bg-danger text-white">

                        <h5 class="modal-title">
                            <i class="bi bi-trash me-2"></i>
                            Confirm Delete
                        </h5>

                        <button
                            type="button"
                            class="btn-close btn-close-white"
                            @click="closeDeleteModal"
                        ></button>

                    </div>


                    <div class="modal-body text-center p-4">

                        <i class="bi bi-person-x display-4 text-danger mb-3"></i>

                        <p class="mb-0">
                            Delete board member
                            <strong>
                                {{ memberToDelete?.name }}
                            </strong>?
                        </p>

                        <small class="text-muted">
                            This action cannot be undone.
                        </small>

                    </div>


                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            @click="closeDeleteModal"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="deleteMember"
                            :disabled="deleting"
                        >
                            <span
                                v-if="deleting"
                                class="spinner-border spinner-border-sm me-2"
                            ></span>

                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| Do NOT use middleware: 'auth' here.
| Your existing admin pages use the admin layout.
*/
definePageMeta({
    layout: 'admin'
})


const authStore = useAuthStore()
const config = useRuntimeConfig()


// ---------------------------------------------------------
// State
// ---------------------------------------------------------

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const members = ref([])

const showModal = ref(false)
const showDeleteModal = ref(false)

const editingMember = ref(null)
const memberToDelete = ref(null)

const imageFile = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)


// ---------------------------------------------------------
// Form
// ---------------------------------------------------------

const form = ref({
    name: '',
    position: '',
    short_bio: '',
    sort_order: 0,
    is_active: true
})


// ---------------------------------------------------------
// Statistics
// ---------------------------------------------------------

const activeMembers = computed(() => {
    return members.value.filter(member => member.is_active).length
})

const inactiveMembers = computed(() => {
    return members.value.filter(member => !member.is_active).length
})


// ---------------------------------------------------------
// API
// ---------------------------------------------------------

const fetchMembers = async () => {

    loading.value = true

    try {

        const response = await $fetch(
            `${config.public.apiBase}/admin/board-members`,
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        members.value = Array.isArray(response)
            ? response
            : []

    } catch (error) {

        console.error('Failed to load board members:', error)

        alert(
            error?.data?.message ||
            'Failed to load board members.'
        )

    } finally {

        loading.value = false

    }
}


// ---------------------------------------------------------
// Image
// ---------------------------------------------------------

const getImageUrl = (image) => {

    if (!image) return null

    const apiBase = config.public.apiBase
        .replace(/\/api\/?$/, '')

    return `${apiBase}/storage/${image}`
}


const handleImageUpload = (event) => {

    const file = event.target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {

        alert('Image must be smaller than 5MB.')

        event.target.value = ''

        return
    }

    imageFile.value = file

    imagePreview.value = URL.createObjectURL(file)

}


const removeImage = () => {

    imageFile.value = null
    imagePreview.value = null

    if (fileInput.value) {
        fileInput.value.value = ''
    }

}


// ---------------------------------------------------------
// Modal
// ---------------------------------------------------------

const resetForm = () => {

    form.value = {
        name: '',
        position: '',
        short_bio: '',
        sort_order: 0,
        is_active: true
    }

    imageFile.value = null
    imagePreview.value = null

    if (fileInput.value) {
        fileInput.value.value = ''
    }

}


const openCreateModal = () => {

    editingMember.value = null

    resetForm()

    showModal.value = true

}


const editMember = (member) => {

    editingMember.value = member

    form.value = {
        name: member.name || '',
        position: member.position || '',
        short_bio: member.short_bio || '',
        sort_order: member.sort_order ?? 0,
        is_active: Boolean(member.is_active)
    }

    imageFile.value = null

    imagePreview.value = member.image
        ? getImageUrl(member.image)
        : null

    showModal.value = true

}


const closeModal = () => {

    showModal.value = false

    editingMember.value = null

    resetForm()

}


// ---------------------------------------------------------
// Save
// ---------------------------------------------------------

const saveMember = async () => {

    saving.value = true

    try {

        const formData = new FormData()

        formData.append(
            'name',
            form.value.name
        )

        formData.append(
            'position',
            form.value.position
        )

        formData.append(
            'short_bio',
            form.value.short_bio || ''
        )

        formData.append(
            'sort_order',
            String(form.value.sort_order ?? 0)
        )

        formData.append(
            'is_active',
            form.value.is_active ? '1' : '0'
        )


        if (imageFile.value) {

            formData.append(
                'image',
                imageFile.value
            )

        }


        let url = `${config.public.apiBase}/admin/board-members`

        if (editingMember.value) {

            url += `/${editingMember.value.id}`

            formData.append('_method', 'PUT')

        }


        const response = await $fetch(
            url,
            {
                method: 'POST',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: formData
            }
        )


        console.log('Board member saved:', response)

        closeModal()

        await fetchMembers()

        alert(
            editingMember.value
                ? 'Board member updated successfully.'
                : 'Board member created successfully.'
        )

    } catch (error) {

        console.error(
            'Failed to save board member:',
            error
        )

        console.error(
            'Validation errors:',
            error?.data?.errors
        )

        alert(
            error?.data?.message ||
            JSON.stringify(
                error?.data?.errors ||
                'Failed to save board member.'
            )
        )

    } finally {

        saving.value = false

    }

}


// ---------------------------------------------------------
// Delete
// ---------------------------------------------------------

const confirmDelete = (member) => {

    memberToDelete.value = member

    showDeleteModal.value = true

}


const closeDeleteModal = () => {

    showDeleteModal.value = false

    memberToDelete.value = null

}


const deleteMember = async () => {

    if (!memberToDelete.value) return

    deleting.value = true

    try {

        await $fetch(
            `${config.public.apiBase}/admin/board-members/${memberToDelete.value.id}`,
            {
                method: 'DELETE',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        closeDeleteModal()

        await fetchMembers()

        alert('Board member deleted successfully.')

    } catch (error) {

        console.error(
            'Failed to delete board member:',
            error
        )

        alert(
            error?.data?.message ||
            'Failed to delete board member.'
        )

    } finally {

        deleting.value = false

    }

}


// ---------------------------------------------------------
// Initial load
// ---------------------------------------------------------

onMounted(() => {
    fetchMembers()
})

</script>


<style scoped>

.board-member-card {
    transition: all 0.2s ease;
    overflow: hidden;
}

.board-member-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.member-image-wrapper {
    position: relative;
    height: 240px;
    background: #f8f9fa;
}

.member-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.member-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #adb5bd;
    font-size: 4rem;
}

.status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1040;
}

.modal-custom {
    position: fixed;
    inset: 0;
    z-index: 1050;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-custom .modal-dialog {
    width: 100%;
    max-width: 800px;
}

@media (max-width: 768px) {

    .dashboard-header .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 15px;
    }

    .member-image-wrapper {
        height: 220px;
    }

}

</style>