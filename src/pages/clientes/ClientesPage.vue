<script setup lang="ts">
import UsersTable from '../clientes/widgets/ClientesTable.vue'
import { Cliente } from '../clientes/types'
import { useCliente } from '../clientes/composables/useClientes'
import router from '../../router'

const { clientes, isLoading, filters, sorting, pagination, ...usersApi } = useCliente()

const onUserDelete = async (user: Cliente) => {
  await usersApi.removeCliente(user)
}

//Creamos una funcion que nos mande a la vista de registrar cliente
const AgregarCliente = () => {
  router.push('/clientes/agregar')
}

//Creamos una funcion que nos mande a la vista de detalle de cliente

//Creamos una funcion que nos mande a la vista de editar cliente
const EditarCliente = (cliente: Cliente) => {
  router.push({
    path: `/clientes/editar/${cliente.IdCliente}`, // Usar un parámetro de ruta dinámico
    query: { id: cliente.IdCliente },
  })

  console.log('Editar Cliente tiki', cliente)
}

//Creamos una funcion que nos mande a la vista de detalle de cliente
const VerDetalleCliente = (cliente: Cliente) => {
  router.push({
    path: `/clientes/detalle/${cliente.IdCliente}`, // Usar un parámetro de ruta dinámico
    query: { id: cliente.IdCliente },
  })
}
</script>
<template>
  <h1 class="page-title">Clientes</h1>
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
              { label: 'Inactivo', value: 'Falso' },
            ]"
          />
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="AgregarCliente">Añadir</VaButton>
      </div>

      <UsersTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :clientes="clientes"
        :loading="isLoading"
        :pagination="pagination"
        @editUser="EditarCliente"
        @viewDetail="VerDetalleCliente"
        @deleteUser="onUserDelete"
      />
    </VaCardContent>
  </VaCard>
</template>
