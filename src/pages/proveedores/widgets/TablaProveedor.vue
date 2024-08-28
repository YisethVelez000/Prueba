<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Proveedor } from '../types'
import { PropType, ref } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/proveedores'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useToast } from 'vuestic-ui'

// Asegúrate de importar una biblioteca de notificaciones adecuada

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre', key: 'NombreProveedor', sortable: true },
  { label: 'Nombre Contacto', key: 'NombreContacto', sortable: true },
  { label: 'Apellido Contacto', key: 'ApellidoContacto', sortable: true },
  { label: 'Telefono Empresa', key: 'TelefonoEmpresa', sortable: true },
  { label: 'Estado', key: 'EstadoProveedor', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  proveedores: {
    type: Array as PropType<Proveedor[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', proveedor: Proveedor): void
  (event: 'delete-user', proveedor: Proveedor): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', proveedor: Proveedor): void
  (event: 'toggle-status', proveedor: Proveedor): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
// const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()

const eliminando = ref(false)

const onUserDelete = async (proveedor: Proveedor) => {
  eliminando.value = true
  const agreed = await confirm({
    title: `Eliminar Proveedor`,
    message: ` Deseas eliminar el proveedor ${proveedor.NombreProveedor}?`,
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', proveedor)
  }
  eliminando.value = false
}

const onViewProveedorDetail = (proveedor: Proveedor) => {
  console.log('Proveedor a visualizar:', proveedor)
  router.push({ name: 'DetalleProveedor', params: { IdProveedor: proveedor.IdProveedor } })
}

const onEditProveedor = (proveedor: Proveedor) => {
  console.log('Proveedor a editar:', proveedor)
  router.push({ name: 'EditarProveedor', params: { IdProveedor: proveedor.IdProveedor } })
}

const onToggleStatus = async (proveedor: any) => {
  const router = useRouter() // Obtener la instancia de Vue Router
  const { notify } = useToast() // Obtener la instancia de useToast

  // Confirmación para cambiar el estado del usuario
  const agreed = await confirm({
    title: 'Cambiar estado',
    message: `¿Estás seguro de que quieres cambiar el estado de ${proveedor.NombreProveedor}?`,
    okText: 'Cambiar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      const response = await fetch(`https://apinodedvp.onrender.com/proveedor/${proveedor.IdProveedor}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoProveedor: proveedor.EstadoProveedor === 'Activo' ? 'Inactivo' : 'Activo',
        }),
      })

      if (response.ok) {
        // Emitimos mensaje para confirmar que se ha cambiado el estado del usuario
        emit('toggle-status', proveedor)
        console.log('Estado cambiado')

        // Añadimos un mensaje de éxito
        const nuevoEstado = proveedor.EstadoProveedor === 'Activo' ? 'Inactivo' : 'Activo'
        notify({
          message: ` El estado de ${proveedor.NombreProveedor} ha sido cambiado a ${nuevoEstado}`,
          color: 'success',
        })

        // Recargar la página después de la respuesta exitosa
        router.go(0) // Usar Vue Router para recargar la página
      } else {
        console.log('Error al cambiar el estado')
      }
    } catch (error) {
      console.log('Error en la solicitud:', error)
    }
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="proveedores"
    :loading="loading"
    :pagination="pagination"
  >
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoProveedor === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Proveedor)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Proveedor"
          color="warning"
          title="Editar"
          @click="onEditProveedor(rowData as Proveedor)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewProveedorDetail(rowData as Proveedor)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar proveedor"
          title="Eliminar"
          @click="onUserDelete(rowData as Proveedor)"
        />
      </div>
    </template>
  </VaDataTable>

  <!-- <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ pagination.total }} resultados.</b>
      Resultados por página
      <VaSelect v-model="pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="pagination.page === 1"
        @click="pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="pagination.page === totalPages"
        @click="pagination.page++"
      />
      <VaPagination
        v-model="pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div> -->
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
