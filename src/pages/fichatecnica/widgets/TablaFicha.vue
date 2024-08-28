<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { defineVaDataTableColumns, useModal, useToast } from 'vuestic-ui'
import { FichaTecnica } from '../types'
import { PropType } from 'vue'
import { Pagination } from '../../../data/pages/ficha'
import { useRouter } from 'vue-router'
import { ListarFicha } from '../../../data/pages/ficha'

const columns = defineVaDataTableColumns([
  { label: 'Nombre Ficha', key: 'NombreProducto', sortable: true },
  { label: 'Estado', key: 'EstadoFicha', sortable: true },
  { label: 'Acciones', key: 'actions' },
])

const props = defineProps({
  ficha: {
    type: Array as PropType<FichaTecnica[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  // sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  // sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', ficha: FichaTecnica): void
  (event: 'delete-user', ficha: FichaTecnica): void
  (event: 'view-detail', ficha: FichaTecnica): void
  (event: 'toggle-status', ficha: FichaTecnica): void
}>()

// const sortByVModel = useVModel(props, 'sortBy', emit)
// const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()

const onUserDelete = async (ficha: FichaTecnica) => {
  const agreed = await confirm({
    title: `Eliminar ficha técnica`,
    message: `¿Deseas eliminar la ficha ${ficha.NombreProducto}?`,
    okText: 'Eliminar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-user', ficha)
  }
}

const onViewFichaDetail = (ficha: FichaTecnica) => {
  router.push({ name: 'DetalleFichaTecnica', params: { IdFichaTecnica: ficha.IdFichaTecnica } })
}

const onEditFicha = (ficha: FichaTecnica) => {
  router.push({ name: 'EditarFichaTecnica', params: { IdFichaTecnica: ficha.IdFichaTecnica } })
}

const onToggleStatus = async (ficha: FichaTecnica) => {
  const { notify } = useToast()

  const agreed = await confirm({
    title: 'Cambiar estado',
    message: `¿Estás seguro de que quieres cambiar el estado de la ficha técnica ${ficha.NombreProducto}?`,
    okText: 'Cambiar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    try {
      const response = await fetch(`https://apinodedvp.onrender.com/productosfichaTecnica/${ficha.IdFichaTecnica}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EstadoFicha: ficha.EstadoFicha === 'Activo' ? 'Inactivo' : 'Activo',
        }),
      })

      if (response.ok) {
        ficha.EstadoFicha = ficha.EstadoFicha === 'Activo' ? 'Inactivo' : 'Activo'
        emit('toggle-status', ficha)

        const nuevoEstado = ficha.EstadoFicha === 'Activo' ? 'Inactivo' : 'Activo'
        notify({
          message: `El estado de la ficha técnica ${ficha.NombreProducto} ha sido cambiado a ${nuevoEstado}`,
          color: 'success',
        })

        fetchFichas() // Actualiza la lista de fichas
      } else {
        console.error('Error al cambiar el estado de la ficha técnica')
      }
    } catch (error) {
      console.error('Error en la solicitud:', error)
    }
  }
}

const fetchFichas = async () => {
  try {
    const pagination: Pagination = { page: props.pagination.page, perPage: props.pagination.perPage, total: 0 }
    const filters = {} // Puedes añadir filtros si es necesario

    const { data } = await ListarFicha(pagination, filters)

    console.log('Fichas cargadas:', data)
  } catch (error) {
    console.error('Error al cargar las fichas:', error)
  }
}

fetchFichas() // Llama a la función para cargar las fichas al montar el componente
</script>

<template>
  <VaDataTable :columns="columns" :items="ficha" :loading="loading" :pagination="pagination">
    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoFicha === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as FichaTecnica)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Ficha"
          color="warning"
          title="Editar"
          @click="onEditFicha(rowData as FichaTecnica)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewFichaDetail(rowData as FichaTecnica)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Eliminar Empleado"
          title="Eliminar"
          @click="onUserDelete(rowData as FichaTecnica)"
        />
      </div>
    </template>
  </VaDataTable>

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
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Página siguiente"
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
