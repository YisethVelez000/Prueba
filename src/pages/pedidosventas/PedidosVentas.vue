<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref } from 'vue'
import UsersTable from './widgets/TablaPedidosVentas.vue'
import EditUserForm from './widgets/RegistrarPedidosVentas.vue'
import { PedidosVentas } from './types'
import { usePedidosVentas } from './composables/usePedidosVentas'
// import { useToast } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { Pagination } from '../../data/pages/proveedores'

const { pedidosventas, fetch, isLoading, filters, sorting, pagination, ...pedidosApi } = usePedidosVentas()
const router = useRouter()
// const { init: notify } = useToast()
const userToEdit = ref<PedidosVentas | null>(null)

const AgregarPedidosVentas = () => {
  router.push('/pedidosventas/nuevo')
}

const onUserSaved = async (pedidos: PedidosVentas) => {
  try {
    if (userToEdit.value) {
      await pedidosApi.EditarPedidosVentas(pedidos)
    } else {
      await pedidosApi.AgregarPedidosVentas(pedidos)
      await fetch() // Actualiza la lista de pedidos
    }
  } catch (error) {
    console.error('Error al guardar el pedido:', error)
  }
}

const handlePaginationUpdate = (newPagination: Pagination) => {
  pagination.value = newPagination
}
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h1 class="page-title">Pedidos</h1>

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
        <VaButton color="primary" class="mb-4" @click="AgregarPedidosVentas">Agregar Ventas</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :pedidos="pedidosventas"
        :loading="isLoading"
        :pagination="pagination"
        @update:pagination="handlePaginationUpdate"
      />
    </VaCardContent>
  </VaCard>

  <VaModal v-slot="{ cancel, ok }" size="small" mobile-fullscreen close-button hide-default-actions>
    <h1 class="va-h5">{{ userToEdit ? 'Editar Pedido' : 'Registrar Pedido' }}</h1>
    <EditUserForm
      ref="editFormRef"
      :user="userToEdit"
      :save-button-label="userToEdit ? 'Guardar' : 'Agregar'"
      @close="cancel"
      @save="
        (pedidos) => {
          onUserSaved(pedidos)
          ok()
        }
      "
    />
  </VaModal>
</template>
