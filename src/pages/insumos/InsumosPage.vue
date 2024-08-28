<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/TablaInsumo.vue'
import EditUserForm from './widgets/RegistrarInsumo.vue'
import { Insumo } from './types'
import { useInsumos } from './composables/useInsumos'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/insumos'

const { insumo, fetch, isLoading, filters, sorting, pagination, ...insumoApi } = useInsumos()
const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Insumo | null>(null)

const AgregarInsumo = () => {
  router.push('/insumos/nuevo')
}

const onUserSaved = async (insumo: Insumo) => {
  try {
    if (userToEdit.value) {
      await insumoApi.EditarInsumo(insumo)
    } else {
      await insumoApi.AgregarInsumo(insumo)
      await fetch() // Actualiza la lista de insumo
    }
  } catch (error) {
    console.error('Error al guardar el insumo:', error)
  }
}

const onUserDelete = async (insumo: Insumo) => {
  try {
    await insumoApi.EliminarInsumo(insumo)
    notify({
      message: `${insumo.NombreInsumo} eliminado con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de insumos
  } catch (error) {
    console.error('Error al eliminar el insumo:', error)
    notify({
      message: 'Error al eliminar el insumo',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>
<!-- eslint-disable prettier/prettier -->
<template>
  <h1 class="page-title">Insumos</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarInsumo">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :insumos="insumo"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Insumo' : 'Registrar Insumo' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (insumo) => {
          onUserSaved(insumo)
          ok()
        }
      "
    />
  </VaModal>
</template>
