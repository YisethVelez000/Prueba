<script setup lang="ts">
import { defineVaDataTableColumns, VaDataTable } from 'vuestic-ui/web-components'
import { OrdenProduccion } from '../type'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/produccion'
import { useVModel } from '@vueuse/core'

//Definimos las columnas de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Numero Orden Produccion', key: 'NumeroOrdenProduccion', sortable: true },
  { label: 'Fecha Estimada', key: 'FechaEstimada', sortable: true },
  { label: 'Es Produccion Interna', key: 'EsProduccionInterna', sortable: true },
  { label: 'Valor a Pagar', key: 'ValorAPagar', sortable: true },
  { label: 'Estado Orden', key: 'EstadoOrden', sortable: true },
  { label: 'Acciones', key: 'actions', sortable: false },
])

//Definimos las propiedades de la tabla
const props = defineProps({
  data: {
    type: Array as PropType<OrdenProduccion[]>,
    required: true,
  },
  pagination: {
    type: Object as PropType<Pagination>,
    required: true,
  },
  sorting: {
    type: Object as PropType<Sorting>,
    required: true,
  },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  loading: { type: Boolean, default: false },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'editOrden', orden: OrdenProduccion): void
  (event: 'deleteOrden', orden: OrdenProduccion): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-details', orden: OrdenProduccion): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))
</script>
<template>
  <VaDataTable
    v-model:sortBy="sortByVModel"
    v-model:sortingOrder="sortingOrderVModel"
    :columns="columns"
    :items="data"
    :loading="$props.loading"
  >
    <template #cell(NumeroOrdenProduccion)="row">
      {{ row.rowData.NumeroOrdenProduccion }}
    </template>
    <template #cell(FechaEstimada)="row">
      {{ row.rowData.FechaEstimada }}
    </template>
    <template #cell(EsProduccionInterna)="row">
      {{ row.rowData.EsProduccionInterna }}
    </template>
    <template #cell(ValorAPagar)="row">
      {{ row.rowData.ValorAPagar }}
    </template>
    <template #cell(EstadoOrden)="row">
      {{ row.rowData.EstadoOrden }}
    </template>
    <template #cell(actions)="row">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          color="warning"
          @click="$emit('editOrden', row.rowData as OrdenProduccion)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="visibility"
          color="info"
          aria-label="View details"
          @click="$emit('view-details', row.rowData as OrdenProduccion)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="error"
          @click="$emit('deleteOrden', row.rowData as OrdenProduccion)"
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
