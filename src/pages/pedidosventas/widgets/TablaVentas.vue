<!-- eslint-disable prettier/prettier -->
<!-- TablePedidos.vue -->
<script setup lang="ts">
import { defineVaDataTableColumns, useModal, VaButton, VaDataTable, VaModal } from 'vuestic-ui'
import { PedidosVentas } from '../types'
import { PropType, computed, ref } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/pedidosventas'
import { useVModel } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Definir columnas de la tabla
const columns = defineVaDataTableColumns([
  { label: 'Numero Pedido', key: 'NumeroPedido', sortable: true },
  { label: 'Total', key: 'TotalPedido', sortable: true },
  { label: 'Fecha Entrega', key: 'FechaEntrega', sortable: true },
  { label: 'Estado Pedido', key: 'EstadoPedido', sortable: true },
  { label: 'Comprobante Pago', key: 'ComprobantePago', sortable: true },
  { label: 'Estado Venta', key: 'EstadoVenta', sortable: true },
  { label: 'Acciones', key: 'actions', align: 'right' },
])

const props = defineProps({
  pedidos: {
    type: Array as PropType<PedidosVentas[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-user', pedidos: PedidosVentas): void
  (event: 'delete-user', pedidos: PedidosVentas): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
  (event: 'view-detail', pedidos: PedidosVentas): void
  (event: 'toggle-status', pedidos: PedidosVentas): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()
const router = useRouter()

const onViewPedidosDetail = (pedidos: PedidosVentas) => {
  console.log('Pedido a visualizar:', pedidos)
  router.push({ name: 'DetallePedidosVentas', params: { NumeroPedido: pedidos.NumeroPedido } })
}

const onEditPedidos = (pedidos: PedidosVentas) => {
  console.log('Pedido a editar:', pedidos)
  router.push({ name: 'EditarPedidosVentas', params: { NumeroPedido: pedidos.NumeroPedido } })
}

const onToggleStatus = async (pedidos: PedidosVentas) => {
  const nuevoEstado = pedidos.EstadoVenta === 'Activo' ? 'Inactivo' : 'Activo'
  const agreed = await confirm({
    title: `Cambiar estado de la venta`,
    message: `¿Deseas cambiar el estado de la venta ${pedidos.NumeroPedido} a ${nuevoEstado}?`,
    okText: 'Cambiar',
    cancelText: 'Cancelar',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    pedidos.EstadoVenta = nuevoEstado
    emit('toggle-status', pedidos)
  }
}

const showModal = ref(false)
const selectedPedidoId = ref<number | null>(null)
const selectedFile = ref<File | null>(null)

const fileName = (url: string | undefined) => {
  if (!url) return ''
  const fileName = url.split('/').pop() // Obtiene el nombre del archivo de la URL
  return fileName || ''
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}
const uploadComprobante = async () => {
  if (selectedPedidoId.value && selectedFile.value) {
    try {
      const formData = new FormData()
      formData.append('ComprobantePago', selectedFile.value)
      const uploadUrl = `https://apinodedvp.onrender.com/pedidosventas/upload-comprobante/${selectedPedidoId.value}`

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error al subir el archivo: ${response.statusText}`)
      }

      if (response.ok) {
        const data = await response.json()
        // Manejar la URL del comprobante aquí, por ejemplo, actualizando la tabla de pedidos
        showModal.value = false

        // Actualizar el pedido con la URL del comprobante
        const updatedPedido = props.pedidos.find((pedido) => pedido.NumeroPedido === selectedPedidoId.value)
        if (updatedPedido) {
          updatedPedido.ComprobantePago = data.url
        }
      } else {
        console.error('Error subiendo la imagen')
      }
    } catch (error) {
      console.error('Error en la subida de la imagen:', error)
    }
  }
}

const openModal = (NumeroPedido: number) => {
  selectedPedidoId.value = NumeroPedido
  showModal.value = true
}
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="pedidos"
    :loading="$props.loading"
    class="elevation-1"
  >
    <template #cell(ComprobantePago)="{ rowData }">
      <div>
        <span v-if="rowData.ComprobantePago && rowData.ComprobantePago !== 'N/A'">{{
          fileName(rowData.ComprobantePago)
        }}</span>
        <VaButton
          v-if="rowData.EstadoPedido === 'Aceptado' && (rowData.ComprobantePago === 'N/A' || !rowData.ComprobantePago)"
          preset="primary"
          size="small"
          @click="openModal(rowData.NumeroPedido)"
        >
          Subir Comprobante
        </VaButton>
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaSwitch
          :model-value="rowData.EstadoVenta === 'Activo'"
          size="small"
          title="Estado"
          @change="() => onToggleStatus(rowData as PedidosVentas)"
        />
        <VaButton
          preset="warning"
          size="small"
          icon="mso-edit"
          aria-label="Editar Pedido"
          color="warning"
          title="Editar"
          @click="onEditPedidos(rowData as PedidosVentas)"
        />
        <VaButton
          preset="info"
          size="small"
          icon="mso-visibility"
          color="primary"
          aria-label="Ver Detalle"
          title="Detalle"
          @click="onViewPedidosDetail(rowData as PedidosVentas)"
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

  <!-- Modal para subir comprobante de pago -->
  <VaModal v-model:modelValue="showModal" hide-default-actions @close="showModal = false">
    <template #header>
      <h3 class="text-primary font-bold">Comprobante de Pago</h3>
    </template>
    <form @submit.prevent="uploadComprobante">
      <div class="modal-body mt-5">
        <label for="fileInput">Sube aquí tu comprobante de pago:</label>
        <br />
        <br />
        <input id="fileInput" type="file" accept="image/*" required @change="onFileChange" />
      </div>
    </form>
    <template #body> </template>
    <template #footer>
      <div class="modal-footer">
        <VaButton @click="showModal = false">Cancelar</VaButton>
        <VaButton color="primary" @click="uploadComprobante">Guardar</VaButton>
      </div>
    </template>
  </VaModal>
</template>
<!-- eslint-disable prettier/prettier -->

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px;
}
</style>
