<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Terciaria } from '../types'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/terciarias'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre Empresa', key: 'NombreEmpresa', sortable: true },
  { label: 'Nombre Contacto', key: 'NombreContacto', sortable: true },
  { label: 'Télefono', key: 'Telefono', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  proveedores: {
    type: Array as PropType<Terciaria[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', proveedor: Terciaria): void
  (event: 'delete-user', proveedor: Terciaria): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', proveedor: Terciaria): void
}>()
// Mostrar solo los primeros 4
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const { confirm } = useModal()
const router = useRouter()

const onUserDelete = async (proveedor: Terciaria) => {
  const agreed = await confirm({
    title: `Eliminar Proveedor`,
    message: `¿Deseas eliminar el proveedor?`,
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', proveedor)
  }
}
const onViewTerciariasDetail = (terciarias: Terciaria) => {
  console.log('Proveedor a visualizar:', terciarias)
  router.push({ name: 'DetalleTerciarias', params: { IdEmpresa: terciarias.IdEmpresa } })
}

const onEditTerciarias = (terciarias: Terciaria) => {
  console.log('Proveedor a editar:', terciarias)
  router.push({ name: 'EditarTerciarias', params: { IdEmpresa: terciarias.IdEmpresa } })
}

// Cálculo de las páginas totales
const totalPages = computed(() => {
  return Math.ceil(props.pagination.total / props.pagination.perPage)
})

// Reactividad para la paginación
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
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Empresa Tercera"
          color="warning"
          title="Editar"
          @click="onEditTerciarias(rowData as Terciaria)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewTerciariasDetail(rowData as Terciaria)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar Empresa Terciaria"
          title="Eliminar"
          @click="onUserDelete(rowData as Terciaria)"
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

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
