Entiendo, parece que la validación está funcionando al desactivar el botón de guardar, pero el mensaje de error no se
está mostrando. Para solucionar esto, necesitamos asegurarnos de que el mensaje de error se muestre en la interfaz de
usuario cuando la validación falle. Aquí está cómo puedes ajustar el formulario para mostrar el mensaje de error "Debe
seleccionar al menos una ubicación" cuando no se ha seleccionado ninguna ubicación: Ajuste en el Formulario Agregar una
regla de validación para las ubicaciones: Asegúrate de agregar una regla de validación en el campo de ubicaciones que
verifique que al menos una ubicación haya sido seleccionada. Esta regla debería estar dentro de un VaInput o en un
componente similar si estás usando checkboxes para seleccionar ubicaciones. Mostrar el mensaje de error: Puedes utilizar
un componente de mensaje de error para mostrar el mensaje cuando la validación falle. Aquí te muestro cómo hacerlo.
Código Ajustado vue Copiar código
<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Estampado</h2>
  <VaCard>
    <VaCardContent>
      <VaForm
        v-slot="{ isValid }"
        ref="add-user-form"
        class="flex-col justify-start items-start gap-4 inline-flex w-full"
      >
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newEstampado.TipoEstampado"
              label="Tipo Estampado"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => /^[A-Za-zÁÉÍÓÚáéíóúüñ\s]+$/.test(v) || 'No se permiten números ni caracteres especiales',
              ]"
              name="TipoEstampado"
            />
            <VaInput
              v-model="newEstampado.PrecioEstampado"
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
              <!-- Campo de búsqueda de ubicaciones -->
              <VaInput v-model="searchUbicacion" label="Buscar Ubicación" class="w-full sm:w-1/2" />
              <!-- Checkbox para seleccionar ubicaciones -->
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
              <!-- Tabla para mostrar las ubicaciones seleccionadas -->
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
              v-model="newEstampado.Largo"
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
              v-model="newEstampado.Ancho"
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
              v-model="newEstampado.Alto"
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
          <!-- Campo de Estado Estampado con valor predeterminado "Activo" -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newEstampado.EstadoEstampado"
              label="Estado del Estampado"
              class="w-full sm:w-1/2"
              disabled
            />
          </div>
        </div>
        <div v-if="!ubicacionesSeleccionadas.length" class="text-red-500">Debe seleccionar al menos una ubicación.</div>
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          <VaButton :disabled="!isValid || !ubicacionesSeleccionadas.length" @click="onSave">Guardar</VaButton>
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
import { AgregarEstampado, ObtenerUbicaciones } from '../../../data/pages/estampados'
import { useRouter } from 'vue-router'

const defaultNuevoEstampado: Omit<Estampado, 'IdEstampado'> = {
  TipoEstampado: '',
  PrecioEstampado: 0,
  EstadoEstampado: 'Activo', // Estado por defecto
  UbicacionEstampado: [],
  Largo: 0,
  Ancho: 0,
  Alto: 0,
}

const newEstampado = ref<Omit<Estampado, 'IdEstampado'>>({ ...defaultNuevoEstampado })
const form = useForm('add-user-form')
const router = useRouter()
const ubicacionesOptions = ref<Ubicaciones[]>([])
const searchUbicacion = ref('')
const showSuccessAlert = ref(false)
const ubicacionesSeleccionadas = ref<number[]>([]) // Nuevo ref para almacenar las ubicaciones seleccionadas

const obtenerUbicaciones = async () => {
  try {
    const response = await ObtenerUbicaciones()
    ubicacionesOptions.value = response
  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error)
  }
}

onMounted(() => {
  obtenerUbicaciones()
})

// Filtrar ubicaciones basado en la búsqueda
const filteredUbicaciones = computed(() => {
  if (!searchUbicacion.value) {
    return []
  }
  return ubicacionesOptions.value.filter((ubicacion) =>
    ubicacion.Ubicacion.toLowerCase().includes(searchUbicacion.value.toLowerCase()),
  )
})

// Función para obtener ubicación por Id
const obtenerUbicacionPorId = (id: number): Ubicaciones | undefined => {
  return ubicacionesOptions.value.find((ubicacion) => ubicacion.IdUbicacion === id)
}

const onSave = async () => {
  if (form.validate()) {
    try {
      // Asignar ubicaciones seleccionadas al objeto newEstampado
      newEstampado.value.UbicacionEstampado = ubicacionesSeleccionadas.value

      await AgregarEstampado(newEstampado.value)
      router.push('/estampados')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el estampado:', error)
    }
  }
}

const onClose = () => {
  router.push('/estampados')
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}
</script>

<style scoped>
/* Estilos para ajustar la posición de la tabla de ubicaciones seleccionadas */
.table-wrapper {
  display: flex;
  justify-content: center;
}
.table-container {
  max-width: 100%; /* Ajusta el ancho máximo al 100% */
  overflow-x: auto; /* Habilita el desplazamiento horizontal */
}
.table {
  width: 100%; /* Hace que la tabla ocupe todo el ancho del contenedor */
  border-collapse: collapse;
  border: 1px solid #ddd; /* Añade un borde a la tabla */
}
.table th,
.table td {
  text-align: left;
  padding: 8px;
}
.table tr:nth-child(even) {
  background-color: #f9f9f9;
}
.table th {
  background-color: #f2f2f2;
  font-weight: bold;
}
.alert {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 5px;
}
.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}
</style>
