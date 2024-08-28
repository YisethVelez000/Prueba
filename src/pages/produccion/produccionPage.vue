<script setup lang="ts">
import ProduccionTable from './widgets/ProduccionTable.vue'
import { OrdenProduccion } from './type'
import { useProduccion } from './composables/useProduccion'
import router from '../../router'
import { VaCardContent } from 'vuestic-ui/web-components'

const { produccion, isLoading, filters, sorting, pagination } = useProduccion()

// const onOrdenProduccionDelete = async (orden: OrdenProduccion) => {
//   await produccionApi.delete(orden);
// }

const AgregarOrdenProduccion = async () => {
  router.push('produccion/nueva')
}

const EditarOrdenProduccion = (data: OrdenProduccion) => {
  router.push({})
  console.log(data)
}

const VerDetalleOrdenProduccion = (data: OrdenProduccion) => {
  //Tomar el id de la orden de produccion y redirigir a la pagina de detalle
  router.push({
    path: 'produccion/detalle/${data.NumeroOrdenProduccion}',
    query: { id: data.NumeroOrdenProduccion },
  })
}
</script>
<template>
  <h1 class="page-title">Orden Produccion</h1>
  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="AgregarOrdenProduccion">Agregar</VaButton>
      </div>
      <ProduccionTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :data="produccion"
        :loading="isLoading"
        :pagination="pagination"
        :sorting="sorting"
        @editOrden="EditarOrdenProduccion"
        @viewDetails="VerDetalleOrdenProduccion"
      />
    </VaCardContent>
  </VaCard>
</template>
