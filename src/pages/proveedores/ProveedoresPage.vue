<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/TablaProveedor.vue'
import EditUserForm from './widgets/RegistrarProveedor.vue'
import { Proveedor } from './types'
import { useProveedores } from './composables/useProveedores'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/proveedores'

const { proveedor, fetch, isLoading, filters, sorting, pagination, ...proveedorApi } = useProveedores()
const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Proveedor | null>(null)

const AgregarProveedor = () => {
  router.push('/proveedores/nuevo')
}

const onUserSaved = async (proveedor: Proveedor) => {
  try {
    if (userToEdit.value) {
      await proveedorApi.EditarProveedor(proveedor)
    } else {
      await proveedorApi.AgregarProveedor(proveedor)
      await fetch() // Actualiza la lista de proveedores
    }
  } catch (error) {
    console.error('Error al guardar el proveedor:', error)
  }
}

const onUserDelete = async (proveedor: Proveedor) => {
  try {
    await proveedorApi.EliminarProveedor(proveedor)
    notify({
      message: `${proveedor.NombreProveedor} eliminado con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de proveedores
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error)
    notify({
      message: 'Error al eliminar el proveedor',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Proveedores</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]"
          />
          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton color="primary" class="mb-4" @click="AgregarProveedor">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :proveedores="proveedor"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Proveedor' : 'Registrar Proveedor' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (proveedor) => {
          onUserSaved(proveedor)
          ok()
        }
      "
    />
  </VaModal>
</template>
