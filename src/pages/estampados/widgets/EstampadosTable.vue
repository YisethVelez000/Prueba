<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { Estampado } from '../types'
import { useToast } from 'vuestic-ui/web-components'
import { PropType, computed, ref } from 'vue'
import { EditarEstampado, Pagination, Sorting } from '../../../data/pages/estampados'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Titulos de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Tipo de estampado', key: 'TipoEstampado', sortable: true },
  { label: 'Precio', key: 'PrecioEstampado', sortable: true },
  { label: 'Estado', key: 'EstadoEstampado', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  estampados: {
    type: Array as PropType<Estampado[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', estampado: Estampado): void
  (event: 'delete-user', estampado: Estampado): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', estampado: Estampado): void
  (event: 'toggle-status', estampado: Estampado): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()
const { init: notify } = useToast()

const eliminando = ref(false)

const onUserDelete = async (estampado: Estampado) => {
  eliminando.value = true
  const agreed = await confirm({
    title: `Eliminar Estampado`,
    message: `Deseas eliminar el estampado ${estampado.TipoEstampado}?`,
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', estampado)
  }
  eliminando.value = false
}

const onViewProveedorDetail = (estampado: Estampado) => {
  console.log('Estampado a visualizar:', estampado)
  router.push({ name: 'detalle-estampado', params: { IdEstampado: estampado.IdEstampado } })
}

const onEditEstampado = (estampado: Estampado) => {
  console.log('Estampado a editar:', estampado)
  router.push({ name: 'editar-estampado', params: { IdEstampado: estampado.IdEstampado } })
}

const onToggleStatus = async (estampado: Estampado) => {
  try {
    // Cambiar el estado del estampado
    const nuevoEstado = estampado.EstadoEstampado === 'Activo' ? 'Inactivo' : 'Activo'
    estampado.EstadoEstampado = nuevoEstado

    // Mostrar el mensaje de confirmación
    const agreed = await confirm({
      title: `Cambiar estado del estampado?`,
      message: `¿Deseas cambiar el estado del estampado ${estampado.TipoEstampado} a ${nuevoEstado}?`,
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      size: 'small',
      maxWidth: '380px',
    })

    if (agreed) {
      // Editar el estampado en la API
      await EditarEstampado(estampado)

      // Mostrar una notificación de éxito
      notify({
        message: `Estado del estampado ${estampado.TipoEstampado} cambiado a ${nuevoEstado}`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })
    }
  } catch (error) {
    console.error('Error al cambiar el estado del estampado:', error)
    // Manejar el error, por ejemplo, mostrar una notificación de error
    notify({
      message: 'Error al cambiar el estado del estampado',
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
    :items="estampados"
    :loading="$props.loading"
  >
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoEstampado === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as Estampado)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Estampado"
          color="warning"
          title="Editar"
          @click="onEditEstampado(rowData as Estampado)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewProveedorDetail(rowData as Estampado)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar estampado"
          title="Eliminar"
          @click="onUserDelete(rowData as Estampado)"
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
