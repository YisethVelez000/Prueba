<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="compras"
    :loading="$props.loading"
  >
    <template #cell(acciones)="{ rowData }">
      <div class="flex justify-center space-x-4">
        <!-- VaSwitch con estado basado en la propiedad 'Anulada' -->
        <VaSwitch
          :model-value="rowData.Anulada === ''"
          size="small"
          title="Anular"
          @change="openAnularModal(rowData)"
        />
        <VaButton
          preset="icon"
          size="small"
          icon="mso-visibility"
          title="Visualizar"
          aria-label="View compra detail"
          @click="viewCompraDetail(rowData)"
        />
      </div>
    </template>
  </VaDataTable>

  <VaModal v-model="isAnularModalVisible" @ok="anularCompra">
    <template #title>Anular Compra</template>
    <template #default>
      <VaTextarea v-model="MotivoAnulacion" label="Motivo de Anulación" />
    </template>
  </VaModal>

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

<script setup lang="ts">
import { defineVaDataTableColumns, VaSwitch, VaModal, VaTextarea, VaButton, DataTableItem } from 'vuestic-ui'
import { Compra } from '../types'
import { PropType, computed, ref, toRef } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/compras'
import { useVModel } from '@vueuse/core'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const columns = defineVaDataTableColumns([
  { label: 'Fecha de la compra', key: 'FechaCompra', sortable: true },
  { label: 'Recibo #', key: 'Recibo', sortable: true },
  { label: 'Precio total', key: 'PrecioTotalCompra', sortable: true },
  { label: 'Acciones', key: 'acciones', align: 'center' },
])

const props = defineProps({
  compras: {
    type: Array as PropType<Compra[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const compras = toRef(props, 'compras')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)
const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))
const isAnularModalVisible = ref(false)
const MotivoAnulacion = ref('')
const currentCompra = ref<Compra | null>(null)

const openAnularModal = (rowData: DataTableItem) => {
  const compra = rowData as Compra // Conversión explícita a tipo Compra
  currentCompra.value = compra
  isAnularModalVisible.value = true
}

const anularCompra = async () => {
  if (currentCompra.value) {
    currentCompra.value.Anulada = 'Sí'
    currentCompra.value.MotivoAnulacion = MotivoAnulacion.value

    try {
      await axios.put(`https://apinodedvp.onrender.com/compras/${currentCompra.value.IdCompra}`, {
        Anulada: 'Sí',
        MotivoAnulacion: MotivoAnulacion.value,
      })

      // Reset modal state
      MotivoAnulacion.value = ''
      isAnularModalVisible.value = false

      // Mostrar mensaje de éxito
      showSuccessMessage('Compra anulada con éxito.')
    } catch (error) {
      console.error('Error al anular la compra:', error)
    }
  }
}

// Establece el estado de los switches basado en el estado de 'Anulada' de cada compra
const switchState = computed(() => {
  return compras.value.map((compra) => compra.Anulada === 'Sí')
})

console.log(switchState)

const showSuccessMessage = (message: string) => {
  const notification = document.createElement('div')
  notification.classList.add('notification')
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 1000)
  }, 3000)
}

const viewCompraDetail = (rowData: DataTableItem) => {
  const compra = rowData as Compra // Conversión explícita a tipo Compra
  router.push({ name: 'detalle-compra', params: { id: compra.IdCompra } })
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.fade-out {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
