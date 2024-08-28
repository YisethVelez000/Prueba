<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui'
import { Colores } from '../types'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/colores'
import { useVModel } from '@vueuse/core'
//import { useRouter } from 'vue-router'

// Define las columnas de la tabla
const columns = defineVaDataTableColumns([{ label: 'Color', key: 'Color', sortable: true }])

// Define las propiedades esperadas por el componente
const props = defineProps({
  colores: {
    type: Array as PropType<Colores[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

// Define los eventos emitidos por el componente
const emit = defineEmits<{
  (event: 'edit-user', colores: Colores): void
  (event: 'delete-user', colores: Colores): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', colores: Colores): void
  (event: 'toggle-status', colores: Colores): void
}>()

// Uso de v-model para las propiedades de ordenamiento
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

// Cálculo del número total de páginas
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="colores"
    :loading="loading"
    :pagination="pagination"
    class="compact-table"
  >
    <!-- Plantilla para las acciones en cada fila -->
    <template>
      <div class="flex gap-2 justify-end">
        <!-- Aquí puedes colocar acciones como botones de editar, eliminar, etc. -->
      </div>
    </template>
  </VaDataTable>

  <!-- Barra de paginación y opciones -->
  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ pagination.total }} resultados.</b>
      Resultados por página
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Página anterior"
        :disabled="pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Página siguiente"
        :disabled="pagination.page === totalPages"
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
