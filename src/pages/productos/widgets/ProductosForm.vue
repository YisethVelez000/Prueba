<script setup lang="ts">
import { ref, onMounted, defineEmits, watch } from 'vue'
import { useForm, useToast } from 'vuestic-ui'
import { Producto, Imagen } from '../types'
import { ObtenerColores, ObtenerTallas, ObtenerEstampados, ObtenerFichaTecnica } from '../../../data/pages/productos'
import { useRouter } from 'vue-router'

const { init: notify } = useToast()
const props = defineProps({
  saveButtonLabel: {
    type: String,
    default: 'Guardar',
  },
})
console.log(props)

const defaultNuevoProducto: Omit<Producto, 'IdProducto'> = {
  NombreProductoCatalogo: '',
  FechaRegistro: new Date().toISOString().substring(0, 10), // Formato ISO para fecha YYYY-MM-DD
  PrecioProducto: 0,
  Personalizable: '',
  EstadoProducto: 'Activo',
  IdFichaTecnica: -1,
  Producto_has_Colores: [],
  Producto_has_Tallas: [],
  Producto_Has_Imagens: [],
  EstampadoProductos: [],
  data: null,
}

const nuevoProducto = ref<Omit<Producto, 'IdProducto'>>({ ...defaultNuevoProducto })
const form = useForm('add-producto-form')
const router = useRouter()

const selectedColors = ref<{ IdColor: number; Color: string }[]>([])
const selectedTallas = ref<{ IdTalla: number; Talla: string }[]>([])
const selectedFicha = ref<{ IdFichaTecnica: number; NombreProducto: string }>({
  IdFichaTecnica: -1,
  NombreProducto: '',
})
const selectedEstampados = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const uploadedImages = ref<Imagen[]>([])

const emit = defineEmits(['close', 'save'])
const showSuccessAlert = ref(false)

// Métodos para la selección de colores, tallas, estampados y fichas técnicas
const searchQueryColors = ref('')
const searchQueryEstampados = ref('')
const searchQueryFichas = ref('')
const fichasFromApi = ref<{ IdFichaTecnica: number; NombreProducto: string }[]>([])
const estampadosFromAPI = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const colorsFromAPI = ref<{ IdColor: number; Color: string }[]>([])
const filteredEstampados = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const filteredFichasTecnicas = ref<{ IdFichaTecnica: number; NombreProducto: string }[]>([])
const filteredColors = ref<{ IdColor: number; Color: string }[]>([])
const tallasEnum = ref<{ IdTalla: number; Talla: string }[]>([])

const ObtenerFichasTecnicas = async () => {
  try {
    const response = await ObtenerFichaTecnica()
    fichasFromApi.value = response.map((ficha: { NombreProducto: string }, index: number) => ({
      IdFichaTecnica: index + 1,
      NombreProducto: ficha.NombreProducto,
    }))
  } catch (error) {
    console.error('Error al obtener las fichas:', error)
  }
}
const obtenerColores = async () => {
  try {
    const response = await ObtenerColores()
    colorsFromAPI.value = response.data
  } catch (error) {
    console.error('Error al obtener los colores:', error)
  }
}

const obtenerTallas = async () => {
  try {
    const response = await ObtenerTallas()
    tallasEnum.value = response.map((talla: string, index: number) => ({
      IdTalla: index + 1,
      Talla: talla,
    }))
  } catch (error) {
    console.error('Error al obtener las tallas:', error)
  }
}

const obtenerEstampados = async () => {
  try {
    const response = await ObtenerEstampados()
    estampadosFromAPI.value = response.map((estampado: { TipoEstampado: string }, index: number) => ({
      IdEstampado: index + 1,
      TipoEstampado: estampado.TipoEstampado,
    }))
  } catch (error) {
    console.error('Error al obtener los estampados:', error)
  }
}

onMounted(() => {
  obtenerColores()
  obtenerTallas()
  obtenerEstampados()
  ObtenerFichasTecnicas()
})

