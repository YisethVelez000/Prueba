<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from '../estampados/widgets/EstampadosTable.vue'
import EditUserForm from './widgets/EditEstampado.vue'
import { Estampado } from '../estampados/types'
import { useEstampados } from '../estampados/composables/useEstampados'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../../src/data/pages/estampados'

const { estampado, fetch, isLoading, filters, sorting, pagination, ...EstampadoApi } = useEstampados()
const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Estampado | null>(null)

const AgregarEstampado = () => {
  router.push('/estampados/nuevo')
}

const onUserSaved = async (estampado: Estampado) => {
  try {
    if (userToEdit.value) {
      await EstampadoApi.EditarEstampado(estampado)
    } else {
      await EstampadoApi.AgregarEstampado(estampado)
      await fetch() // Actualiza la lista de estampados
    }
  } catch (error) {
    console.error('Error al guardar el estampado:', error)
  }
}

const onUserDelete = async (estampado: Estampado) => {
  try {
    await EstampadoApi.EliminarEstampado(estampado)
    notify({
      message: `${estampado.TipoEstampado} eliminado con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de estampados
  } catch (error) {
    console.error('Error al eliminar el estampado:', error)
    notify({
      message: 'Error al eliminar el estampado',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Estampados</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarEstampado">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :estampados="estampado"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Estampado' : 'Registrar Estampado' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (estampado) => {
          onUserSaved(estampado)
          ok()
        }
      "
    />
  </VaModal>
</template>
