<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Ubicaciones } from '../types'
import { useToast } from 'vuestic-ui/web-components'
import { PropType, computed, ref } from 'vue'
import { EditarUbicacion, Pagination, Sorting } from '../../../data/pages/ubicaciones'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Nombre Ubicación', key: 'Ubicacion', sortable: true },
  { label: 'Estado', key: 'EstadoUbicacion', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  ubicaciones: {
    type: Array as PropType<Ubicaciones[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', ubicacion: Ubicaciones): void
  (event: 'delete-user', ubicacion: Ubicaciones): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', ubicacion: Ubicaciones): void
  (event: 'toggle-status', ubicacion: Ubicaciones): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()
const { init: notify } = useToast()

const eliminando = ref(false)

const onUserDelete = async (ubicacion: Ubicaciones) => {
  eliminando.value = true
  const agreed = await confirm({
    title: `Eliminar Ubicacion`,
    message: `Deseas eliminar la ubicacion ${ubicacion.Ubicacion}?`,
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', ubicacion)
  }
  eliminando.value = false
}

const onViewUbicacionDetail = (ubicacion: Ubicaciones) => {
  console.log('Ubicacion a visualizar:', ubicacion)
  router.push({ name: 'detalle-ubicacion', params: { IdUbicacion: ubicacion.IdUbicacion } })
}

const onEditUbicacion = (ubicacion: Ubicaciones) => {
  console.log('Ubicacion a editar:', ubicacion)
  router.push({ name: 'editar-ubicacion', params: { IdUbicacion: ubicacion.IdUbicacion } })
}

const onToggleStatus = async (ubicacion: Ubicaciones) => {
  try {
    // Cambiar el estado del estampado
    const nuevoEstado = ubicacion.EstadoUbicacion === 'Activo' ? 'Inactivo' : 'Activo'
    ubicacion.EstadoUbicacion = nuevoEstado

    // Mostrar el mensaje de confirmación
    const agreed = await confirm({
      title: `Cambiar estado de la ubicacion?`,
      message: `¿Deseas cambiar el estado de la ubicacion ${ubicacion.Ubicacion} a ${nuevoEstado}?`,
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      size: 'small',
      maxWidth: '380px',
    })

    if (agreed) {
      // Editar el estampado en la API
      await EditarUbicacion(ubicacion)

      // Mostrar una notificación de éxito
      notify({
        message: `Estado de la ubicacion ${ubicacion.Ubicacion} cambiado a ${nuevoEstado}`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error al cambiar el estado de la ubicacion:', error)
    // Manejar el error, por ejemplo, mostrar una notificación de error
    notify({
      message: 'Error al cambiar el estado de la ubicacion',
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
    :items="ubicaciones"
    :loading="$props.loading"
  >
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoUbicacion === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Ubicaciones)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Ubicacion"
          color="warning"
          title="Editar"
          @click="onEditUbicacion(rowData as Ubicaciones)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewUbicacionDetail(rowData as Ubicaciones)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar ubicacion"
          title="Eliminar"
          @click="onUserDelete(rowData as Ubicaciones)"
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
