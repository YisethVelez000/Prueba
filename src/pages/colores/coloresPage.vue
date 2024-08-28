<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/coloresTable.vue'
import EditUserForm from './widgets/registrarcolor.vue'
import { Colores } from './types'
import { useColores } from './composables/useColores'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/colores'

// Aquí estás importando y usando el hook useColores
const { colores, fetch, isLoading, filters, sorting, pagination, ...proveedorApi } = useColores()
const router = useRouter()

const userToEdit = ref<Colores | null>(null)

// Función para redirigir a la página de agregar color
const AgregarColor = () => {
  router.push('/colores/nuevo')
}

// Función para manejar el guardado de colores
const onUserSaved = async (colores: Colores) => {
  try {
    await proveedorApi.AgregarColor(colores)
    await fetch() // Actualiza la lista de colores después de agregar uno nuevo
  } catch (error) {
    console.error('Error al guardar el color:', error)
    // Aquí podrías agregar notificaciones o mensajes de error según necesites
  }
}

// Función para manejar la actualización de la paginación
const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Colores</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <!-- Botones de filtro y búsqueda -->

          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <!-- Botón para agregar nuevo color -->
        <VaButton color="primary" class="mb-4" @click="AgregarColor">Agregar</VaButton>
      </div>

      <!-- Componente de tabla para mostrar los colores -->
      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :colores="colores"
        :loading="isLoading"
        :pagination="pagination"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <!-- Modal para editar o agregar colores -->
  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Colores' : 'Registrar colores' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (colores) => {
          onUserSaved(colores)
          ok()
        }
      "
    />
  </VaModal>
</template>
<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-td.Color) {
    text-align: center; // Centra el contenido de las celdas de la columna 'Color'
    width: auto; // Ajusta el ancho automáticamente para ocupar solo el espacio necesario
    white-space: nowrap; // Evita el salto de línea dentro de las celdas
    overflow: hidden; // Oculta el desbordamiento de contenido si es necesario
    text-overflow: ellipsis; // Agrega puntos suspensivos si el contenido es demasiado largo
  }
}
</style>
