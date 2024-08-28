<script setup lang="ts">
import { ref, onMounted, defineEmits, watch } from 'vue'
import { useForm, useModal, useToast } from 'vuestic-ui'
import { FichaTecnica, Imagen } from '../types'
import { ObtenerColores, ObtenerFichaPorId, ObtenerTallas } from '../../../data/pages/ficha'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['close', 'save'])
const { init: notify } = useToast()
const { confirm } = useModal()
const router = useRouter()
const route = useRoute()

const ficha = ref<FichaTecnica>({
  IdFichaTecnica: -1,
  NombreProducto: '',
  EstadoFicha: '',
  Ficha_Has_Colores: [],
  Ficha_Has_Tallas: [],
  Ficha_Has_Imagens: [],
  data: null,
})
const selectedColors = ref<{ IdColor: number; Color: string }[]>([])
const selectedTallas = ref<{ IdTalla: number; Talla: string }[]>([])
const uploadedImages = ref<File[]>([])
const imagesToDelete = ref<Imagen[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const form = useForm('edit-ficha-form')

const showSuccessAlert = ref(false)
const saveButtonLabel = ref('Guardar')

const onCancel = () => {
  router.push('/fichas')
}

// Datos y métodos para la selección de colores
const searchQuery = ref('')
const colorsFromAPI = ref<{ IdColor: number; Color: string }[]>([])
const filteredColors = ref<{ IdColor: number; Color: string }[]>([])
const tallasEnum = ref<{ IdTalla: number; Talla: string }[]>([])

const obtenerColores = async () => {
  try {
    const response = await ObtenerColores()
    colorsFromAPI.value = response.data

    // Verificación y registro de datos obtenidos
    if (Array.isArray(colorsFromAPI.value) && colorsFromAPI.value.length > 0) {
      console.log('Colores obtenidos de la API:', colorsFromAPI.value)
      const invalidColors = colorsFromAPI.value.filter((color) => !color.IdColor || !color.Color)
      if (invalidColors.length > 0) {
        console.warn('Colores con datos inválidos:', invalidColors)
      }
    } else {
      console.warn('No se obtuvieron colores válidos de la API.')
    }
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
onMounted(async () => {
  try {
    let idFichaTecnica = route.params.IdFichaTecnica
    if (Array.isArray(idFichaTecnica)) {
      idFichaTecnica = idFichaTecnica[0]
    }

    const fichaData = await ObtenerFichaPorId(idFichaTecnica)
    console.log('Datos de la ficha técnica:', fichaData)

    ficha.value = {
      IdFichaTecnica: fichaData.IdFichaTecnica,
      NombreProducto: fichaData.NombreProducto,
      EstadoFicha: fichaData.EstadoFicha,
      Ficha_Has_Colores: fichaData.Ficha_Has_Colores.map((item: any) => ({
        IdFichaColor: item.IdFichaColor,
        Color: item.Color.Color,
        IdColor: item.Color.IdColor, // Mantener IdColor original
      })),
      Ficha_Has_Tallas: fichaData.Ficha_Has_Tallas.map((item: any) => ({
        IdFichaTalla: item.IdFichaTalla,
        Talla: item.Talla.Talla,
        IdTalla: item.Talla.IdTalla,
      })),
      Ficha_Has_Imagens: fichaData.Ficha_Has_Imagens.map((item: any) => ({
        IdFichaTecnicaImagen: item.IdFichaTecnicaImagen,
        Imagen: item.Imagen.Imagen, // URL completa
      })),
    }

    selectedColors.value = ficha.value.Ficha_Has_Colores.map((item: any) => ({
      IdColor: item.IdColor, // Usar IdColor original
      Color: item.Color,
    }))
    selectedTallas.value = ficha.value.Ficha_Has_Tallas.map((item: any) => ({
      IdTalla: item.IdTalla,
      Talla: item.Talla,
    }))
    uploadedImages.value = ficha.value.Ficha_Has_Imagens.map((item: any) => ({
      url: item.Imagen, // Asignar la URL de la imagen
    }))

    obtenerColores()
    obtenerTallas()
  } catch (error) {
    console.error('Error al cargar los datos de la ficha técnica:', error)
  }
})
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

const addColor = (color: { IdColor: number; Color: string }) => {
  if (!selectedColors.value.some((c) => c.IdColor === color.IdColor)) {
    selectedColors.value.push(color)
    colorDuplicateError.value = ''
  } else {
    colorDuplicateError.value = 'Este color ya está seleccionado'
  }
}

const removeColor = (color: { IdColor: number; Color: string }) => {
  selectedColors.value = selectedColors.value.filter((c) => c.IdColor !== color.IdColor)
}

const removeImage = (image: { imagen: string; file?: File; url: string }) => {
  // Añadir imagen a la lista de imágenes a eliminar si no está ya en ella
  const existingImage = ficha.value.Ficha_Has_Imagens.find((img) => img.Imagen === image.url)
  if (existingImage && !imagesToDelete.value.some((img) => img.imagen === existingImage.Imagen)) {
    imagesToDelete.value.push({
      IdImagen: existingImage.IdFichaTecnicaImagen,
      imagen: image.url,
    })
  }

  // Eliminar la imagen de la lista de imágenes subidas
  uploadedImages.value = uploadedImages.value.filter((img) => img.url !== image.url)
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)

    // Combina los nuevos archivos con los archivos existentes
    uploadedImages.value = [...uploadedImages.value, ...newFiles]
  }
}
const removeTalla = (talla: { IdTalla: number; Talla: string }) => {
  selectedTallas.value = selectedTallas.value.filter((t) => t.IdTalla !== talla.IdTalla)
}

// Método para manejar la selección de tallas
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

const onSave = async () => {
  if (form.validate() && isFormValid()) {
    try {
      // Confirmación de edición
      const agreed = await confirm({
        title: 'Confirmar Edición',
        message: `Deseas editar la Ficha Técnica ${ficha.value.NombreProducto}?`,
        okText: 'Aceptar',
        cancelText: 'Cancelar',
        size: 'small',
        maxWidth: '380px',
      })

      if (!agreed) {
        notify({
          message: 'Edición cancelada',
          color: 'info',
          duration: 5000,
          position: 'top-right',
        })
        router.push('/fichas')
        return
      }

      // IDs válidos de colores y tallas
      const validColorIds = colorsFromAPI.value.map((c) => c.IdColor)
      const validTallaIds = tallasEnum.value.map((t) => t.IdTalla)

      // IDs seleccionados por el usuario
      const selectedColorIds = selectedColors.value.map((color) => color.IdColor)
      const selectedTallaIds = selectedTallas.value.map((talla) => talla.IdTalla)

      // Filtrar IDs seleccionados
      const filteredColorIds = selectedColorIds.filter((id) => validColorIds.includes(id))
      const filteredTallaIds = selectedTallaIds.filter((id) => validTallaIds.includes(id))

      if (filteredColorIds.length !== selectedColorIds.length || filteredTallaIds.length !== selectedTallaIds.length) {
        throw new Error('Hay IDs de colores o tallas no válidos')
      }

      // Crear FormData
      const formData = new FormData()
      formData.append('IdFichaTecnica', ficha.value.IdFichaTecnica.toString())
      formData.append('NombreProducto', ficha.value.NombreProducto)
      formData.append('EstadoFicha', ficha.value.EstadoFicha)
      formData.append('Colores', JSON.stringify(filteredColorIds))
      formData.append('Tallas', JSON.stringify(filteredTallaIds))
      formData.append('ImagenesEliminar', JSON.stringify(imagesToDelete.value.map((img) => img.imagen)))

      // Añadir nuevas imágenes
      uploadedImages.value.forEach((file) => {
        console.log('File:', file) // Log the file object to see its properties
        formData.append('imagenes', file)
      })

      // Log the FormData to check its contents

      // URL para actualizar la ficha técnica
      const url = `https://apinodedvp.onrender.com/fichaTecnica/${ficha.value.IdFichaTecnica}`

      // Realizar la solicitud PUT al backend
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al guardar la ficha técnica')
      }

      // Emitir el evento 'save' para notificar sobre la actualización
      emit('save', ficha.value)

      // Mostrar mensaje de éxito y redirigir
      showSuccessAlert.value = true
      notify({
        message: `${ficha.value.NombreProducto} editado con éxito`,
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
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Editar</h2>
    <VaCard v-if="ficha">
      <VaCardContent>
        <VaForm
          v-slot="{ isValid }"
          ref="edit-ficha-form"
          class="flex-col justify-start items-start gap-4 inline-flex w-full"
        >
          <div class="self-stretch flex-col justify-start items-start gap-4 flex">
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="ficha.NombreProducto"
                label="Nombre De La Ficha"
                class="w-full sm:w-1/2"
                name="NombreProducto"
              />
            </div>
            <!-- Contenedor desplazable que incluye búsqueda y colores seleccionados -->
            <div class="selected-colors-container mt-4">
              <!-- Componente de búsqueda dinámica de colores y lista de colores -->
              <div class="flex-1">
                <VaInput v-model="searchQuery" label="Buscar colores" placeholder="buscar colores" class="w-full" />
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
            <div class="mt-4 flex justify-start items-start gap-4">
              <div class="w-full sm:w-1/2">
                <label class="block text-sm font-medium text-gray-700">Tallas</label>
                <div class="flex flex-wrap gap-4">
                  <div v-for="talla in tallasEnum" :key="talla.IdTalla" class="flex items-center">
                    <input
                      :id="talla.IdTalla.toString()"
                      type="checkbox"
                      :value="talla.IdTalla"
                      class="mr-2"
                      :checked="selectedTallas.some((selectedTalla) => selectedTalla.IdTalla === talla.IdTalla)"
                      @change="handleTallaSelection($event, talla)"
                    />
                    <label :for="talla.IdTalla.toString()">{{ talla.Talla }}</label>
                  </div>
                </div>
                <span v-if="tallaError" class="text-red-500">{{ tallaError }}</span>
              </div>
              <!-- Mostrar tallas seleccionadas -->
              <div v-if="selectedTallas.length" class="selected-tallas-table w-full sm:w-1/2">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Talla
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
                    <tr v-for="talla in selectedTallas" :key="talla.IdTalla">
                      <td class="px-6 py-4 whitespace-nowrap">{{ talla.Talla }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <VaButton
                          preset="danger"
                          size="small"
                          icon="mso-delete"
                          color="danger"
                          aria-label="Eliminar Talla"
                          title="Eliminar"
                          @click="removeTalla(talla)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Mostrar imagenes seleccionadas -->
            <div class="image-upload-container">
              <!-- Área personalizada de subida de archivos -->
              <div class="upload-area">
                <div class="upload-content" @click="triggerFileInput">
                  <p class="upload-text">Haz clic o arrastra y suelta archivos aquí para subir</p>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    class="hidden"
                    @change="handleFileUpload"
                  />
                  <button class="upload-button">Elegir archivos</button>
                </div>
                <span v-if="imageError" class="text-red-500">{{ imageError }}</span>
              </div>

              <!-- Mostrar imágenes en tarjetas -->
              <div v-if="uploadedImages.length" class="image-cards">
                <VaCard v-for="(image, index) in uploadedImages" :key="index" class="image-card">
                  <img :src="image.url" alt="Imagen subida" class="card-image" />
                  <VaButton
                    preset="danger"
                    size="small"
                    icon="mso-delete"
                    color="danger"
                    aria-label="Eliminar Imagen"
                    title="Eliminar"
                    class="delete-button"
                    @click="removeImage(image)"
                  />
                </VaCard>
              </div>
            </div>

            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="ficha.EstadoFicha"
                label="Estado Ficha"
                class="w-full sm:w-1/2"
                :rules="[(v: any) => !!v || 'El campo es obligatorio']"
                name="EstadoFicha"
                readonly
              />
            </div>
            <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
              <VaButton preset="secondary" color="secondary" @click="onCancel">Cancelar</VaButton>
              <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
            </div>
          </div>
        </VaForm>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style>
.va-input {
  width: 100%;
}

.selected-colors-container {
  border: 1px solid #e2e8f0;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 16px;
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
  max-height: 300px;
}

.selected-colors-table {
  flex: 1;
  margin-top: 0;
  overflow-y: auto;
  max-height: 150px;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-4 {
  gap: 1rem;
}

.items-center {
  align-items: center;
}

.mr-2 {
  margin-right: 0.5rem;
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
.image-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-area {
  margin-bottom: 20px;
}

.upload-content {
  border: 2px dashed #007bff;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.upload-text {
  margin-bottom: 10px;
}

.upload-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.upload-button:hover {
  background-color: #0056b3;
}

.hidden {
  display: none;
}

.image-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.image-card {
  position: relative;
  width: 200px;
  height: 200px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
