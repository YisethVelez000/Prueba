<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/ParametrizacionTable.vue'
import EditUserForm from './widgets/ParametrizacionForm.vue'
import { Parametrizacion } from './types'
import { useParametrizacion } from './composables/useParametrizacion'
import { useToast } from 'vuestic-ui'
// import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/estampados'

const { parametrizacion, fetch, isLoading, filters, sorting, pagination, ...ParametrizacionApi } = useParametrizacion()
// const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Parametrizacion | null>(null)

// const AgregarParametrizacion = () => {
//   router.push('/parametrizacion/nuevo')
// }

const onUserSaved = async (parametrizacion: Parametrizacion) => {
  try {
    if (userToEdit.value) {
      await ParametrizacionApi.EditarParametrizacion(parametrizacion)
    } else {
      await ParametrizacionApi.AgregarParametrizacion(parametrizacion)
      await fetch() // Actualiza la lista de estampados
    }
  } catch (error) {
    console.error('Error al guardar la parametrizacion:', error)
  }
}

const onUserDelete = async (parametrizacion: Parametrizacion) => {
  try {
    await ParametrizacionApi.EliminarParametrizacion(parametrizacion)
    notify({
      message: `${parametrizacion.NombreDescuento} eliminado con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de estampados
  } catch (error) {
    console.error('Error al eliminar la parametrizacion:', error)
    notify({
      message: 'Error al eliminar la parametrizacion',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Parametrizacion</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <!-- <VaButton color="primary" class="mb-4" @click="AgregarParametrizacion">Agregar</VaButton> -->
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :parametrizaciones="parametrizacion"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Parametrizacion' : 'Registrar Parametrizacion' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (parametrizacion) => {
          onUserSaved(parametrizacion)
          ok()
        }
      "
    />
  </VaModal>
</template>