// Filtrar colores, estampados y fichas técnicas según la búsqueda
watch(searchQueryColors, (newValue) => {
  const query = newValue.trim().toLowerCase()
  filteredColors.value = query ? colorsFromAPI.value.filter((color) => color.Color.toLowerCase().includes(query)) : []
})

watch(searchQueryFichas, (newValue) => {
  const query = newValue.trim().toLowerCase()
  filteredFichasTecnicas.value = query
    ? fichasFromApi.value.filter((fichaTecnica) => fichaTecnica.NombreProducto.toLowerCase().includes(query))
    : []
})

watch(searchQueryEstampados, (newValue) => {
  const query = newValue.trim().toLowerCase()
  filteredEstampados.value = query
    ? estampadosFromAPI.value.filter((estampado) => estampado.TipoEstampado.toLowerCase().includes(query))
    : []
})

const addColor = (color: { IdColor: number; Color: string }) => {
  if (!selectedColors.value.some((c) => c.IdColor === color.IdColor)) {
    selectedColors.value.push(color)
    colorDuplicateError.value = ''
  } else {
    colorDuplicateError.value = 'Este color ya está seleccionado'
  }
}

const addEstampado = (estampado: { IdEstampado: number; TipoEstampado: string }) => {
  if (!selectedEstampados.value.some((c) => c.IdEstampado === estampado.IdEstampado)) {
    selectedEstampados.value.push(estampado)
  }
}

const removeColor = (color: { IdColor: number; Color: string }) => {
  selectedColors.value = selectedColors.value.filter((c) => c.IdColor !== color.IdColor)
}

const removeEstampado = (estampado: { IdEstampado: number; TipoEstampado: string }) => {
  selectedEstampados.value = selectedEstampados.value.filter((c) => c.IdEstampado !== estampado.IdEstampado)
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i]
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        uploadedImages.value.push({ url: dataUrl })
      }
      reader.readAsDataURL(file)
    }
  }
}

const colorError = ref('')
const tallaError = ref('')
const imageError = ref('')
const estampadoError = ref('')

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
  if (selectedEstampados.value.length === 0) {
    estampadoError.value = 'Debe seleccionar al menos un estampado'
  }

  if (uploadedImages.value.length === 0) {
    imageError.value = 'Debe subir al menos una imagen'
  }

  return !colorError.value && !tallaError.value && !imageError.value
}

const handleTallaSelection = (event: Event, talla: { IdTalla: number; Talla: string }) => {
  const checkbox = event.target as HTMLInputElement
  if (checkbox.checked) {
    selectedTallas.value.push(talla)
  } else {
    selectedTallas.value = selectedTallas.value.filter((t) => t.IdTalla !== talla.IdTalla)
  }
}

const onSave = async () => {
  if (form.validate() && isFormValid()) {
    try {
      const formData = new FormData()

      formData.append('NombreProductoCatalogo', nuevoProducto.value.NombreProductoCatalogo)
      formData.append('FechaRegistro', nuevoProducto.value.FechaRegistro.toString())
      formData.append('PrecioProducto', nuevoProducto.value.PrecioProducto.toString())
      formData.append('Personalizable', nuevoProducto.value.Personalizable)
      formData.append('EstadoProducto', nuevoProducto.value.EstadoProducto)
      formData.append('IdFichaTecnica', selectedFicha.value.IdFichaTecnica.toString())

      formData.append(
        'Colores',
        JSON.stringify(
          selectedColors.value.map((color) => ({
            IdColor: color.IdColor,
            Color: color.Color,
          })),
        ),
      )

      formData.append(
        'Estampados',
        JSON.stringify(
          selectedEstampados.value.map((estampado) => ({
            IdEstampado: estampado.IdEstampado,
            TipoEstampado: estampado.TipoEstampado,
          })),
        ),
      )

      formData.append(
        'Tallas',
        JSON.stringify(
          selectedTallas.value.map((talla) => ({
            IdTalla: talla.IdTalla,
            Talla: talla.Talla,
          })),
        ),
      )

      uploadedImages.value.forEach((file) => {
        formData.append('imagenes', file) // Asegúrate de que la clave sea la misma que esperas en el backend
      })

      const response = await fetch('https://apinodedvp.onrender.com/productos', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error en la solicitud al servidor')
      }

      const responseData = await response.json()

      notify({
        message: responseData.mensaje,
        color: 'success',
        duration: 5000,
        position: 'bottom-right',
      })

      showSuccessAlert.value = true

      router.push('/productos')

      emit('save')
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      notify({
        message: 'No se pudo guardar el producto',
        color: 'error',
        duration: 5000,
        position: 'bottom-right',
      })
    }
  } else {
    notify({
      message: 'Por favor completa los campos requeridos',
      color: 'error',
      duration: 5000,
      position: 'bottom-right',
    })
  }
}

