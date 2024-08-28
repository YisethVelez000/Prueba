<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FichaTecnica, Imagen } from '../types'
import { ObtenerColores, ObtenerFichaPorId, ObtenerTallas } from '../../../data/pages/ficha'
import { useRouter, useRoute } from 'vue-router'

// const emit = defineEmits(['close', 'save'])
// const { init: notify } = useToast()
// const { confirm } = useModal()
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
const uploadedImages = ref<Imagen[]>([])

// const form = useForm('edit-ficha-form')

// const showSuccessAlert = ref(false)

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
        Imagen: item.Imagen.Imagen,
      })),
    }

    // Asigna los colores a selectedColors
    selectedColors.value = ficha.value.Ficha_Has_Colores.map((item: any) => ({
      IdColor: item.IdColor, // Usar IdColor original
      Color: item.Color,
    }))
    // Asigna las tallas a selectedTallas
    selectedTallas.value = ficha.value.Ficha_Has_Tallas.map((item: any) => ({
      IdTalla: item.IdTalla,
      Talla: item.Talla,
    }))
    // Asigna las imágenes a uploadedImages
    uploadedImages.value = ficha.value.Ficha_Has_Imagens.map((item: any) => ({
      url: item.Imagen,
    }))
    loadImagesFromLocalStorage()

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

// const saveImagesToLocalStorage = () => {
//   localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages.value))
// }
const loadImagesFromLocalStorage = () => {
  const storedImages = localStorage.getItem('uploadedImages')
  if (storedImages) {
    uploadedImages.value = JSON.parse(storedImages)
  }
}

// Método para manejar la selección de tallas

const onCancel = () => {
  router.push('/fichas')
}

// function hideAlert() {
//   throw new Error('Function not implemented.')
// }
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-primary mb-4">Visualizar</h2>
    <VaCard v-if="ficha">
      <VaCardContent>
        <div class="flex-col justify-start items-start gap-4 inline-flex w-full">
          <div class="self-stretch flex-col justify-start items-start gap-4 flex">
            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput v-model="ficha.NombreProducto" label="Nombre De La Ficha" class="w-full sm:w-1/2" readonly />
            </div>

            <div class="flex gap-4 mt-4 w-full">
              <!-- Mostrar colores disponibles -->
              <div class="w-full sm:w-1/2">
                <h3 class="text-xl font-semibold text-primary mb-4">Colores Disponibles</h3>
                <div v-if="selectedColors.length" class="selected-colors-table w-full">
                  <ul class="space-y-2">
                    <li v-for="color in selectedColors" :key="color.IdColor" class="flex items-center">
                      <span class="px-3 py-1 rounded-lg bg-gray-200">{{ color.Color }}</span>
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p>No hay colores seleccionados.</p>
                </div>
              </div>

              <!-- Mostrar tallas disponibles -->
              <div class="w-full sm:w-1/2">
                <h3 class="text-xl font-semibold text-primary mb-4">Tallas Disponibles</h3>
                <div v-if="selectedTallas.length" class="selected-tallas-table w-full">
                  <ul class="space-y-2">
                    <li v-for="talla in selectedTallas" :key="talla.IdTalla" class="flex items-center">
                      <span class="px-3 py-1 rounded-lg bg-gray-200">{{ talla.Talla }}</span>
                    </li>
                  </ul>
                </div>
                <div v-else>
                  <p>No hay tallas seleccionadas.</p>
                </div>
              </div>
            </div>

            <!-- Mostrar imágenes cargadas -->
            <div class="uploaded-images-container mt-4">
              <h3 class="text-xl font-semibold text-primary mb-4">Imágenes Cargadas</h3>
              <div class="flex flex-wrap gap-4">
                <div v-for="(image, index) in uploadedImages" :key="index" class="relative w-32 h-32">
                  <img :src="image.url" alt="Imagen" class="object-cover w-full h-full rounded-lg" />
                </div>
              </div>
            </div>

            <div class="flex gap-4 flex-col sm:flex-row w-full">
              <VaInput v-model="ficha.EstadoFicha" label="Estado Ficha" class="w-full sm:w-1/2" readonly />
            </div>

            <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
              <VaButton preset="secondary" color="secondary" @click="onCancel">Cerrar</VaButton>
            </div>
          </div>
        </div>
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
</style>
