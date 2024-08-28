<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ObtenerOrdenProduccionPorId } from '../../../data/pages/produccion'
import { VaInput, VaModal } from 'vuestic-ui/web-components'
import router from '../../../router'

interface Estampado {
  IdEstampado: number
  IdProducto: number
  Talla: string
  Color: string
  IdUbicacion: number
  Imagen: string
  Cantidad: number
}

interface Producto {
  IdProducto: number
  Cantidad: number
  Talla: string
  Color: string
}

interface Terciaria {
  IdEmpresa: number
  ValorAPagar: number
}

interface OrdenProduccion {
  NumeroOrdenProduccion: number
  FechaEstimada: string
  EstadoOrden: string
  EsProduccionInterna: string
  Estampados: Estampado[]
  Productos: Producto[]
  Terciarias: Terciaria[]
  createdAt: string
  updatedAt: string
}

const ordenProduccion = ref<OrdenProduccion | null>(null)
const mostrarModal = ref(false)
const imagenEstampadoSeleccionado = ref('')

const route = useRoute()

onMounted(async () => {
  const id = route.query.id as string
  if (id) {
    try {
      const response = await ObtenerOrdenProduccionPorId(id.toString())
      ordenProduccion.value = response
    } catch (error) {
      console.error('Error al obtener la orden de producción:', error)
    }
  }
})

const abrirModal = (imagen: string) => {
  imagenEstampadoSeleccionado.value = imagen
  mostrarModal.value = true
}

const OnClose = () => {
  router.push('/produccion')
}
</script>
<template>
  <div>
    <h1 class="page-title">Detalle de la Orden de Producción</h1>
    <VaCard v-if="ordenProduccion">
      <VaCardContent>
        <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="ordenProduccion.NumeroOrdenProduccion"
              label="Número de Orden"
              class="w-full sm:w-1/2"
              readonly
            />
            <VaInput v-model="ordenProduccion.FechaEstimada" label="Fecha Estimada" class="w-full sm:w-1/2" readonly />
            <VaInput
              v-model="ordenProduccion.EstadoOrden"
              label="Estado de la Orden"
              class="w-full sm:w-1/2"
              readonly
            />
            <VaInput
              v-model="ordenProduccion.EsProduccionInterna"
              label="Producción Interna"
              class="w-full sm:w-1/2"
              readonly
            />
          </div>
        </div>
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <div v-if="ordenProduccion.Productos.length > 0" class="w-full sm:w-1/2">
              <h3>Productos:</h3>
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="border px-4 py-2">Producto</th>
                    <th class="border px-4 py-2">Cantidad</th>
                    <th class="border px-4 py-2">Talla</th>
                    <th class="border px-4 py-2">Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in ordenProduccion.Productos" :key="producto.IdProducto">
                    <td class="border px-4 py-2">{{ producto.IdProducto }}</td>
                    <td class="border px-4 py-2">{{ producto.Cantidad }}</td>
                    <td class="border px-4 py-2">{{ producto.Talla }}</td>
                    <td class="border px-4 py-2">{{ producto.Color }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="ordenProduccion.Estampados.length > 0" class="w-full sm:w-1/2">
              <h3>Estampados:</h3>
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="border px-4 py-2">Estampado</th>
                    <th class="border px-4 py-2">Talla</th>
                    <th class="border px-4 py-2">Color</th>
                    <th class="border px-4 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="estampado in ordenProduccion.Estampados" :key="estampado.IdEstampado">
                    <td class="border px-4 py-2">
                      <VaButton
                        preset=" primary"
                        size="small"
                        icon="mso-visibility"
                        @click="abrirModal(estampado.Imagen)"
                      />
                    </td>
                    <td class="border px-4 py-2">{{ estampado.Talla }}</td>
                    <td class="border px-4 py-2">{{ estampado.Color }}</td>
                    <td class="border px-4 py-2">{{ estampado.Cantidad }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="ordenProduccion.Terciarias.length > 0">
          <h3>Terciarias:</h3>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="border px-4 py-2">Empresa</th>
                <th class="border px-4 py-2">Valor a Pagar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="terciaria in ordenProduccion.Terciarias" :key="terciaria.IdEmpresa">
                <td class="border px-4 py-2">{{ terciaria.IdEmpresa }}</td>
                <td class="border px-4 py-2">{{ terciaria.ValorAPagar }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCardContent>
      <VaCardActions>
        <VaButton preset="primary" @click="OnClose">Cerrar</VaButton>
      </VaCardActions>
    </VaCard>

    <!-- Modal para mostrar la imagen del estampado -->
    <VaModal v-model="mostrarModal" :cancel-text="'Cerrar'">
      <template #header>
        <h3>Imagen del Estampado</h3>
      </template>
      <template #default>
        <img :src="imagenEstampadoSeleccionado" alt="Estampado" class="custom-modal-img" />
      </template>
    </VaModal>
  </div>
</template>
<style>
.custom-modal-img {
  max-width: 100%;
  max-height: 80vh;
  /* 80% de la altura de la ventana */
  object-fit: contain;
  /* Asegura que toda la imagen sea visible */
}
</style>
