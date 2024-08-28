<script setup lang="ts">
import { defineVaDataTableColumns, useToast, VaSwitch } from 'vuestic-ui/web-components'
import { Cliente } from '../types'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/clientes'
import { useVModel } from '@vueuse/core'
const { init: notify } = useToast()
const columns = defineVaDataTableColumns([
  { label: 'Nombre', key: 'Usuario.Nombre', sortable: true },
  { label: 'Apellidos', key: 'Usuario.Apellidos', sortable: true },
  { label: 'Correo Electrónico', key: 'Usuario.CorreoElectronico', sortable: true },
  { label: 'Télefono', key: 'Telefono', sortable: true },
  { label: 'Estado', key: 'Usuario.EstadoUsuario', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  clientes: {
    type: Array as PropType<Cliente[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', cliente: Cliente): void
  (event: 'delete-user', cliente: Cliente): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', cliente: Cliente): void
  (event: 'toggle-status', cliente: Cliente): void
}>()
const onToggleStatus = async (cliente: Cliente, Usuario: Cliente['Usuario']) => {
  //Confirmación de cambio de estado
  const agreed = confirm(`¿Estás seguro de que quieres cambiar el estado de ${cliente.Nombre} ${cliente.Apellidos}?`)

  if (agreed) {
    try {
      const response = await fetch(`https://apinodedvp.onrender.com/clientes/cambiarEstado/${cliente.IdCliente}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoUsuario: (Usuario.EstadoUsuario ?? 'Inactivo') === 'Activo' ? 'Inactivo' : 'Activo',
        }),
      })

      if (response.ok) {
        //Añadir notificación de éxito
        const message = cliente.EstadoUsuario === 'Activo' ? 'Inactivo' : 'Activo'
        notify({
          title: 'Estado cambiado',
          message: `El estado de ${cliente.Nombre} ${cliente.Apellidos} ha sido cambiado a ${message}`,
          color: 'success',
          duration: 5000,
        })
      } else {
        throw new Error('Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error al cambiar estado', error)
    }
  }
}

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))
</script>
<template>
  <VaDataTable
    v-model:sortBy="sortByVModel"
    v-model:sortingOrder="sortingOrderVModel"
    :columns="columns"
    :items="clientes"
    :loading="$props.loading"
  >
    <template #cell(Nombre)="{ rowData }">
      {{ rowData.Usuario.Nombre }}
    </template>
    <template #cell(Apellidos)="{ rowData }">
      {{ rowData.Usuario.Apellidos }}
    </template>
    <template #cell(CorreoElectrónico)="{ rowData }">
      {{ rowData.Usuario.CorreoElectronico }}
    </template>
    <template #cell(Télefono)="{ rowData }">
      {{ rowData.Telefono }}
    </template>
    <template #cell(EstadoUsuario)="{ rowData }">
      {{ rowData.Usuario.EstadoUsuario }}
    </template>
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoUsuario === 'Activo'"
          size="small"
          title="Estado"
          @change="onToggleStatus(rowData as Cliente, rowData.Usuario)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          color="warning"
          aria-label="Edit user"
          @click="$emit('edit-user', rowData as Cliente)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="visibility"
          color="info"
          aria-label="View user"
          @click="$emit('view-detail', rowData as Cliente)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete user"
          @click="$emit('delete-user', rowData as Cliente)"
        />
      </div>
    </template>
  </VaDataTable>
  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} results.</b>
      Results per page
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="$props.pagination.page === totalPages"
        @click="$props.pagination.page++"
      />
      <VaPagination
        v-model="$props.pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div>
</template>
