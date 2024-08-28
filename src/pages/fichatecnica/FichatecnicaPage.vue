<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/TablaFicha.vue'
import EditUserForm from './widgets/RegistrarFicha.vue'
import { FichaTecnica } from './types'
import { useFichas } from '../fichatecnica/composables/useFichas'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'

const { ficha, fetch, isLoading, filters, sorting, pagination, ...fichaApi } = useFichas()
const router = useRouter()
const userToEdit = ref<FichaTecnica | null>(null)
const { init: notify } = useToast()

const AgregarFicha = () => {
  router.push('/fichas/nueva')
}

const onUserSaved = async (ficha: FichaTecnica) => {
  try {
    if (userToEdit.value) {
      await fichaApi.EditarFicha(ficha)
    } else {
      await fichaApi.AgregarFicha(ficha)
    }
    await fetch() // Actualiza la lista de fichas
  } catch (error) {
    console.error('Error al guardar la ficha:', error)
  }
}

const onUserDelete = async (ficha: FichaTecnica) => {
  try {
    await fichaApi.EliminarFicha(ficha)
    notify({
      message: `Esta Ficha no se puede eliminar esta asociada a otros procesos`,
      color: 'danger',
    })
    await fetch() // Actualiza la lista de fichas
  } catch (error) {
    console.error('Error al eliminar la ficha:', error)
    notify({
      message: 'Error al eliminar la ficha',
      color: 'error',
    })
  }
}
</script>

<template>
  <h1 class="page-title">Ficha Técnica</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Activo', value: 'Activo' },
              { label: 'Inactivo', value: 'Inactivo' },
            ]"
          />
          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton color="primary" class="mb-4" @click="AgregarFicha">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :ficha="ficha"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar ficha' : 'Registrar ficha' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (ficha: FichaTecnica) => {
          onUserSaved(ficha)
          ok()
        }
      "
    />
  </VaModal>
</template>

<style scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
