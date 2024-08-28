<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ubicaciones } from '../types'
import { ObtenerUbicacionPorId } from '../../../data/pages/ubicaciones'
import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
const ubicacion = ref<Ubicaciones>({
  IdUbicacion: -1,
  Ubicacion: '',
  EstadoUbicacion: '',
})

// Vue Router
const router = useRouter()
const route = useRoute()

// Obtener y mostrar datos del ubicacion al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del ubicacion de los parámetros de la ruta
    let idUbicacion = route.params.IdUbicacion
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(idUbicacion)) {
      idUbicacion = idUbicacion[0]
    }
    // Obtener los datos del ubicacion por su ID
    const ubicacionData = await ObtenerUbicacionPorId(idUbicacion)
    // Actualizar los datos del ubicacion en el formulario
    ubicacion.value = { ...ubicacionData }
  } catch (error) {
    console.error('Error al cargar los datos de la ubicacion:', error)
    // Manejar el error de carga de datos del ubicacion, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de ubicaciones
const onClose = () => {
  router.push('/ubicaciones')
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Ubicacion</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <!-- Campo de datos de ubicacines -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="ubicacion.Ubicacion" label="Nombre Ubicacion" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="ubicacion.EstadoUbicacion" label="Estado" class="w-full sm:w-1/2" readonly />
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
