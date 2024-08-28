<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Estampado } from '../types'
import { ObtenerEstampadoPorId } from '../../../data/pages/estampados'
import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
const estampado = ref<Estampado>({
  IdEstampado: -1,
  TipoEstampado: '',
  PrecioEstampado: 0,
  EstadoEstampado: 'Activo', // Estado por defecto
  UbicacionEstampado: [], // Inicialmente un array vacío para ubicaciones
  Largo: 0,
  Ancho: 0,
  Alto: 0,
})

// Vue Router
const router = useRouter()
const route = useRoute()

// Obtener y mostrar datos del estampado al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del estampado de los parámetros de la ruta
    let idEstampado = route.params.IdEstampado
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(idEstampado)) {
      idEstampado = idEstampado[0]
    }
    // Obtener los datos del estampado por su ID
    const estampadoData = await ObtenerEstampadoPorId(idEstampado)
    // Debug: Imprimir los datos obtenidos
    console.log('Datos obtenidos del estampado:', estampadoData)
    // Actualizar los datos del estampado en la variable reactiva
    estampado.value = {
      ...estampadoData,
      UbicacionEstampado: estampadoData.EstampadosUbicaciones.map((eu) => eu.Ubicacione),
    }
  } catch (error) {
    console.error('Error al cargar los datos del estampado:', error)
    // Manejar el error de carga de datos del estampado, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de estampados
const onClose = () => {
  router.push('/estampados')
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Estampado</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-estampado-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <!-- Campos de datos del estampado -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="estampado.TipoEstampado" label="Tipo de estampado" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="estampado.PrecioEstampado" label="Precio" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Campo de Ubicaciones del estampado -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <div class="w-full sm:w-1/2">
              <label class="block text-sm font-medium text-gray-700">Ubicaciones</label>
              <ul class="divide-y divide-gray-200 rounded-md border border-gray-200 p-2">
                <li v-for="ubicacion in estampado.UbicacionEstampado" :key="ubicacion.IdUbicacion" class="py-1">
                  {{ ubicacion.Ubicacion }}
                </li>
                <!-- Debug: Mostrar el contenido actual de UbicacionEstampado -->
                <li v-if="estampado.UbicacionEstampado.length === 0" class="py-1 text-red-500">
                  No se encontraron ubicaciones.
                </li>
              </ul>
            </div>
          </div>
          <!-- Otros campos del estampado -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="estampado.Largo" label="Largo" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="estampado.Ancho" label="Ancho" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Otros campos del estampado -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="estampado.Alto" label="Alto" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="estampado.EstadoEstampado" label="Estado" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Botón de cierre -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>
