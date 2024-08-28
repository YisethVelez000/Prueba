<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { Compra, Proveedor, InsumoCompra } from '../types'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const router = useRouter()

const compraId = Number(route.params.id)
const compra = ref<Compra | null>(null)
const proveedor = ref<Proveedor | null>(null)
const insumosCompra = ref<InsumoCompra[]>([])

const obtenerDetalleCompra = async () => {
  try {
    const response = await axios.get(`https://apinodedvp.onrender.com/compras/${compraId}`)
    compra.value = response.data
    proveedor.value = response.data.proveedor
    insumosCompra.value = response.data.Compras_Has_Insumos
  } catch (error) {
    console.error('Error al obtener el detalle de la compra:', error)
  }
}

onMounted(() => {
  obtenerDetalleCompra()
})

const regresar = () => {
  router.push({ name: 'compras' })
}

const generatePdf = () => {
  if (!compra.value || !proveedor.value || !insumosCompra.value.length) return

  const doc = new jsPDF()

  // Información de la compra
  doc.text('Detalle de Compra', 14, 16)
  doc.text(`Fecha de la compra: ${new Date(compra.value.FechaCompra).toLocaleDateString()}`, 14, 24)
  doc.text(`Recibo: ${compra.value.Recibo}`, 14, 32)
  doc.text(`Proveedor: ${proveedor.value.NombreProveedor}`, 14, 40)
  doc.text(`Anulada: ${compra.value.Anulada}`, 14, 48)
  if (compra.value.Anulada === 'Sí') {
    doc.text(`Motivo de Anulación: ${compra.value.MotivoAnulacion}`, 14, 56)
  }
  doc.text(`Precio total de la compra: ${compra.value.PrecioTotalCompra}`, 14, 64)

  // Imagen del recibo
  if (compra.value.ImagenRecibo) {
    const img = new Image()
    img.src = compra.value.ImagenRecibo
    img.onload = () => {
      doc.addImage(img, 'JPEG', 14, 72, 180, 160)

      // Incluir los insumos
      autoTable(doc, {
        startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 10 : 72 + 160 + 10,
        head: [['Nombre Insumo', 'Cantidad Comprada']],
        body: insumosCompra.value.map((insumo) => [
          insumo.insumo?.NombreInsumo || '',
          insumo.CantidadCompra.toString(),
        ]),
        theme: 'striped',
      })

      doc.save(`compra_${compraId}.pdf`)
    }
  } else {
    // Incluir los insumos si no hay imagen
    autoTable(doc, {
      startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 10 : 72,
      head: [['Nombre Insumo', 'Cantidad Comprada']],
      body: insumosCompra.value.map((insumo) => [insumo.insumo?.NombreInsumo || '', insumo.CantidadCompra.toString()]),
      theme: 'striped',
    })

    doc.save(`compra_${compraId}.pdf`)
  }
}

const generateExcel = () => {
  if (!compra.value || !proveedor.value || !insumosCompra.value.length) return

  // Información de la compra
  const wsCompra: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
    {
      'Fecha de la compra': new Date(compra.value.FechaCompra).toLocaleDateString(),
      Recibo: compra.value.Recibo,
      Proveedor: proveedor.value.NombreProveedor,
      Anulada: compra.value.Anulada,
      'Motivo de Anulación': compra.value.Anulada === 'Sí' ? compra.value.MotivoAnulacion : '',
      'Precio total de la compra': compra.value.PrecioTotalCompra,
    },
  ])

  // Información de los insumos
  const wsInsumos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
    insumosCompra.value.map((insumo) => ({
      'Nombre Insumo': insumo.insumo?.NombreInsumo || '',
      'Cantidad Comprada': insumo.CantidadCompra,
    })),
  )

  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsCompra, 'Detalles de Compra')
  XLSX.utils.book_append_sheet(wb, wsInsumos, 'Insumos')

  // Exportar a Excel
  XLSX.writeFile(wb, `compra_${compraId}.xlsx`)
}
</script>

<template>
  <div>
    <h1>Detalle de Compra</h1>
    <VaCard id="reporteCompra">
      <VaCardContent v-if="compra">
        <div class="flex flex-wrap gap-4">
          <!-- Información de la compra a la izquierda -->
          <div class="w-full sm:w-2/3">
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label class="form-label">Fecha de la compra</label>
                <p>{{ new Date(compra.FechaCompra).toLocaleDateString() }}</p>
              </div>
              <div>
                <label class="form-label">Recibo</label>
                <p>{{ compra.Recibo }}</p>
              </div>
              <div>
                <label class="form-label">Proveedor</label>
                <p>{{ proveedor?.NombreProveedor }}</p>
              </div>
              <div>
                <label class="form-label">Anulada</label>
                <p>{{ compra.Anulada }}</p>
              </div>
              <div v-if="compra.Anulada === 'Sí'" class="col-span-2">
                <label class="form-label">Motivo de Anulación</label>
                <p>{{ compra.MotivoAnulacion }}</p>
              </div>
            </div>
            <div v-if="insumosCompra.length" class="mt-4">
              <label class="form-label">Insumos de la compra</label>
              <div v-for="insumoCompra in insumosCompra" :key="insumoCompra.IdInsumoCompra" class="mt-2">
                <div class="flex gap-4">
                  <div class="w-full">
                    <label class="form-label">Nombre Insumo</label>
                    <p>{{ insumoCompra.insumo?.NombreInsumo }}</p>
                  </div>
                  <div class="w-full">
                    <label class="form-label">Cantidad Comprada</label>
                    <p>{{ insumoCompra.CantidadCompra }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <label class="form-label">Precio total de la compra</label>
              <p>{{ compra.PrecioTotalCompra }}</p>
            </div>
          </div>

          <!-- Imagen del recibo a la derecha -->
          <div class="w-full sm:w-1/3">
            <label class="form-label">Imagen del recibo</label>
            <img :src="compra.ImagenRecibo" alt="Imagen del recibo" class="max-w-full h-auto" />
          </div>
        </div>
        <VaButton color="primary" class="mt-4" @click="generatePdf">Generar PDF</VaButton>
        <VaButton color="primary" class="mt-4" @click="generateExcel">Generar Excel</VaButton>
        <VaButton color="primary" class="mt-4" @click="regresar">Regresar</VaButton>
      </VaCardContent>
      <VaCardContent v-else>
        <p>Cargando...</p>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
.form-label {
  font-weight: bold;
}
</style>
