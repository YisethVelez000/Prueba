<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Insumo } from '../types'
import { PropType, computed, ref } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/insumos'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'
//import { useInsumos } from '../composables/useInsumos' // Ajusta la ruta según tu estructura de proyecto

// Inicializar el composable
// const { insumo, unidadMedida, fetchUnidadMedida } = useInsumos()

// Función para determinar el color de la celda basado en la cantidad  //para poner background getCellColor TEXTO getTextColor
const getBadgeColor = (cantidad: number) => {
  if (cantidad < 10) {
    return 'danger'
  } else if (cantidad < 30) {
    return 'warning'
  } else {
    return 'background-element' // Asumiendo que quieres un color verde para cantidades >= 30
  }
}

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre ', key: 'NombreInsumo', sortable: true },
  { label: 'Cantidad ', key: 'CantidadInsumo', sortable: true },
  { label: 'Iva %', key: 'Iva', sortable: true },
  { label: 'Agotado', key: 'Agotado', sortable: true },
  { label: 'Unidad De Medida', key: 'medidas_has_insumo.UnidadMedida', sortable: true },
  { label: 'Estado ', key: 'EstadoInsumo', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'left' },
])

const props = defineProps({
  insumos: {
    type: Array as PropType<Insumo[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', insumo: Insumo): void
  (event: 'delete-user', insumo: Insumo): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', insumo: Insumo): void
  (event: 'toggle-status', insumo: Insumo): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()

const eliminando = ref(false)

const onUserDelete = async (insumo: Insumo) => {
  eliminando.value = true
  const agreed = await confirm({
    title: `Eliminar insumo`,
    message: `Deseas eliminar el insumo ${insumo.NombreInsumo}?`,
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', insumo)
  }
  eliminando.value = false
}

// const onViewInsumoDetail = (insumo: Insumo) => {
//   console.log('Insumo a visualizar:', insumo)
//   router.push({ name: 'DetalleInsumo', params: { IdInsumo: insumo.IdInsumo } })
// }

const onEditInsumo = (insumo: Insumo) => {
  console.log('Insumo a editar:', insumo)
  router.push({ name: 'EditarInsumo', params: { IdInsumo: insumo.IdInsumo } })
}

const onToggleStatus = async (insumo: Insumo) => {
  const nuevoEstado = insumo.EstadoInsumo === 'Activo' ? 'Inactivo' : 'Activo'
  const agreed = await confirm({
    title: `Cambiar estado del Insumo`,
    message: `¿Deseas cambiar el estado del insumo ${insumo.NombreInsumo} a ${nuevoEstado}?`,
    okText: 'Cambiar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    insumo.EstadoInsumo = nuevoEstado
    emit('toggle-status', insumo)
  }
}
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="insumos"
    :loading="$props.loading"
  >
    <!--getCellColor -->

    <template #cell(CantidadInsumo)="{ rowData }">
      <VaBadge
        class="custom-badge"
        :text="rowData.CantidadInsumo.toString()"
        :color="getBadgeColor(rowData.CantidadInsumo)"
      />
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex justify-start items-center gap-2">
        <VaSwitch
          :model-value="rowData.EstadoInsumo === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Insumo)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          color="warning"
          aria-label="Editar Insumo"
          title="Editar"
          @click="onEditInsumo(rowData as Insumo)"
        />
        <!-- <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewInsumoDetail(rowData as Insumo)"
        /> -->
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar Insumo"
          title="Eliminar"
          @click="onUserDelete(rowData as Insumo)"
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
<!-- eslint-disable prettier/prettier -->

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}

::v-deep(.custom-badge) {
  font-size: 12rem; // Ajustar el tamaño de la fuente según sea necesario
}
</style>
