<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vuestic-ui'
import { Cliente } from '../types'
import { addCliente } from '../../../data/pages/clientes'
import { useRouter } from 'vue-router'

const defaultCliente: Omit<Cliente, 'IdCliente' | 'IdUsuarioCliente'> = {
  Nombre: '',
  Apellidos: '',
  TipoDocumento: '',
  NumeroDocumento: '',
  CorreoElectronico: '',
  Contrasena: '',
  IdRol: 2,
  EstadoUsuario: 'Activo',
  FechaNacimiento: new Date().toISOString(),
  Direccion: '',
  Telefono: '',
  Usuario: {
    IdUsuario: 0,
    Nombre: '',
    Apellidos: '',
    CorreoElectronico: '',
    EstadoUsuario: '',
    TipoDocumento: '',
    NumeroDocumento: '',
    FechaNacimiento: '',
  },
}

//Reglas para la fecha de nacimiento
const dateRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La fecha de nacimiento es requerida',
  //La fecha de nacimiento no puede ser mayor a la fecha actual
  (v) => new Date(v ?? '') < new Date() || 'La fecha de nacimiento no puede ser mayor a la fecha actual',
  //La fecha de nacimiento no puede ser menor a 10 años
  (v) =>
    new Date().getFullYear() - new Date(v).getFullYear() >= 15 || 'La fecha de nacimiento no puede ser menor a 15 años',
]

//Reglas para el numero de telefono
const phoneRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'El número de teléfono es requerido',
  (v) => (v && v.length <= 10) || 'El número de teléfono no puede tener más de 10 caracteres',
  (v) => (v && v.length >= 7) || 'El número de teléfono no puede tener menos de 7 caracteres',
  (v) => (v && /^[0-9]*$/.test(v)) || 'El número de teléfono solo puede contener números',
]
const numeroDocumentoRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'El número de documento es requerido',
  (v) => {
    switch (newCliente.value.TipoDocumento) {
      case 'Cédula de Ciudadanía':
        return /^[0-9]{10}$/.test(v) || 'La cédula de ciudadanía debe tener 10 dígitos'
      case 'Cédula de Extranjeria':
        return /^[0-9]{6,11}$/.test(v) || 'La cédula de extranjería debe tener entre 6 y 11 dígitos'
      case 'Pasaporte':
        return /^[A-Za-z0-9]{1,9}$/.test(v) || 'El pasaporte debe tener entre 1 y 9 caracteres alfanuméricos'
      case 'Tarjeta de Identidad':
        return /^[0-9]{7,10}$/.test(v) || 'La tarjeta de identidad debe tener entre 7 y 10 dígitos'
      default:
        return 'Seleccione un tipo de documento válido'
    }
  },
]

// Función para que el botón cancelar nos devuelva solo a users
const close = () => {
  router.push('/clientes')
}

// Hacemos una función para validar que la contraseña y el confirmar contraseña sean iguales
const Contrasena = ref('')
// Función para validar que la contraseña y el confirmar contraseña sean iguales a medida que se escribe
const validatePassword = (v: string) => {
  return v === newCliente.value.Contrasena || 'Las contraseñas no coinciden'
}

// Reglas para la contraseña
const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La contraseña es requerida',
  (v) => (v && v.length >= 8) || 'La contraseña debe tener al menos 8 caracteres',
  (v) => (v && /[A-Za-z]/.test(v)) || 'La contraseña debe tener al menos una letra',
  (v) => (v && /\d/.test(v)) || 'La contraseña debe tener al menos un número',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'La contraseña debe tener al menos un caracter especial',
]

const newCliente = ref<Omit<Cliente, 'IdCliente' | 'IdClienteUsuario'>>({
  ...defaultCliente,
  IdCliente: 0, // Add the missing IdCliente property
} as Cliente)
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      const cliente = {
        ...newCliente.value,
      }
      await addCliente({ ...cliente, IdCliente: 0 })

      emit('save', cliente)
      router.push('/clientes')

      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el usuario:', error)
    }
  }
}

// Función para conocer si el correo electrónico ya existe

const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Cliente</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full"> </VaForm>
      <div class="self-stretch flex-col justify-start items-start gap-4 flex">
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="newCliente.Nombre"
            label="Nombre"
            placeholder="Nombre"
            class="w-full sm:w-1/2"
            :rules="[
              (v: any) => !!v || 'El nombre es requerido',
              (v: string | any[]) => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres',
              (v: string | any[]) => (v && v.length >= 3) || 'El nombre no puede tener menos de 3 caracteres',
              (v: string) => /^[a-zA-Z\s]*$/.test(v) || 'El nombre no puede contener números ni caracteres especiales',
            ]"
          />
          <VaInput
            v-model="newCliente.Apellidos"
            label="Apellidos"
            placeholder="Apellidos"
            class="w-full sm:w-1/2"
            :rules="[
              (v: any) => !!v || 'Los apellidos son requeridos',
              (v: string | any[]) => (v && v.length <= 50) || 'Los apellidos no pueden tener más de 50 caracteres',
              (v: string | any[]) => (v && v.length >= 3) || 'Los apellidos no pueden tener menos de 3 caracteres',
              (v: string) =>
                /^[a-zA-Z\s]*$/.test(v) || 'Los apellidos no pueden contener números ni caracteres especiales',
            ]"
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaSelect
            v-model="newCliente.TipoDocumento"
            label="Tipo de Documento"
            placeholder="Elija un tipo de documento"
            class="w-full sm:w-1/2"
            :options="['Cédula de Ciudadanía', 'Cédula de Extranjeria', 'Pasaporte', 'Tarjeta de Identidad']"
            :rules="[(v: any) => !!v || 'El tipo de documento es requerido']"
          />

          <VaInput
            v-model="newCliente.NumeroDocumento"
            label="Número de Documento"
            placeholder="Número de Documento"
            class="w-full sm:w-1/2"
            :rules="numeroDocumentoRules"
          />
        </div>
        <VaInput
          v-model="newCliente.CorreoElectronico"
          label="Correo Electrónico"
          placeholder="Correo Electrónico"
          class="w-full"
          :rules="[
            (v: any) => !!v || 'El correo electrónico es requerido',
            (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
          ]"
        />

        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="newCliente.Contrasena"
            label="Contraseña"
            placeholder="Contraseña"
            class="w-full sm:w-1/2"
            type="password"
            :rules="passwordRules"
          />
          <VaInput
            v-model="Contrasena"
            label="Confirmar Contraseña"
            placeholder="Confirmar Contraseña"
            class="w-full sm:w-1/2"
            type="password"
            :rules="[(v: any) => !!v || 'La confirmación de la contraseña es requerida', validatePassword]"
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="newCliente.Direccion"
            label="Direcciòn"
            placeholder="Direcciòn"
            type="text"
            class="w-full"
          />

          <VaInput
            v-model="newCliente.Telefono"
            label="Télefono"
            placeholder="Telefono"
            type="text"
            class="w-full"
            :rules="phoneRules"
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="newCliente.FechaNacimiento"
            label="Fecha de Nacimiento"
            placeholder="Fecha de Nacimiento"
            type="date"
            class="w-full"
            :rules="dateRules"
          />
        </div>
        <div class="flex justify-end gap-4 w-full">
          <VaButton preset="secondary" color="secondary" @click="close">Cancelar</VaButton>
          <VaButton @click="onSave">Guardar</VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>