const onClose = () => {
  router.push('/productos')
}

const validationRules = {
  NombreProductoCatalogo: [
    (value: string) => !!value || 'El nombre del producto es requerido.',
    (value: string) => /^[a-zA-Z\s]*$/.test(value) || 'El nombre del producto no debe contener números.',
    (value: string) => value.length <= 50 || 'El nombre del producto no debe tener más de 50 caracteres.',
    (value: string) => value.trim().length > 0 || 'El nombre del producto no debe tener espacios vacíos.',
  ],
  PrecioProducto: [
    (value: number) => !!value || 'El precio del producto es requerido.',
    (value: string) => !/e/i.test(value) || 'El precio del producto no debe contener la letra "e".',
  ],
}

const colorDuplicateError = ref('')

// const tallaError = ref('')
// const imageError = ref('')
// const estampadoError = ref('')

//   const isFormValid = () => {
//   colorError.value = ''
//   tallaError.value = ''
//   imageError.value = ''
//   estampadoError.value= ''

//   if (selectedColors.value.length === 0) {
//     colorError.value = 'Debe seleccionar al menos un color'
//   }

//   if (selectedTallas.value.length === 0) {
//     tallaError.value = 'Debe seleccionar al menos una talla'
//   }

//   if (selectedEstampados.value.length === 0) {
//     estampadoError.value = 'Debe seleccionar al menos un estampado'
//   }

//   if (uploadedImages.value.length === 0) {
//     imageError.value = 'Debe subir al menos una imagen'
//   }

