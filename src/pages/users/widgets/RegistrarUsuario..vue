<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm } from 'vuestic-ui'
import { Usuario } from '../types'
import { addUser } from '../../../data/pages/users'
import { useRouter } from 'vue-router'

const defaultNuevoUsuario: Omit<Usuario, 'IdUsuario'> = {
  Nombre: '',
  Apellidos: '',
  TipoDocumento: '',
  NumeroDocumento: '',
  CorreoElectronico: '',
  Contrasena: '',
  IdRol: 0,
  EstadoUsuario: 'Activo',
  FechaNacimiento: new Date().toISOString(),
  FechaFinalizacion: new Date().toISOString(),
  FechaInicio: new Date().toISOString(),
}

//Reglas para el numero de documento segun el tipo de documento (Cédula de Ciudadanía, Cédula de Extranjeria, Pasaporte, Tarjeta de Identidad)

//Reglas para la fecha de nacimiento
const dateRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La fecha de nacimiento es requerida',
  //La fecha de nacimiento no puede ser mayor a la fecha actual
  (v) => new Date(v ?? '') < new Date() || 'La fecha de nacimiento no puede ser mayor a la fecha actual',
  //La fecha de nacimiento no puede ser menor a 10 años
  (v) =>
    new Date().getFullYear() - new Date(v).getFullYear() >= 10 || 'La fecha de nacimiento no puede ser menor a 10 años',
]

//Reglas para la fecha de inicio
const dateRulesFechaInicio: ((v: string) => boolean | string)[] = [
  //La fecha de inicio no puede ser mayor a la fecha actual
  (v) => new Date(v) < new Date() || 'La fecha de inicio no puede ser mayor a la fecha actual',
]

//Reglas para la fecha de finalización
const dateRulesFechaFinalizacion: ((v: string) => boolean | string)[] = [
  //La fecha de finalización no puede ser menor a la fecha de inicio
  (v) =>
    new Date(v ?? '') > new Date(defaultNuevoUsuario.FechaInicio ?? '') ||
    'La fecha de finalización no puede ser menor a la fecha de inicio',
]

// Función para que el botón cancelar nos devuelva solo a users
const close = () => {
  router.push('/users')
}

// Hacemos una función para validar que la contraseña y el confirmar contraseña sean iguales
const Contrasena = ref('')
// Función para validar que la contraseña y el confirmar contraseña sean iguales a medida que se escribe
const validatePassword = (v: string) => {
  return v === newUsuario.value.Contrasena || 'Las contraseñas no coinciden'
}

// Reglas para la contraseña
const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La contraseña es requerida',
  (v) => (v && v.length >= 8) || 'La contraseña debe tener al menos 8 caracteres',
  (v) => (v && /[A-Za-z]/.test(v)) || 'La contraseña debe tener al menos una letra',
  (v) => (v && /\d/.test(v)) || 'La contraseña debe tener al menos un número',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'La contraseña debe tener al menos un caracter especial',
]

const newUsuario = ref<Omit<Usuario, 'IdUsuario'>>({
  ...defaultNuevoUsuario,
})
const form = useForm('add-user-form')
const router = useRouter()

const emit = defineEmits(['close', 'save'])

const showSuccessAlert = ref(false)

const onSave = async () => {
  if (form.validate()) {
    try {
      const usuario = {
        ...newUsuario.value,
      }

      console.log(usuario)
      await addUser(usuario)
      emit('save', usuario)
      router.push('/users')

      showSuccessAlert.value = true
      hideAlert()
    } catch (error) {
      console.error('Error al guardar el usuario:', error)
    }
  }
}

