<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Producto } from '../types'
import { useToast } from 'vuestic-ui/web-components'
import { PropType, computed, ref } from 'vue'
import { EditarProducto, Pagination, Sorting } from '../../../data/pages/productos'
import { EliminarProducto } from '../../../data/pages/productos'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre del producto', key: 'NombreProductoCatalogo', sortable: true },
  { label: 'Precio', key: 'PrecioProducto', sortable: true },
  { label: 'Stock', key: 'Stock', sortable: true },
  //{ label: 'Estado', key: 'Estadoproducto', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  productos: {
    type: Array as PropType<Producto[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', producto: Producto): void
  (event: 'delete-user', producto: Producto): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', producto: Producto): void
  (event: 'toggle-status', producto: Producto): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()
const { init: notify } = useToast()

const eliminando = ref(false)

const onUserDelete = async (producto: Producto) => {
  eliminando.value = true
  const agreed = await confirm({
    title: `Eliminar Producto`,
    message: `Deseas eliminar el producto ${producto.NombreProductoCatalogo}?`,
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      await EliminarProducto(producto, props.productos)
      notify({
        message: `Producto ${producto.NombreProductoCatalogo} eliminado correctamente`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      notify({
        message: error instanceof Error ? error.message : 'Error al eliminar el producto',
        color: 'error',
        duration: 5000,
        position: 'top-right',
      })
    }
  }

  eliminando.value = false
}

const onViewProveedorDetail = (producto: Producto) => {
  console.log('Producto a visualizar:', producto)
  router.push({ name: 'detalle-producto', params: { IdProducto: producto.IdProducto } })
}

const onEditProducto = (producto: Producto) => {
  console.log('Producto a editar:', producto)
  router.push({ name: 'editar-producto', params: { IdProducto: producto.IdProducto } })
}

const onToggleStatus = async (producto: Producto) => {
  try {
    // Cambiar el estado del Producto
    const nuevoEstado = producto.EstadoProducto === 'Activo' ? 'Inactivo' : 'Activo'
    producto.EstadoProducto = nuevoEstado

    // Mostrar el mensaje de confirmación
    const agreed = await confirm({
      title: `Cambiar estado del producto?`,
      message: `¿Deseas cambiar el estado del producto ${producto.NombreProductoCatalogo} a ${nuevoEstado}?`,
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      size: 'small',
      maxWidth: '380px',
    })

    if (agreed) {
      // Editar el producto en la API
      await EditarProducto(producto)

      // Mostrar una notificación de éxito
      notify({
        message: `Estado del producto ${producto.NombreProductoCatalogo} cambiado a ${nuevoEstado}`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error al cambiar el estado del producto:', error)
    // Manejar el error, por ejemplo, mostrar una notificación de error
    notify({
      message: 'Error al cambiar el estado del producto',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="productos"
    :loading="$props.loading"
  >
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoProducto === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Producto)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Producto"
          color="warning"
          title="Editar"
          @click="onEditProducto(rowData as Producto)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewProveedorDetail(rowData as Producto)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar producto"
          title="Eliminar"
          @click="onUserDelete(rowData as Producto)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} resultados.</b>
      Resultados por página
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
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
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

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
