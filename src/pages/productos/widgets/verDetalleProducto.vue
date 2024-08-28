<template>
  <div>
    <h2 class="text-xl font-semibold text-primary mb-4">Visualizar</h2>
    <VaCard v-if="producto">
      <VaCardContent>
        <!-- Información del producto -->
        <div class="flex flex-wrap gap-4">
          <div class="w-full sm:w-1/3">
            <VaInput v-model="producto.NombreProductoCatalogo" label="Nombre del producto" class="w-full" readonly />
          </div>
          <div class="w-full sm:w-1/3">
            <VaInput v-model="producto.FechaRegistro" label="Fecha de registro" class="w-full" readonly />
          </div>
          <div class="w-full sm:w-1/3">
            <VaInput v-model="producto.PrecioProducto" label="Precio del producto" class="w-full" readonly />
          </div>
          <div class="w-full sm:w-1/3">
            <VaInput v-model="producto.Personalizable" label="Personalizable" class="w-full" readonly />
          </div>
          <div class="w-full sm:w-1/3">
            <VaInput v-model="producto.EstadoProducto" label="Estado del producto" class="w-full" readonly />
          </div>
        </div>

        <!-- Ficha Técnica -->
        <div v-if="fichaTecnica" class="mt-4">
          <h3 class="text-xl font-semibold text-primary mb-4">Ficha Técnica</h3>
          <div class="p-4 border rounded-lg border-gray-300">
            <p><strong>Nombre de la Ficha Técnica:</strong> {{ fichaTecnica.NombreProducto }}</p>
            <!-- Aquí puedes agregar más campos de la ficha técnica si están disponibles -->
          </div>
        </div>

        <!-- Sección 2x2: Colores, Estampados, Tallas e Imágenes -->
        <div class="mt-4 grid grid-cols-2 gap-4">
          <!-- Colores -->
          <div>
            <h3 class="text-xl font-semibold text-primary mb-4">Colores</h3>
            <div v-if="selectedColors.length" class="selected-colors-table">
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

          <!-- Estampados -->
          <div>
            <h3 class="text-xl font-semibold text-primary mb-4">Estampados</h3>
            <div v-if="selectedEstampados.length" class="selected-estampados-table">
              <ul class="space-y-2">
                <li v-for="estampado in selectedEstampados" :key="estampado.IdEstampado" class="flex items-center">
                  <span class="px-3 py-1 rounded-lg bg-gray-200">{{ estampado.TipoEstampado }}</span>
                </li>
              </ul>
            </div>
            <div v-else>
              <p>No hay estampados seleccionados.</p>
            </div>
          </div>

          <!-- Tallas -->
          <div>
            <h3 class="text-xl font-semibold text-primary mb-4">Tallas</h3>
            <div v-if="selectedTallas.length" class="selected-tallas-table">
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

          <!-- Imágenes -->
          <div>
            <h3 class="text-xl font-semibold text-primary mb-4">Imágenes Cargadas</h3>
            <div class="flex flex-wrap gap-4">
              <div v-for="(image, index) in uploadedImages" :key="index" class="relative w-32 h-32">
                <img :src="image.url" alt="Imagen" class="object-cover w-full h-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de Cerrar -->
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center mt-4">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cerrar</VaButton>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Producto, Imagen, FichaTecnica } from '../types'
import {
  ObtenerColores,
  ObtenerProductoPorId,
  ObtenerTallas,
  ObtenerEstampados,
  ObtenerFichaTecnica,
} from '../../../data/pages/productos'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const producto = ref<Producto>({
  IdProducto: -1,
  NombreProductoCatalogo: '',
  FechaRegistro: new Date().toISOString().substring(0, 10),
  PrecioProducto: 0,
  Personalizable: '',
  EstadoProducto: 'Activo',
  IdFichaTecnica: 1, // Cambiar a null inicialmente
  Producto_has_Colores: [],
  Producto_has_Tallas: [],
  Producto_Has_Imagens: [],
  EstampadoProductos: [],
})
const selectedColors = ref<{ IdColor: number; Color: string }[]>([])
const selectedTallas = ref<{ IdTalla: number; Talla: string }[]>([])
const selectedEstampados = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const uploadedImages = ref<Imagen[]>([])
const fichaTecnica = ref<FichaTecnica | null>(null)

const onClose = () => {
  router.push('/productos')
}

const colorsFromAPI = ref<{ IdColor: number; Color: string }[]>([])
const estampadosFromAPI = ref<{ IdEstampado: number; TipoEstampado: string }[]>([])
const tallasEnum = ref<{ IdTalla: number; Talla: string }[]>([])

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
    estampadosFromAPI.value = response.data
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

const obtenerFichasTecnicas = async () => {
  try {
    const response = await ObtenerFichaTecnica() // Obtén todas las fichas técnicas
    // Filtra la ficha técnica correspondiente al ID
    fichaTecnica.value =
      response.find(
        (ficha: { IdFichaTecnica: number; NombreProducto: string }) =>
          ficha.IdFichaTecnica === producto.value.IdFichaTecnica,
      ) || null
  } catch (error) {
    console.error('Error al obtener las fichas técnicas:', error)
  }
}

onMounted(async () => {
  try {
    let idProducto = route.params.IdProducto
    if (Array.isArray(idProducto)) {
      idProducto = idProducto[0]
    }

    const productoData = await ObtenerProductoPorId(idProducto)
    producto.value = {
      IdProducto: productoData.IdProducto,
      NombreProductoCatalogo: productoData.NombreProductoCatalogo,
      FechaRegistro: productoData.FechaRegistro,
      PrecioProducto: productoData.PrecioProducto,
      Personalizable: productoData.Personalizable,
      EstadoProducto: productoData.EstadoProducto,
      IdFichaTecnica: productoData.IdFichaTecnica,
      Producto_has_Colores: productoData.Producto_has_Colores.map((item: any) => ({
        IdColor: item.Color.IdColor,
        Color: item.Color.Color,
      })),
      Producto_has_Tallas: productoData.Producto_has_Tallas.map((item: any) => ({
        IdTalla: item.Talla.IdTalla,
        Talla: item.Talla.Talla,
      })),
      Producto_Has_Imagens: productoData.Producto_Has_Imagens.map((item: any) => ({
        url: item.Imagen.Imagen,
      })),
      EstampadoProductos: productoData.EstampadoProductos.map((item: any) => ({
        IdEstampado: item.Estampado.IdEstampado,
        TipoEstampado: item.Estampado.TipoEstampado,
      })),
    }

    selectedColors.value = producto.value.Producto_has_Colores
    selectedTallas.value = producto.value.Producto_has_Tallas
    selectedEstampados.value = producto.value.EstampadoProductos
    uploadedImages.value = producto.value.Producto_Has_Imagens

    if (producto.value.IdFichaTecnica) {
      await obtenerFichasTecnicas() // Llama a la función que obtiene todas las fichas técnicas
    }

    await obtenerColores()
    await obtenerEstampados()
    await obtenerTallas()
  } catch (error) {
    console.error('Error al cargar los datos del producto:', error)
  }
})
</script>

<style>
.va-input {
  width: 100%;
}

.selected-colors-table,
.selected-estampados-table,
.selected-tallas-table {
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

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
</style>
