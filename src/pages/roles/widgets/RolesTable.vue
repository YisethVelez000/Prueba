<script setup lang="ts">
import { defineVaDataTableColumns, VaDataTable } from 'vuestic-ui/web-components'
import { Rol } from '../types'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/roles'
import { useVModel } from '@vueuse/core'

//Definimos las columnas de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre', key: 'Nombre', sortable: true },
  { label: 'Descripción', key: 'Descripcion', sortable: true },
  { label: 'Acciones', key: 'actions', sortable: false },
])

//Definimos las propiedades de la tabla
const props = defineProps({
  roles: {
    type: Array as PropType<Rol[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'editUser', rol: Rol): void
  (event: 'deleteUser', rol: Rol): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-details', rol: Rol): void
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
    :items="roles"
    :loading="$props.loading"
  >
    <template #cell(Nombre)="row">
      {{ row.rowData.Nombre }}
    </template>
    <template #cell(Descripcion)="row">
      {{ row.rowData.Descripcion }}
    </template>
    <template #cell(actions)="row">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          color="warning"
          @click="$emit('editUser', row.rowData as Rol)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="visibility"
          color="info"
          aria-label="View details"
          @click="$emit('view-details', row.rowData as Rol)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          @click="$emit('deleteUser', row.rowData as Rol)"
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
