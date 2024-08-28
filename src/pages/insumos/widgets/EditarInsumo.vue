<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Insumo } from '../types'
import { ObtenerInsumoPorId, EditarInsumo } from '../../../data/pages/insumos'
import { useRouter, useRoute } from 'vue-router'
import { useToast, useModal } from 'vuestic-ui'

const { init: notify } = useToast()
const { confirm } = useModal()

const insumo = ref<Insumo>({
  IdInsumo: -1,
  NombreInsumo: '',
  CantidadInsumo: 0,
  EstadoInsumo: '',
  Agotado: '',
})

const showSuccessAlert = ref(false)
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  try {
    let idInsumo = route.params.IdInsumo
    if (Array.isArray(idInsumo)) {
      idInsumo = idInsumo[0]
    }
    if (!idInsumo) {
      throw new Error('IdInsumo es inválido')
    }
    const insumoData = await ObtenerInsumoPorId(idInsumo)
    insumo.value = { ...insumoData }
  } catch (error) {
    console.error('Error al cargar los datos de los insumos:', error)
  }
})

const onSave = async () => {
  try {
    if (!insumo.value.IdInsumo || insumo.value.IdInsumo === -1) {
      throw new Error('Insumo inválido o IdInsumo faltante')
    }
    const agreed = await confirm({
      title: 'Confirmar Edición',
      message: `¿Deseas editar el insumo ${insumo.value.NombreInsumo}?`,
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
      router.push({ name: 'ListarInsumo' })
      return
    }

    await EditarInsumo(insumo.value)
    showSuccessAlert.value = true
    notify({
      message: `${insumo.value.NombreInsumo} editado con éxito`,
      color: 'success',
      duration: 5000,
      position: 'top-right',
    })
    setTimeout(() => router.push('/insumos'), 2000)
  } catch (error) {
    console.error('Error al guardar los cambios del insumo:', error)
    notify({
      message: 'Error al guardar el insumo',
      color: 'error',
      duration: 5000,
      position: 'top-right',
    })
  }
}

const onClose = () => {
  router.push('/insumos')
}

const saveButtonLabel = ref('Guardar')
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h2 class="text-xl font-semibold mb-4">Editar Insumo</h2>
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
              v-model="insumo.NombreInsumo"
              label="Nombre Insumo"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) =>
                  /^[A-ZÁÉÍÓÚ][a-záéíóúüñ\s]{0,39}$/.test(v) ||
                  'El nombre debe empezar con mayúscula y tener máximo 30 caracteres',
              ]"
              name="NombreInsumo"
            />
            <VaInput
              v-model="insumo.CantidadInsumo"
              label="Cantidad Insumo"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v) => !!v || 'El campo es obligatorio']"
              name="CantidadInsumo"
            />
          </div>
          <!-- <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="insumo.PrecioUnitario"
              label="Precio Unitario"
              class="w-full sm:w-1/2"
              :rules="[
                (v) => !!v || 'El campo es obligatorio',
                (v) => /^[0-9]{7}-[0-9]$/.test(v) || 'El formato del NIT debe ser xxxxxxx-x',
              ]"
              name="PrecioUnitario"
            />
            <VaInput
              v-model="insumo.Iva"
              label="Iva"
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v) => !!v || 'El campo es obligatorio']"
              name="Iva"
            />
          </div> -->
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="insumo.EstadoInsumo"
              label="Estado Insumo"
              class="w-full sm:w-1/2"
              :options="['Activo', 'Inactivo']"
              :rules="[(v) => !!v || 'El campo es obligatorio']"
              name="EstadoInsumo"
            />
            <VaSelect
              v-model="insumo.Agotado"
              label="Agotado"
              class="w-full sm:w-1/2"
              :options="['Sí', 'No']"
              :rules="[(v) => !!v || 'El campo es obligatorio']"
              name="Agotado"
            />
          </div>
          <!-- <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="insumo.IdMedida"
              label="Id Medida "
              class="w-full sm:w-1/2"
              type="text"
              :rules="[(v) => !!v || 'El campo es obligatorio']"
              name="IdMedida"
            />
          </div> -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <VaNotification
    v-model="showSuccessAlert"
    title="Éxito"
    message="Insumo guardado exitosamente"
    color="success"
    duration="5000"
    position="top-right"
  />
</template>
