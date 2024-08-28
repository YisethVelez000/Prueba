<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/UbicacionesTable.vue'
import EditUserForm from './widgets/EditUbicaciones.vue'
import { Ubicaciones } from './types'
import { useUbicaciones } from './composables/useUbicaciones'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/ubicaciones'

const { ubicacion, fetch, isLoading, filters, sorting, pagination, ...ubicacionApi } = useUbicaciones()
const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Ubicaciones | null>(null)

const AgregarUbicacion = () => {
  router.push('/ubicaciones/nuevo')
}

const onUserSaved = async (ubicacion: Ubicaciones) => {
  try {
    if (userToEdit.value) {
      await ubicacionApi.EditarUbicacion(ubicacion)
    } else {
      await ubicacionApi.AgregarUbicacion(ubicacion)
      await fetch() // Actualiza la lista de ubicacion}es
    }
  } catch (error) {
    console.error('Error al guardar la ubicacion:', error)
  }
}

const onUserDelete = async (ubicacion: Ubicaciones) => {
  try {
    await ubicacionApi.EliminarUbicacion(ubicacion)
    notify({
      message: `${ubicacion.Ubicacion} eliminada con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de ubicaciones
  } catch (error) {
    console.error('Error al eliminar ubicacion:', error)
    notify({
      message: 'Error al eliminar ubicacion',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Ubicaciones</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarUbicacion">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :ubicaciones="ubicacion"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Ubicacion' : 'Registrar Ubicacion' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (ubicacion) => {
          onUserSaved(ubicacion)
          ok()
        }
      "
    />
  </VaModal>
</template>
