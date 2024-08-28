<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Insumo } from '../types'
import { ObtenerInsumoPorId } from '../../../data/pages/insumos'
import { useRouter, useRoute } from 'vue-router'

// Variables reactivas
const insumo = ref<Insumo>({
  IdInsumo: -1,
  NombreInsumo: '',
  CantidadInsumo: 10,
  EstadoInsumo: 'Activo',
  Agotado: 'Inactivo',
  IdMedida: -1,
})

const showSuccessAlert = ref(false)

// Vue Router
const router = useRouter()
const route = useRoute()

// Obtener y mostrar datos del insumo al cargar la vista
onMounted(async () => {
  try {
    // Obtener el ID del insumo de los parámetros de la ruta
    let idInsumo = route.params.IdInsumo
    // Verificar si es una matriz y obtener el primer elemento
    if (Array.isArray(idInsumo)) {
      idInsumo = idInsumo[0]
    }
    // Obtener los datos del insumo por su ID
    const insumoData = await ObtenerInsumoPorId(idInsumo)
    // Actualizar los datos del proveedor en el formulario
    insumo.value = { ...insumoData }
  } catch (error) {
    console.error('Error al cargar los datos del insumo:', error)
    // Manejar el error de carga de datos del insumo, por ejemplo, redirigir a una página de error
  }
})

// Función para cerrar la vista de detalle y volver a la lista de insumos
const onClose = () => {
  router.push('/insumos')
}
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h2 class="text-xl font-semibold mb-4">Visualizar Insumos</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="view-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <!-- Campos de datos del insumo -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="insumo.NombreInsumo" label="Nombre Insumo" class="w-full sm:w-1/2" readonly />
            <VaInput v-model="insumo.CantidadInsumo" label="Cantidad Insumo" class="w-full sm:w-1/2" readonly />
          </div>
          <div class="flex gap-4 w-full">
            <div class="flex items-center w-1/2 mt-4">
              <VaSelect
                v-model="insumo.EstadoInsumo"
                label="Estado"
                class="w-full sm:w-1/2"
                :options="['Activo', 'Inactivo']"
                readonly
              />
            </div>
          </div>
          <div class="flex gap-4 w-full">
            <div class="flex items-center w-1/2 mt-4">
              <VaSelect
                v-model="insumo.Agotado"
                label="Agotado"
                class="w-full sm:w-1/2"
                :options="['Activo', 'Inactivo']"
                readonly
              />
            </div>
          </div>
          <!-- Otros campos del insumo -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput v-model="insumo.IdMedida" label="Id Medida" class="w-full sm:w-1/2" readonly />
          </div>
          <!-- Otros campos del insumo -->

          <!-- Botón de cierre -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <!-- Alerta de éxito -->
  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Insumo guardado exitosamente!</div>
</template>