// Función para conocer si el correo electrónico ya existe
const validateEmail = async () => {
  const response = await fetch('https://apinodedvp.onrender.com/usuarios/validateEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      CorreoElectronico: newUsuario.value.CorreoElectronico,
    }),
  })
  if (response.status === 200) {
    return true
  } else {
    return false
  }
}
const numeroDocumentoRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'El número de documento es requerido',
  (v) => {
    switch (
      newUsuario.value.TipoDocumento //Validaciones de acuerdo al tipo de documento
    ) {
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
const hideAlert = () => {
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}
const roles = ref<{ IdRol: number; Nombre: string }[]>([])

const fetchRoles = async () => {
  try {
    const response = await fetch('https://apinodedvp.onrender.com/roles')
    if (response.ok) {
      roles.value = await response.json()
    } else {
      console.error('Error al obtener los roles')
    }
  } catch (error) {
    console.error('Error al obtener los roles:', error)
  }
}

onMounted(async () => {
  fetchRoles()
})
</script>

<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Usuario</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
        <div class="self-stretch flex-col justify-start items-start gap-4 flex">
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUsuario.Nombre"
              label="Nombre"
              placeholder="Nombre"
              class="w-full sm:w-1/2"
              :rules="[
                (v: any) => !!v || 'El nombre es requerido',
                (v: string | any[]) => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres',
                (v: string | any[]) => (v && v.length >= 3) || 'El nombre no puede tener menos de 3 caracteres',
                (v: string) =>
                  /^[a-zA-Z\s]*$/.test(v) || 'El nombre no puede contener números ni caracteres especiales',
                //Validaciones de no aceptar espacios en blancos al inicio y al final
                (v: string) =>
                  /^[^\s]+(\s+[^\s]+)*$/.test(v) || 'El nombre no puede tener espacios en blanco al inicio ni al final',
                (v: any) => v.trim().length > 0 || 'El nombre no puede contener solo espacios en blanco',
              ]"
            />
            <VaInput
              v-model="newUsuario.Apellidos"
              label="Apellidos"
              placeholder="Apellidos"
              class="w-full sm:w-1/2"
              :rules="[
                (v: any) => !!v || 'Los apellidos son requeridos',
                (v: string | any[]) => (v && v.length <= 50) || 'Los apellidos no pueden tener más de 50 caracteres',
                (v: string | any[]) => (v && v.length >= 3) || 'Los apellidos no pueden tener menos de 3 caracteres',
                (v: string) =>
                  /^[a-zA-Z\s]*$/.test(v) || 'Los apellidos no pueden contener números ni caracteres especiales',
                //Validaciones de no aceptar espacios en blancos al inicio y al final
                (v: string) =>
                  /^[^\s]+(\s+[^\s]+)*$/.test(v) ||
                  'Los apellidos no pueden tener espacios en blanco al inicio ni al final',
              ]"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaSelect
              v-model="newUsuario.TipoDocumento"
              label="Tipo de Documento"
              placeholder="Elija un tipo de documento"
              class="w-full sm:w-1/2"
              :options="['Cédula de Ciudadanía', 'Cédula de Extranjeria', 'Pasaporte', 'Tarjeta de Identidad']"
              :rules="[(v: any) => !!v || 'El tipo de documento es requerido']"
            />

            <VaInput
              v-model="newUsuario.NumeroDocumento"
              label="Número de Documento"
              placeholder="Número de Documento"
              class="w-full sm:w-1/2"
              :rules="numeroDocumentoRules"
            />
          </div>
          <VaInput
            v-model="newUsuario.CorreoElectronico"
            label="Correo Electrónico"
            placeholder="Correo Electrónico"
            class="w-full"
            :rules="[
              (v: any) => !!v || 'El correo electrónico es requerido',
              (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
              async (v: any) => {
                if (v) {
                  const emailExists = await validateEmail()
                  return emailExists || 'El correo electrónico ya está registrado'
                }
              },
            ]"
          />

          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUsuario.Contrasena"
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
            <div class="form-group">
              <label for="rol" class="form-label">ROL</label>
              <select id="rol" v-model="newUsuario.IdRol" class="form-control va-select va-input">
                <option value="" disabled>Seleccione un rol</option>
                <option v-for="rol in roles" :key="rol.IdRol" :value="rol.IdRol">
                  {{ rol.Nombre }}
                </option>
              </select>
            </div>
            <div></div>
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUsuario.FechaNacimiento"
              label="Fecha de Nacimiento"
              placeholder="Fecha de Nacimiento"
              type="date"
              class="w-full"
              :rules="dateRules"
            />
          </div>
          <div class="flex gap-4 flex-col sm:flex-row w-full">
            <VaInput
              v-model="newUsuario.FechaInicio"
              label="Fecha de Inicio"
              placeholder="Fecha de Inicio"
              type="date"
              class="w-full sm:w-1/2"
              :rules="dateRulesFechaInicio"
            />
            <VaInput
              v-model="newUsuario.FechaFinalizacion"
              label="Fecha de Finalización"
              placeholder="Fecha de Finalización"
              type="date"
              class="w-full sm:w-1/2"
              :rules="dateRulesFechaFinalizacion"
            />
          </div>

          <div class="flex justify-end gap-4 w-full">
            <VaButton preset="secondary" color="secondary" @click="close">Cancelar</VaButton>
            <VaButton @click="onSave">Guardar</VaButton>
          </div>
        </div>
      </VaForm>
    </VaCardContent>
  </VaCard>
</template>
<style>
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  color: #154ec1; /* Azul */
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.4px;
  min-height: 14px;
  font-weight: bold;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #2563eb;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

.va-select.va-input {
  background-color: #f9fafb;
  border-radius: 8px;
}
</style>
