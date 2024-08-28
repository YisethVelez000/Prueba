<script setup lang="ts">
import { ref, onMounted, defineEmits, watch } from 'vue'
import { useForm, useModal, useToast } from 'vuestic-ui'
import { Producto, Imagen } from '../types'
import {
  ObtenerColores,
  ObtenerEstampados,
  ObtenerProductoPorId,
  ObtenerTallas,
  ObtenerFichaTecnica,
} from '../../../data/pages/productos'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['close', 'save'])
const { init: notify } = useToast()
const { confirm } = useModal()
const router = useRouter()
const route = useRoute()

const producto = ref<Producto>({
  IdProducto: -1,
  NombreProductoCatalogo: '',
  FechaRegistro: new Date().toISOString().substring(0, 10),
  PrecioProducto: 0,
  Personalizable: '',
  EstadoProducto: 'Activo',
  IdFichaTecnica: 1,
  Producto_has_Colores: [],
  Producto_has_Tallas: [],
  Producto_Has_Imagens: [],
  EstampadoProductos: [],
})

const selectedColors = ref<{ IdColor: number; Color: string }[]>([])
const selectedEstampados = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const selectedTallas = ref<{ IdTalla: number; Talla: string }[]>([])
const uploadedImages = ref<File[]>([])
const imagesToDelete = ref<Imagen[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const form = useForm('edit-producto-form')
const showSuccessAlert = ref(false)
const saveButtonLabel = ref('Guardar')

const onClose = () => {
  router.push('/productos')
}

// Datos y métodos para la selección de colores
const searchQueryColors = ref('')
const searchQueryEstampados = ref('')
const colorsFromAPI = ref<{ IdColor: number; Color: string }[]>([])
const estampadosFromAPI = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const filteredColors = ref<{ IdColor: number; Color: string }[]>([])
const filteredEstampados = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const tallasEnum = ref<{ IdTalla: number; Talla: string }[]>([])
const selectedFicha = ref({ IdFichaTecnica: producto.value.IdFichaTecnica, NombreProducto: '' })
const searchQueryFichas = ref('')
const fichasFromAPI = ref<{ IdFichaTecnica: number; NombreProducto: string }[]>([])
const filteredFichasTecnicas = ref<{ IdFichaTecnica: number; NombreProducto: string }[]>([])

// Función para obtener las fichas técnicas
const obtenerFichasTecnicas = async () => {
  try {
    const response = await ObtenerFichaTecnica()
    fichasFromAPI.value = response.map((ficha: { NombreProducto: string }, index: number) => ({
      IdFichaTecnica: index + 1,
      NombreProducto: ficha.NombreProducto,
    }))

    console.log('FichasObtenidas:', fichasFromAPI)

    selectedFicha.value = fichasFromAPI.value.find(
      (ficha) => ficha.IdFichaTecnica === producto.value.IdFichaTecnica,
    ) || { IdFichaTecnica: -1, NombreProducto: 'No seleccionada' }
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
    let idProducto = route.params.IdProducto
    if (Array.isArray(idProducto)) {
      idProducto = idProducto[0]
    }

    const productoData = await ObtenerProductoPorId(idProducto)
    console.log('Datos del producto:', productoData)

    producto.value = {
      IdProducto: productoData.IdProducto,
      NombreProductoCatalogo: productoData.NombreProductoCatalogo,
      FechaRegistro: productoData.FechaRegistro,
      PrecioProducto: productoData.PrecioProducto,
      Personalizable: productoData.Personalizable,
      EstadoProducto: productoData.EstadoProducto,
      IdFichaTecnica: productoData.IdFichaTecnica,
      Producto_has_Colores: productoData.Producto_has_Colores.map((item: any) => ({
        IdProductoColor: item.IdProductoColor,
        Color: item.Color.Color,
        IdColor: item.Color.IdColor, // Mantener IdColor original
      })),
      Producto_has_Tallas: productoData.Producto_has_Tallas.map((item: any) => ({
        IdProductosTallas: item.IdProductosTallas,
        Talla: item.Talla.Talla,
        IdTalla: item.Talla.IdTalla,
      })),
      Producto_Has_Imagens: productoData.Producto_Has_Imagens.map((item: any) => ({
        IdProductoImagen: item.IdProductoImagen,
        Imagen: item.Imagen.Imagen,
      })),
      EstampadoProductos: productoData.EstampadoProductos.map((item: any) => ({
        IdEstampadoProducto: item.IdEstampadoProducto,
        TipoEstampado: item.Estampado.TipoEstampado,
        IdEstampado: item.Estampado.IdEstampado,
      })),
    }

    // Asigna los colores a selectedColors
    selectedColors.value = producto.value.Producto_has_Colores.map((item: any) => ({
      IdColor: item.IdColor, // Usar IdColor original
      Color: item.Color,
    }))

    // Asigna las tallas a selectedTallas
    selectedTallas.value = producto.value.Producto_has_Tallas.map((item: any) => ({
      IdTalla: item.IdTalla,
      Talla: item.Talla,
    }))

    // Asigna los estampados a selectedEstampados
    selectedEstampados.value = producto.value.EstampadoProductos.map((item: any) => ({
      IdEstampado: item.IdEstampado,
      TipoEstampado: item.TipoEstampado,
    }))

    // Asigna las imágenes a uploadedImages
    uploadedImages.value = producto.value.Producto_Has_Imagens.map((item: any) => ({
      url: item.Imagen,
    }))

    obtenerColores()
    obtenerTallas()
    obtenerEstampados()
    obtenerFichasTecnicas()
  } catch (error) {
    console.error('Error al cargar los datos del producto:', error)
  }
})

