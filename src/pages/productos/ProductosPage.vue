<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/ProductosTable.vue'
import EditUserForm from './widgets/EditProducto.vue'
import { Producto } from './types'
import { useProductos } from './composables/useProductos'
import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/estampados'

const { producto, fetch, isLoading, filters, sorting, pagination, ...ProductoApi } = useProductos()
const router = useRouter()
const { init: notify } = useToast()
const userToEdit = ref<Producto | null>(null)

const AgregarProducto = () => {
  router.push('/productos/nuevo')
}

const onUserSaved = async (producto: Producto) => {
  try {
    if (userToEdit.value) {
      await ProductoApi.EditarProducto(producto)
    } else {
      await ProductoApi.AgregarProducto(producto)
      await fetch() // Actualiza la lista de estampados
    }
  } catch (error) {
    console.error('Error al guardar el producto:', error)
  }
}

const onUserDelete = async (producto: Producto) => {
  try {
    await ProductoApi.EliminarProducto(producto)
    notify({
      message: `${producto.NombreProductoCatalogo} eliminado con éxito`,
      color: 'success',
    })
    await fetch() // Actualiza la lista de estampados
  } catch (error) {
    console.error('Error al eliminar el producto:', error)
    notify({
      message: 'Error al eliminar el producto',
      color: 'error',
    })
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>

<template>
  <h1 class="page-title">Productos</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarProducto">Agregar</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :productos="producto"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onUserDelete"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Producto' : 'Registrar Producto' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (producto) => {
          onUserSaved(producto)
          ok()
        }
      "
    />
  </VaModal>
</template>
