<template>
  <h2 class="text-xl font-semibold mb-4">Editar Estampado</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="edit-estampado-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="estampado.TipoEstampado"
              label="Tipo Estampado"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => /^[A-Za-zÁÉÍÓÚáéíóúüñ\s]+$/.test(v) || 'No se permiten números ni caracteres especiales',
              ]"
              name="TipoEstampado"
            />
            <VaInput
              v-model="estampado.PrecioEstampado"
              label="Precio"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="PrecioEstampado"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput v-model="searchUbicacion" label="Buscar Ubicación" class="w-full sm:w-1/2" />
              <div class="w-full sm:w-1/2">
                <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  <label v-for="ubicacion in filteredUbicaciones" :key="ubicacion.IdUbicacion">
                    <input v-model="ubicacionesSeleccionadas" type="checkbox" :value="ubicacion.IdUbicacion" />
                    {{ ubicacion.Ubicacion }}
                  </label>
                </div>
              </div>
            </div>
            <div class="w-full sm:w-1/2 ml-4">
              <div class="border border-gray-200 rounded-lg p-2">
                <h3 class="text-lg font-semibold mb-2">Ubicaciones Seleccionadas</h3>
                <div class="overflow-y-auto max-h-40">
                  <table class="table-auto w-full border-collapse border border-gray-200">
                    <tbody>
                      <tr v-for="ubicacionId in ubicacionesSeleccionadas" :key="ubicacionId">
                        <td class="px-4 py-2">{{ obtenerUbicacionPorId(ubicacionId)?.Ubicacion }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="estampado.Largo"
              label="Largo"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="Largo"
            />
            <VaInput
              v-model="estampado.Ancho"
              label="Ancho"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="Ancho"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="estampado.Alto"
              label="Alto"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="Alto"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="estampado.EstadoEstampado"
              label="Estado del Estampado"
              class="w-full sm:w-1/2"
              disabled
            />
          </div>
        </div>
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Estampado guardado exitosamente!</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useForm } from 'vuestic-ui'
import { Estampado, Ubicaciones } from '../types'
import { ObtenerEstampadoPorId, EditarEstampado, ObtenerUbicaciones } from '../../../data/pages/estampados'
import { useRouter, useRoute } from 'vue-router'

const estampado = ref<Estampado>({
  IdEstampado: -1,
  TipoEstampado: '',
  PrecioEstampado: 0,
  EstadoEstampado: 'Activo',
  UbicacionEstampado: [],
  Largo: 0,
  Ancho: 0,
  Alto: 0,
})

// const searchQueryUbicaciones = ref('')
// const ubicacionesFromAPI = ref ('')
const router = useRouter()
const route = useRoute()
const form = useForm('edit-estampado-form')
const ubicacionesOptions = ref<Ubicaciones[]>([])
const searchUbicacion = ref('')
const showSuccessAlert = ref(false)
const ubicacionesSeleccionadas = ref<number[]>([])

const obtenerUbicaciones = async () => {
  try {
    const response = await ObtenerUbicaciones()
    ubicacionesOptions.value = response
  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error)
  }
}

onMounted(async () => {
  obtenerUbicaciones()
  let idEstampado = route.params.IdEstampado
  if (Array.isArray(idEstampado)) {
    idEstampado = idEstampado[0]
  }
  const estampadoData = await ObtenerEstampadoPorId(idEstampado)
  estampado.value = { ...estampadoData }
  ubicacionesSeleccionadas.value = estampado.value.UbicacionEstampado.map((u) => u.IdUbicacion)
})

const filteredUbicaciones = computed(() => {
  if (!searchUbicacion.value) {
    return ubicacionesOptions.value
  }
  return ubicacionesOptions.value.filter((ubicacion) =>
    ubicacion.Ubicacion.toLowerCase().includes(searchUbicacion.value.toLowerCase()),
  )
})

const obtenerUbicacionPorId = (id: number): Ubicaciones | undefined => {
  return ubicacionesOptions.value.find((ubicacion) => ubicacion.IdUbicacion === id)
}

const onSave = async () => {
  if (form.validate()) {
    try {
      const estampadoData = {
        ...estampado.value,
        EstampadosUbicaciones: ubicacionesSeleccionadas.value.map((id) => ({ IdUbicacion: id })),
      }
      await EditarEstampado(estampadoData)
      showSuccessAlert.value = true
      setTimeout(() => {
        showSuccessAlert.value = false
        router.push('/estampados')
      }, 3000)
    } catch (error) {
      console.error('Error al guardar los cambios del estampado:', error)
    }
  }
}

const onClose = () => {
  router.push('/estampados')
}
</script>

<style scoped>
/* Estilos para ajustar la posición de la tabla de ubicaciones seleccionadas */
.flex-container {
  display: flex;
  gap: 1rem;
}

/* Estilos para los contenedores de los elementos */
.form-container {
  flex: 1;
}

.table-container {
  flex: 1;
  max-width: 300px; /* Ancho máximo de la tabla */
}

/* Estilos para la tabla */
.table-container table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
}

.table-container th,
.table-container td {
  padding: 0.5rem;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.table-container th {
  background-color: #f7fafc;
  font-weight: bold;
}
</style>
