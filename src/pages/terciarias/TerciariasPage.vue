<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/TablaTerciarias.vue'
import EditUserForm from './widgets/RegistrarTerciarias.vue'
import { Terciaria } from './types'
import { useTerciarias } from './composables/useTerciarias'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'

const { init: notify } = useToast()

const { terciarias, fetch, isLoading, filters, sorting, pagination, ...proveedorApi } = useTerciarias()
const router = useRouter()

const userToEdit = ref<Terciaria | null>(null)

const AgregarTerciaria = () => {
  router.push('/terciarias/nuevo')
}

const onUserSaved = async (terciarias: Terciaria) => {
  try {
    if (userToEdit.value) {
      await proveedorApi.EditarTerciaria(terciarias)
    } else {
      await proveedorApi.AgregarTerciaria(terciarias)
      await fetch() // Actualiza la lista de empresas terciarias
    }
  } catch (error) {
    console.error('Error al guardar las empresas Terciarias:', error)
  }
}

const onUserDelete = async (terciarias: Terciaria) => {
  try {
    await proveedorApi.EliminarTerciaria(terciarias)
    await fetch() // Actualiza la lista de proveedores
  } catch (error) {
    console.error('Error al eliminar la Empresa Terciaria:', error)
    notify({
      message: 'Error al eliminar la Empresa Terciarias',
      color: 'error',
    })
  }
}
</script>

<template>
  <h1 class="page-title">Empresas Terceras</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarTerciaria">Agregar </VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :proveedores="terciarias"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar terciarias' : 'Registrar terciarias' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (terciarias) => {
          onUserSaved(terciarias)
          ok()
        }
      "
    />
  </VaModal>
</template>
