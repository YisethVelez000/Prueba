<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Parametrizacion } from '../types'
import { ObtenerParametrizacionPorId, EditarParametrizacion } from '../../../data/pages/parametrizacion'
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const parametrizacion = ref<Parametrizacion>({
  IdParametrizacion: -1,
  NombreDescuento: '',
  ValorDescuento: 0,
})

const showSuccessAlert = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let idParametrizacion = route.params.IdParametrizacion
    if (Array.isArray(idParametrizacion)) {
      idParametrizacion = idParametrizacion[0]
    }
    const parametrizacionData = await ObtenerParametrizacionPorId(idParametrizacion)
    parametrizacion.value = { ...parametrizacionData }
  } catch (error) {
    console.error('Error al cargar los datos de la parametrizacion:', error)
  }
})

const onSave = async () => {
  try {
    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar la parametrizacion ${parametrizacion.value.NombreDescuento}?`,
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
      router.push({ name: 'ListarParametrizaciones' })
      return
    }

    await EditarParametrizacion(parametrizacion.value)
    showSuccessAlert.value = true
    notify({
      message: `${parametrizacion.value.NombreDescuento} editado con éxito`,
      color: 'success',
      duration: 5000,
      position: 'top-right',
    })
    setTimeout(() => router.push('/parametrizacion'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios de la parametrizacion:', error)
    notify({
      message: 'Error al guardar la parametrizacion',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/parametrizacion')
}

const saveButtonLabel = ref('Guardar')
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Parametrizacion</h2>
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
              v-model="parametrizacion.NombreDescuento"
              label="Nombre del descuento"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => /^[A-Za-zÁÉÍÓÚáéíóúüñ\s]+$/.test(v) || 'No se permiten números ni caracteres especiales',
              ]"
              name="NombreDescuento"
            />
            <VaInput
              v-model="parametrizacion.ValorDescuento"
              label="Valor del descuento"
              class="w-full sm:w-1/2"
              type="number"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => (!isNaN(Number(v)) && Number(v) >= 0) || 'No se permiten valores negativos',
              ]"
              name="ValorDescuento"
            />
          </div>
        </div>
        <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
          <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
          <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
  <VaNotification
    v-model="showSuccessAlert"
    title="Éxito"
    message="Parametrizacion guardado exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>