// Filtrar colores según la búsqueda
watch(searchQueryColors, (newValue) => {
  if (newValue.trim() === '') {
    filteredColors.value = []
  } else {
    filteredColors.value = colorsFromAPI.value.filter((color) =>
      color.Color.toLowerCase().includes(newValue.trim().toLowerCase()),
    )
  }
})

// Filtrar fichas técnicas según la búsqueda
watch(searchQueryFichas, (newValue) => {
  if (newValue.trim() === '') {
    filteredFichasTecnicas.value = []
  } else {
    filteredFichasTecnicas.value = fichasFromAPI.value.filter((ficha) =>
      ficha.NombreProducto.toLowerCase().includes(newValue.trim().toLowerCase()),
    )
  }
})

watch(selectedFicha, (newValue) => {
  producto.value.IdFichaTecnica = newValue.IdFichaTecnica
})

// Filtrar estampados según la búsqueda
watch(searchQueryEstampados, (newValue) => {
  if (newValue.trim() === '') {
    filteredEstampados.value = []
  } else {
    filteredEstampados.value = estampadosFromAPI.value.filter((estampado) =>
      estampado.TipoEstampado.toLowerCase().includes(newValue.trim().toLowerCase()),
    )
  }
})

const addColor = (color: { IdColor: number; Color: string }) => {
  if (!selectedColors.value.some((c) => c.IdColor === color.IdColor)) {
    selectedColors.value.push(color)
  }
}

const removeColor = (color: { IdColor: number; Color: string }) => {
  selectedColors.value = selectedColors.value.filter((c) => c.IdColor !== color.IdColor)
}