//   return !colorError.value && !tallaError.value && !imageError.value
// }
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Agregar</h2>
    <VaCard>
      <VaCardContent>
        <VaForm
          v-slot="{ isValid }"
          ref="add-producto-form"
          class="flex-col justify-start items-start gap-4 inline-flex w-full"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <!-- Campo Nombre del producto -->
            <div>
              <VaInput
                v-model="nuevoProducto.NombreProductoCatalogo"
                label="Nombre del producto"
                class="w-full"
                name="NombreProductoCatalogo"
                :rules="validationRules.NombreProductoCatalogo"
              />
            </div>

            <!-- Campo Fecha de Registro -->
            <div>
              <VaInput
                v-model="nuevoProducto.FechaRegistro"
                type="date"
                label="Fecha de Registro"
                class="w-full"
                name="FechaRegistro"
                disabled
              />
            </div>

            <!-- Campo Precio del producto -->
            <div>
              <VaInput
                v-model="nuevoProducto.PrecioProducto"
                type="number"
                label="Precio del producto"
                class="w-full"
                name="PrecioProducto"
                :rules="validationRules.PrecioProducto"
              />
            </div>

            <!-- Campo Personalizable -->
            <div>
              <label class="block text-sm font-medium text-gray-700">¿El producto es personalizable?</label>
              <div class="flex items-center gap-4">
                <input
                  id="personalizable-si"
                  v-model="nuevoProducto.Personalizable"
                  type="radio"
                  value="Sí"
                  class="mr-2"
                />
                <label for="personalizable-si">Sí</label>
                <input
                  id="personalizable-no"
                  v-model="nuevoProducto.Personalizable"
                  type="radio"
                  value="No"
                  class="mr-2"
                />
                <label for="personalizable-no">No</label>
              </div>
            </div>

            <!-- Campo Estado del producto -->
            <div>
              <VaInput v-model="nuevoProducto.EstadoProducto" label="Estado del producto" class="w-full" disabled />
            </div>

            <!-- Campo Ficha Técnica -->
            <div class="w-full">
              <VaInput v-model="searchQueryFichas" label="Buscar Ficha Técnica" class="w-full" />

              <div
                v-if="searchQueryFichas"
                class="ficha-container flex flex-col gap-2 max-h-96 overflow-y-auto border p-2 mt-2"
              >
                <template v-for="fichaTecnica in filteredFichasTecnicas" :key="fichaTecnica.IdFichaTecnica">
                  <div>
                    <input
                      v-model="selectedFicha"
                      type="radio"
                      :value="fichaTecnica"
                      :rules="validationRules.FichaTecnica"
                    />
                    <label>{{ fichaTecnica.NombreProducto }}</label>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Contenedor desplazable que incluye búsqueda y colores seleccionados -->
          <div class="selected-colors-container mt-4">
            <!-- Componente de búsqueda dinámica de colores y lista de colores -->
            <div class="flex-1">
              <VaInput
                v-model="searchQueryColors"
                label="Buscar colores"
                placeholder="Buscar colores..."
                class="w-full"
              />
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

          <!-- TABLA PARA ESTAMPADOS -->
          <div class="selected-estampados-container mt-4">
            <!-- Componente de búsqueda dinámica de estampados y lista de estampados -->
            <div class="flex-1">
              <VaInput
                v-model="searchQueryEstampados"
                label="Buscar Estampados"
                placeholder="Buscar estampados..."
                class="w-full"
              />
              <span v-if="estampadoError" class="text-red-500">{{ estampadoError }}</span>
              <ul v-if="filteredEstampados.length" class="estampado-list mt-2">
                <li
                  v-for="estampado in filteredEstampados"
                  :key="estampado.IdEstampado"
                  class="flex items-center justify-between py-2 border-b"
                >
                  <span>{{ estampado.TipoEstampado }}</span>
                  <VaButton variant="primary" size="small" class="ml-2" @click="addEstampado(estampado)"
                    >Agregar</VaButton
                  >
                </li>
              </ul>
            </div>

            <!-- Mostrar estampados seleccionados -->
            <div v-if="selectedEstampados.length" class="selected-estampados-table">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estampado
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
                  <tr v-for="estampado in selectedEstampados" :key="estampado.IdEstampado">
                    <td class="px-6 py-4 whitespace-nowrap">{{ estampado.TipoEstampado }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <VaButton
                        preset="danger"
                        size="small"
                        icon="mso-delete"
                        color="danger"
                        aria-label="Eliminar Estampado"
                        title="Eliminar"
                        @click="removeEstampado(estampado)"
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

          <p class="image-warning">
            Tenga en cuenta que la primera imagen que registre será la que se mostrará en el catálogo.
          </p>
          <!-- Componente para subir imágenes -->
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

          <!-- Botones para cancelar o guardar -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>
    <!-- Alerta de éxito -->
  </div>
</template>

<style scoped>
/* Estilos personalizados */
.ficha-container {
  max-height: 240px;
}

.color-list {
  list-style: none;
  padding: 0;
}

.color-list li {
  display: flex;
  align-items: center;
}

.selected-colors-table,
.selected-estampados-table {
  margin-top: 16px;
}

.selected-colors-table th,
.selected-estampados-table th {
  text-align: left;
}

.custom-upload-file-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px dashed #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.custom-file-input {
  display: none;
}

.custom-file-label {
  margin-top: 10px;
  font-size: 16px;
  cursor: pointer;
}

.image-warning {
  font-size: 14px;
  color: #d9534f; /* Color rojo para advertencia */
  margin-bottom: 10px;
}
</style>
