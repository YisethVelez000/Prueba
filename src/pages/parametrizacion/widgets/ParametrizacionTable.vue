<script setup lang="ts">
import { defineVaDataTableColumns } from 'vuestic-ui' //useModal
import { Parametrizacion } from '../types'
import { PropType, computed } from 'vue' //ref
import { Pagination, Sorting } from '../../../data/pages/parametrizacion'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre del descuento', key: 'NombreDescuento', sortable: true },
  { label: 'Porcentaje del descuento', key: 'ValorDescuento', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  parametrizaciones: {
    type: Array as PropType<Parametrizacion[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', parametrizacion: Parametrizacion): void
  (event: 'delete-user', parametrizacion: Parametrizacion): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', parametrizacion: Parametrizacion): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

// const { confirm } = useModal().
const router = useRouter()

// const eliminando = ref(false)

// const onUserDelete = async (parametrizacion: Parametrizacion) => {
//   eliminando.value = true
//   const agreed = await confirm({
//     title: `Eliminar parametrizacion`,
//     message: `Deseas eliminar la parametrizacion ${parametrizacion.NombreDescuento}?`,
//     okText: 'Aceptar',
//     cancelText: 'Cancelar',
//     size: 'small',
//     maxWidth: '380px',
//   })

//   if (agreed) {
//     emit('delete-user', parametrizacion)
//   }
//   eliminando.value = false
// }

// const onViewProveedorDetail = (parametrizacion: Parametrizacion) => {
//   console.log('parametrizacion a visualizar:', parametrizacion)
//   router.push({ name: 'detalle-parametrizacion', params: { IdParametrizacion: parametrizacion.IdParametrizacion } })
// }

const onEditparametrizacion = (parametrizacion: Parametrizacion) => {
  console.log('parametrizacion a editar:', parametrizacion)
  router.push({ name: 'editar-parametrizacion', params: { IdParametrizacion: parametrizacion.IdParametrizacion } })
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="parametrizaciones"
    :loading="$props.loading"
  >
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar parametrizacion"
          color="warning"
          title="Editar"
          @click="onEditparametrizacion(rowData as Parametrizacion)"
        />
        <!-- <VaButton
          preset="primary"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewProveedorDetail(rowData as Parametrizacion)"
        /> -->
        <!-- <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar parametrizacion"
          title="Eliminar"
          @click="onUserDelete(rowData as Parametrizacion)"
        /> -->
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