const removeImage = (image: { imagen: string; file?: File; url: string }) => {
  const existingImage = producto.value.Producto_Has_Imagens.find((img) => img.Imagen === image.url)
  if (existingImage && !imagesToDelete.value.some((img) => img.imagen === existingImage.Imagen)) {
    imagesToDelete.value.push({
      IdImagen: existingImage.IdProductoImagen,
      imagen: image.url,
    })
  }

  uploadedImages.value = uploadedImages.value.filter((img) => img.url !== image.url)
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const addEstampado = (estampado: { IdEstampado: number; TipoEstampado: string }) => {
  if (!selectedEstampados.value.some((e) => e.IdEstampado === estampado.IdEstampado)) {
    selectedEstampados.value.push(estampado)
  }
}

const removeEstampado = (estampado: { IdEstampado: number; TipoEstampado: string }) => {
  selectedEstampados.value = selectedEstampados.value.filter((e) => e.IdEstampado !== estampado.IdEstampado)
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)

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

const onSave = async () => {
  if (form.validate()) {
    try {
      const agreed = await confirm({
        title: 'Confirmar Edición',
        message: `¿Deseas editar el producto?`,
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
        router.push('/productos')
        return
      }

      const validColorIds = colorsFromAPI.value.map((c) => c.IdColor)
      const validTallaIds = tallasEnum.value.map((t) => t.IdTalla)
      const validEstampadosIds = estampadosFromAPI.value.map((e) => e.IdEstampado)

      const selectedColorIds = selectedColors.value.map((color) => color.IdColor)
      const selectedTallaIds = selectedTallas.value.map((talla) => talla.IdTalla)
      const selectedEstampadosIds = selectedEstampados.value.map((estampado) => estampado.IdEstampado)

      const filteredColorIds = selectedColorIds.filter((id) => validColorIds.includes(id))
      const filteredTallaIds = selectedTallaIds.filter((id) => validTallaIds.includes(id))
      const filteredEstampadosIds = selectedEstampadosIds.filter((id) => validEstampadosIds.includes(id))

      if (
        filteredColorIds.length !== selectedColorIds.length ||
        filteredTallaIds.length !== selectedTallaIds.length ||
        filteredEstampadosIds.length !== selectedEstampadosIds.length
      ) {
        throw new Error('Hay IDs de colores, tallas y estampados no válidos')
      }

      const formData = new FormData()
      formData.append('IdProducto', producto.value.IdProducto.toString())
      formData.append('NombreProductoCatalogo', producto.value.NombreProductoCatalogo)
      formData.append('FechaRegistro', producto.value.FechaRegistro.toString())
      formData.append('PrecioProducto', producto.value.PrecioProducto.toString())
      formData.append('Personalizable', producto.value.Personalizable)
      formData.append('EstadoProducto', producto.value.EstadoProducto)
      formData.append('Colores', JSON.stringify(filteredColorIds))
      formData.append('Tallas', JSON.stringify(filteredTallaIds))
      formData.append('Estampados', JSON.stringify(filteredEstampadosIds))
      formData.append('ImagenesEliminar', JSON.stringify(imagesToDelete.value.map((img) => img.imagen)))

      // Añadir nuevas imágenes
      uploadedImages.value.forEach((file) => {
        console.log('File:', file) // Log the file object to see its properties
        formData.append('imagenes', file)
      })

      // Añadir la ficha técnica seleccionada
      if (selectedFicha.value) {
        formData.append('IdFichaTecnica', selectedFicha.value.IdFichaTecnica.toString())
      } else {
        // Puedes manejar el caso en el que no haya ficha técnica seleccionada si es necesario
        formData.append('IdFichaTecnica', '-1') // o cualquier valor predeterminado que el backend espere
      }

      console.log('Datos del formulario:', {
        IdProducto: producto.value.IdProducto.toString(),
        NombreProductoCatalogo: producto.value.NombreProductoCatalogo,
        FechaRegistro: producto.value.FechaRegistro.toString(),
        PrecioProducto: producto.value.PrecioProducto.toString(),
        Personalizable: producto.value.Personalizable,
        EstadoProducto: producto.value.EstadoProducto,
        Colores: JSON.stringify(filteredColorIds),
        Tallas: JSON.stringify(filteredTallaIds),
        Estampados: JSON.stringify(filteredEstampadosIds),
        IdFichaTecnica: selectedFicha.value?.IdFichaTecnica || '-1', // Usar valor predeterminado si no hay ficha seleccionada
      })

      const url = `https://apinodedvp.onrender.com/productos/${producto.value.IdProducto}`
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al guardar el producto')
      }

      emit('save', producto.value)
      showSuccessAlert.value = true
      notify({
        message: `${producto.value.NombreProductoCatalogo} editado con éxito`,
        color: 'success',
        duration: 5000,
        position: 'top-right',
      })

      setTimeout(() => router.push('/productos'), 2000)
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      notify({
        title: 'Error',
        text: error.message || 'Hubo un problema al guardar el producto',
        icon: 'error',
        duration: 5000,
        position: 'top-right',
      })
    }
  }
}

console.log(producto.value.IdFichaTecnica)
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Editar</h2>
    <VaCard v-if="producto">
      <VaCardContent>
        <VaForm
          v-slot="{ isValid }"
          ref="edit-producto-form"
          class="flex-col justify-start items-start gap-4 inline-flex w-full"
        >
          <div class="self-stretch flex-col justify-start items-start gap-4 flex">
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="producto.NombreProductoCatalogo"
                label="Nombre del producto"
                class="w-full sm:w-1/2"
                name="NombreProductoCatalogo"
              />
            </div>
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="producto.FechaRegistro"
                label="Fecha de registro"
                class="w-full sm:w-1/2"
                name="FechaRegistro"
              />
            </div>
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="producto.PrecioProducto"
                label="Precio del producto"
                class="w-full sm:w-1/2"
                name="PrecioProducto"
              />
            </div>
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput
                v-model="producto.Personalizable"
                label="Personalizable(Escriba(Sí/No))"
                class="w-full sm:w-1/2"
                name="Personalizable"
              />
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
                    <input v-model="selectedFicha" type="radio" :value="fichaTecnica" />
                    <label>{{ fichaTecnica.NombreProducto }}</label>
                  </div>
                </template>
              </div>
            </div>
            <!-- Contenedor desplazable que incluye búsqueda y colores seleccionados -->
            <div class="selected-colors-container mt-4">
              <!-- Componente de búsqueda dinámica de colores y lista de colores -->
              <div class="flex-1">
                <VaInput
                  v-model="searchQueryColors"
                  label="Buscar colores"
                  placeholder="buscar colores"
                  class="w-full"
                />
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
            <!-- Contenedor desplazable que incluye búsqueda y colores seleccionados -->
            <div class="selected-estampados-container mt-4">
              <!-- Componente de búsqueda dinámica de colores y lista de colores -->
              <div class="flex-1">
                <VaInput
                  v-model="searchQueryEstampados"
                  label="Buscar estampados"
                  placeholder="buscar estampados"
                  class="w-full"
                />
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
              <!-- Mostrar colores seleccionados -->
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
            <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
              <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
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

.selected-estampados-container {
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

.estampado-list {
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
.selected-estampados-table {
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
