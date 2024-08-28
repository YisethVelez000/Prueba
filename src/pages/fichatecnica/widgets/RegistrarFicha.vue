<script setup lang="ts">
import { ref, onMounted, defineEmits, watch } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { FichaTecnica } from '../types'
import { ObtenerColores, ObtenerTallas } from '../../../data/pages/ficha'
import { useRouter } from 'vue-router'
const { init: notify } = useToast()

const defaultNuevaFicha: Omit<FichaTecnica, 'IdFichaTecnica'> = {
  NombreProducto: '',
  EstadoFicha: 'Activo',
  Ficha_Has_Colores: [],
  Ficha_Has_Tallas: [],
  Ficha_Has_Imagens: [],
  data: null,
}

const nuevaFicha = ref<Omit<FichaTecnica, 'IdFichaTecnica'>>({ ...defaultNuevaFicha })
const form = useForm('add-ficha-form')
const router = useRouter()

const selectedColors = ref<{ IdColor: number; Color: string }[]>([])
const selectedTallas = ref<{ IdTalla: number; Talla: string }[]>([])
const uploadedImages = ref<File[]>([])

const emit = defineEmits(['close', 'save'])
const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate() && isFormValid()) {
    try {
      const formData = new FormData()

      formData.append('NombreProducto', nuevaFicha.value.NombreProducto)
      formData.append('EstadoFicha', nuevaFicha.value.EstadoFicha)

      // Solo enviar IDs de colores
      formData.append('Colores', JSON.stringify(selectedColors.value.map((color) => color.IdColor)))

      // Solo enviar IDs de tallas
      formData.append('Tallas', JSON.stringify(selectedTallas.value.map((talla) => talla.IdTalla)))

      // Añadir imágenes
      uploadedImages.value.forEach((file) => {
        formData.append('imagenes', file)
      })

      const response = await fetch('https://apinodedvp.onrender.com/fichaTecnica/crearficha', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error en la solicitud al servidor')
      }

      emit('save', nuevaFicha.value)
      showSuccessAlert.value = true
      notify({
        message: `Ficha registrada con éxito`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })
      setTimeout(() => router.push('/fichas'), 2000)
    } catch (error) {
      console.error('Error al guardar la ficha técnica:', error)
    }
  }
}

// const hideAlert = () => {
//   setTimeout(() => {
//     showSuccessAlert.value = false;
//   }, 3000);
// };

// Datos y métodos para la selección de colores
const searchQuery = ref('')
const colorsFromAPI = ref<{ IdColor: number; Color: string }[]>([])
const filteredColors = ref<{ IdColor: number; Color: string }[]>([])
const tallasEnum = ref<{ IdTalla: number; Talla: string }[]>([])
//obtener los colores para listarlos en el formulario
const obtenerColores = async () => {
  try {
    const response = await ObtenerColores()
    colorsFromAPI.value = response.data
    console.log('Colores obtenidos de la API:', colorsFromAPI.value)
  } catch (error) {
    console.error('Error al obtener los colores:', error)
  }
}
//obtener las tallas para listralas en el formulario
const obtenerTallas = async () => {
  try {
    const response = await ObtenerTallas()
    tallasEnum.value = response.map((talla: string, index: number) => ({
      IdTalla: index + 1,
      Talla: talla,
    }))
    console.log('Tallas obtenidas de la API:', tallasEnum.value)
  } catch (error) {
    console.error('Error al obtener las tallas:', error)
  }
}

onMounted(() => {
  obtenerColores()
  obtenerTallas()
})
const onCancel = () => {
  router.push('/fichas')
}

// Filtrar colores según la búsqueda
watch(searchQuery, (newValue) => {
  if (newValue.trim() === '') {
    filteredColors.value = []
  } else {
    filteredColors.value = colorsFromAPI.value.filter((color) =>
      color.Color.toLowerCase().includes(newValue.trim().toLowerCase()),
    )
  }
})
const colorDuplicateError = ref('')
//añadir un color a la tabla
const addColor = (color: { IdColor: number; Color: string }) => {
  if (!selectedColors.value.some((c) => c.IdColor === color.IdColor)) {
    selectedColors.value.push(color)
    colorDuplicateError.value = ''
  } else {
    colorDuplicateError.value = 'Este color ya está seleccionado'
  }
}
//remover un color que ya se habia escogido
const removeColor = (color: { IdColor: number; Color: string }) => {
  selectedColors.value = selectedColors.value.filter((c) => c.IdColor !== color.IdColor)
}
//esta funcion es para manejar las imagenes
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    // Primero, vacía el array de imágenes subidas
    uploadedImages.value = []

    // Luego, agrega los nuevos archivos al array
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i]
      uploadedImages.value.push(file)
    }
  }
}

// const removeImage = (index: number) => {
//   uploadedImages.value.splice(index, 1);
// };

// Nuevo método para manejar la selección de tallas
const handleTallaSelection = (event: Event, talla: { IdTalla: number; Talla: string }) => {
  const checkbox = event.target as HTMLInputElement
  if (checkbox.checked) {
    selectedTallas.value.push(talla)
  } else {
    selectedTallas.value = selectedTallas.value.filter((t) => t.IdTalla !== talla.IdTalla)
  }
}
const colorError = ref('')
const tallaError = ref('')
const imageError = ref('')

