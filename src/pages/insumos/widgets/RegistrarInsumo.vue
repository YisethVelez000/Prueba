<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useForm } from 'vuestic-ui'
import { Insumo } from '../types'
import { AgregarInsumo } from '../../../data/pages/insumos'
import { useRouter } from 'vue-router'
import { useInsumos } from '../composables/useInsumos'

const defaultNuevoInsumo: Omit<Insumo, 'IdInsumo'> = {
  NombreInsumo: '',
  CantidadInsumo: 0,
  EstadoInsumo: '',
  Agotado: '',
  IdMedida: 0,
}

const { medidas, cargarMedidas } = useInsumos()

const selectedMedida = ref<number>(0)

// Llamar a cargarMedidas al montar el componente
onMounted(async () => {
  try {
    console.log('Montando el componente y llamando a cargarMedidas...')
    await cargarMedidas()
  } catch (error) {
    console.error('Error al cargar las medidas:', error)
  }
})

const newInsumo = ref<Omit<Insumo, 'IdInsumo'>>({ ...defaultNuevoInsumo })
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      // Verificar que el campo 'Agotado' tenga un valor válido
      if (!['Sí', 'No'].includes(newInsumo.value.Agotado)) {
        throw new Error('"Agotado" debe ser "Sí" or "No"')
      }

      // Obtener IdMedida seleccionado
      // const selectedMedida = medidas.value.find(medida => medida.UnidadMedida === newInsumo.value.UnidadMedida);
      if (!selectedMedida.value) {
        throw new Error('Debe seleccionar una unidad de medida')
      }

      // Asignar IdMedida al nuevo insumo
      newInsumo.value.IdMedida = selectedMedida.value

      // Log para verificar IdMedida antes de guardar
      console.log('IdMedida seleccionado:', newInsumo.value.IdMedida)

      await AgregarInsumo(newInsumo.value)
      emit('save', newInsumo.value)
      router.push('/insumos')
      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el insumo:', error)
    }
  }
}

const onClose = () => {
  router.push('/insumos')
}

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

// const handleInput = (event: Event) => {
//   const input = event.target as HTMLInputElement
//   input.value = input.value.replace(/[^0-9]/g, '')
//   newInsumo.value.IdMedida = parseInt(input.value, 10) || 0
// }

//validaciones
const NombreInsumoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const CantidadInsumoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const EstadoInsumoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
// const IdMedidaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio']);
const AgotadoRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
const IvaRules = computed(() => [(v: string) => !!v || 'El campo es obligatorio'])
</script>
<!-- eslint-disable prettier/prettier -->

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Insumo</h2>
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
              v-model="newInsumo.NombreInsumo"
              label="Nombre Insumo"
              class="w-full sm:w-1/2"
              :rules="NombreInsumoRules"
              name="NombreInsumo"
            />
            <VaInput
              v-model="newInsumo.CantidadInsumo"
              label="Cantidad Insumo"
              class="w-full sm:w-1/2"
              type="text"
              :rules="CantidadInsumoRules"
              name="CantidadInsumo"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="newInsumo.EstadoInsumo"
              label="Estado Insumo"
              class="w-full sm:w-1/2"
              :options="['Activo', 'Inactivo']"
              :rules="EstadoInsumoRules"
              name="EstadoInsumo"
            />
            <VaSelect
              v-model="selectedMedida"
              label="Unidad Medida"
              class="w-full sm:w-1/2"
              :options="medidas.map((medida) => medida.IdMedida)"
              name="IdMedida"
            />
          </div>

          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="newInsumo.Agotado"
              label="Agotado"
              class="w-full sm:w-1/2"
              :options="['Sí', 'No']"
              :rules="AgotadoRules"
              name="Agotado"
            />

            <VaInput
              v-model="newInsumo.Iva"
              label="Iva"
              class="w-full sm:w-1/2"
              type="text"
              :rules="IvaRules"
              name="Iva"
            />
          </div>

          <!-- <div class="flex gap-4 flex-col sm:flex-row w-full">
          </div> -->
          <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
            <VaButton preset="secondary" color="secondary" @click="onClose">Cancelar</VaButton>
            <VaButton :disabled="!isValid" @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>

  <div v-if="showSuccessAlert" class="alert alert-success" role="alert">¡Insumo guardado exitosamente!</div>
</template>
