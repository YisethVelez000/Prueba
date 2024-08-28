<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ComprasTable from './widgets/ComprasTable.vue'
import { Compra } from './types'
import { useCompras } from './composables/useCompras'
import { useToast } from 'vuestic-ui'

const { compras, isLoading, filters, sorting, pagination } = useCompras()
const router = useRouter()
const { init: notify } = useToast()

// Establecer el filtro por defecto para mostrar compras no anuladas
filters.value.isActive = false

const registrarCompra = () => {
  router.push('/comprasform/nueva')
}

const onCompraAnular = async (compra: Compra) => {
  notify({
    message: `Compra ${compra.IdCompra} anulada con éxito`,
    color: 'success',
  })
}

const filteredCompras = computed(() => {
  if (filters.value.isActive === null || filters.value.isActive === undefined) {
    return compras.value
  } else {
    return compras.value.filter((compra) => {
      if (filters.value.isActive) {
        // Filtrar por compras anuladas
        return compra.Anulada === 'Sí'
      } else {
        // Filtrar por compras no anuladas (incluyendo las que Anulada es null o vacía)
        return compra.Anulada !== 'Sí' && (compra.Anulada === null || compra.Anulada === '')
      }
    })
  }
})
</script>

<template>
  <h1 class="page-title">Compras</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaButtonToggle
            v-model="filters.isActive"
            color="background-element"
            border-color="background-element"
            :options="[
              { label: 'Activa', value: false },
              { label: 'Anulada', value: true },
            ]"
          />
          <VaInput v-model="filters.search" placeholder="Buscar">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton color="primary" class="mb-4" @click="registrarCompra">Registrar Compra</VaButton>
      </div>

      <ComprasTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :compras="filteredCompras"
        :loading="isLoading"
        :pagination="pagination"
        @deleteUser="onCompraAnular"
      />
    </VaCardContent>
  </VaCard>
</template>