const isFormValid = () => {
  colorError.value = ''
  tallaError.value = ''
  imageError.value = ''

  if (selectedColors.value.length === 0) {
    colorError.value = 'Debe seleccionar al menos un color'
  }

  if (selectedTallas.value.length === 0) {
    tallaError.value = 'Debe seleccionar al menos una talla'
  }

  if (uploadedImages.value.length === 0) {
    imageError.value = 'Debe subir al menos una imagen'
  }

  return !colorError.value && !tallaError.value && !imageError.value
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Agregar</h2>
    <VaCard>
      <VaCardContent>
        <VaForm
          v-slot="{ isValid }"
          ref="add-ficha-form"
          class="flex-col justify-start items-start gap-4 inline-flex w-full"
        >
          <div class="self-stretch flex-col justify-start items-start gap-4 flex">
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="nuevaFicha.NombreProducto"
                label="Nombre de la Ficha"
                class="w-full sm:w-1/2"
                name="NombreProducto"
                :rules="[
                  (v: any) => !!v || 'El campo es obligatorio',
                  (v: string) =>
                    /^[A-ZÁÉÍÓÚ][a-zA-ZáéíóúüñÁÉÍÓÚ\s]{0,60}$/.test(v) || 'El nombre debe empezar con mayúscula',
                ]"
              />
            </div>
            <!-- Contenedor desplazable que incluye búsqueda y colores seleccionados -->
            <div class="selected-colors-container mt-4">
              <!-- Componente de búsqueda dinámica de colores y lista de colores -->
              <div class="flex-1">
                <VaInput v-model="searchQuery" label="Buscar colores" placeholder="Buscar colores..." class="w-full" />
                <span v-if="colorError" class="text-red-500">{{ colorError }}</span>
                <ul v-if="filteredColors.length" class="color-list mt-2">
                  <li
                    v-for="color in filteredColors"
                    :key="color.IdColor"
                    class="flex items-center justify-between py-2 border-b"
                  >
                    <span>{{ color.Color }}</span>
                    <VaButton variant="primary" size="small" class="ml-2" @click="addColor(color)">Agregar</VaButton>
                  </li>
                </ul>
                <span v-if="colorDuplicateError" class="text-red-500">{{ colorDuplicateError }}</span>
              </div>
              <!-- Mostrar colores seleccionados -->
              <div v-if="selectedColors.length" class="selected-colors-table">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Color
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="color in selectedColors" :key="color.IdColor">
                      <td class="px-6 py-4 whitespace-nowrap">{{ color.Color }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <VaButton
                          preset="danger"
                          size="small"
                          icon="mso-delete"
                          color="danger"
                          aria-label="Eliminar Color"
                          title="Eliminar"
                          @click="removeColor(color)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Selección de tallas -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700">Tallas</label>
              <div class="flex flex-wrap gap-4">
                <div v-for="talla in tallasEnum" :key="talla.IdTalla" class="flex items-center">
                  <input
                    :id="talla.IdTalla.toString()"
                    type="checkbox"
                    :value="talla.IdTalla"
                    class="mr-2"
                    @change="handleTallaSelection($event, talla)"
                  />
                  <label :for="talla.IdTalla.toString()">{{ talla.Talla }}</label>
                </div>
              </div>
              <span v-if="tallaError" class="text-red-500">{{ tallaError }}</span>
            </div>
            <VaFileUpload v-model="uploadedImages" type="gallery" class="bg-primary">
              <div class="custom-upload-file-area">
                <p class="mb-2">Haz clic o arrastra y suelta archivos aquí para subir</p>
                <!-- El input tipo file generado por VaFileUpload -->
                <input type="file" multiple accept="image/*" class="custom-file-input" @change="handleFileUpload" />
                <!-- Etiqueta personalizada para el botón -->
                <label for="custom-file-input" class="custom-file-label">Elegir archivos</label>
              </div>
              <span v-if="imageError" class="text-red-500">{{ imageError }}</span>
            </VaFileUpload>

            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="nuevaFicha.EstadoFicha"
                label="Estado Ficha"
                class="w-full sm:w-1/2 hidden"
                :rules="[(v: any) => !!v || 'El campo es obligatorio']"
                name="EstadoFicha"
              />
            </div>
            <!-- Otros campos como imágenes aquí -->
            <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
              <VaButton preset="secondary" color="secondary" @click="onCancel">Cancelar</VaButton>
              <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
            </div>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>
    <!-- Alerta de éxito -->
  </div>
</template>

<style scoped>
/* Estilo para ajustar el ancho del input de búsqueda */
.va-input {
  width: 100%; /* Ajusta el ancho según tus necesidades */
}

/* Estilo para el contenedor de colores seleccionados */
.selected-colors-container {
  border: 1px solid #e2e8f0; /* Agrega un borde para mejor visualización */
  padding: 16px; /* Espaciado interno */
  width: 100%; /* Asegura que el contenedor tenga el mismo ancho que el formulario */
  box-sizing: border-box; /* Para incluir el padding dentro del ancho total */
  display: flex;
  flex-direction: row; /* Mostrar en fila */
  gap: 16px; /* Espacio entre búsqueda y lista */
}

.search-and-list {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
}

.color-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px; /* Altura máxima de la lista de colores */
}

.selected-colors-table {
  flex: 1;
  margin-top: 0;
  overflow-y: auto;
  max-height: 150px; /* Altura máxima de la tabla de colores seleccionados */

  .flex {
    display: flex;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .gap-4 {
    gap: 1rem; /* o el valor que desees */
  }

  .items-center {
    align-items: center;
  }

  .mr-2 {
    margin-right: 0.5rem; /* Ajusta el margen según tus necesidades */
  }
}
.custom-file-input {
  opacity: 0; /* Oculta el input original */
  position: absolute;
  width: 0;
  height: 0;
}

.custom-file-label {
  display: inline-block;
  background-color: rgb(29, 100, 176);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.custom-file-label:hover {
  background-color: rgb(66, 115, 193);
}
</style>
