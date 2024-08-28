<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Parametrizacion } from '../types'
import { ObtenerParametrizacionPorId } from '../../../data/pages/parametrizacion'
import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
const parametrizacion = ref<Parametrizacion>({
  IdParametrizacion: -1,
  NombreDescuento: '',
  ValorDescuento: 0,
})

// Vue Router
const router = useRouter()
const route = useRoute()

// Obtener y mostrar datos del estampado al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del estampado de los parámetros de la ruta
    let idParametrizacion = route.params.IdParametrizacion
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(idParametrizacion)) {
      idParametrizacion = idParametrizacion[0]
    }
    // Obtener los datos del estampado por su ID
    const parametrizacionData = await ObtenerParametrizacionPorId(idParametrizacion)
    // Actualizar los datos del estampado en el formulario
    parametrizacion.value = { ...parametrizacionData }
  } catch (error) {
    console.error('Error al cargar los datos de la parametrizacion:', error)
    // Manejar el error de carga de datos del estampado, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de estampados
const onClose = () => {
  router.push('/parametrizacion')
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Parametrizacion</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <!-- Campos de datos del estampado -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="parametrizacion.NombreDescuento"
              label="Nombre del descuento"
              class="w-full sm:w-1/2"
              readonly
            />
            <VaInput
              v-model="parametrizacion.ValorDescuento"
              label="Valor del descuento"
              class="w-full sm:w-1/2"
              readonly
            />
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
