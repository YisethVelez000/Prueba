<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Regístrate</h1>
    <p class="text-base mb-4 leading-5">
      ¿Ya tienes una cuenta?
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary"> Iniciar Sesion </RouterLink>
    </p>
    <div class="flex gap-4 flex-col sm:flex-row w-full">
      <VaSelect
        v-model="formData.TipoDocumento"
        :rules="[(v: any) => !!v || 'El tipo de documento es requerido']"
        class="w-full sm:w-1/2"
        label="Tipo de Documento"
        :options="['Cédula de Ciudadanía', 'Cédula de Extranjeria', 'Pasaporte', 'Tarjeta de Identidad']"
      />
      <VaInput
        v-model="formData.NumeroDocumento"
        :rules="numeroDocumentoRules"
        class="w-full sm:w-1/2"
        label="Número de Documento"
        type="text"
      />
    </div>
    <div class="flex gap-4 flex-col sm:flex-row w-full">
      <VaInput
        v-model="formData.Nombre"
        :rules="[(v: any) => !!v || 'El nombre es requerido']"
        class="w-full sm:w-1/2"
        label="Nombre Completo"
        type="text"
      />
      <VaInput
        v-model="formData.Apellidos"
        :rules="[(v: any) => !!v || 'El apellido es requerido']"
        class="w-full sm:w-1/2"
        label="Apellido Completo"
        type="text"
      />
    </div>

    <VaInput
      v-model="formData.CorreoElectronico"
      :rules="[
        (v: any) => !!v || 'El campo correo electronico es requerido',
        (v: string) => /.+@.+\..+/.test(v) || 'El correo electronico no es valido',
      ]"
      class="mb-4"
      label="Correo Electronico"
      type="email"
    />
    <div class="flex gap-4 flex-col sm:flex-row w-full">
      <VaInput v-model="formData.Direccion" label="Direcciòn" type="text" class="w-full" />

      <VaInput v-model="formData.Telefono" label="Télefono" type="text" class="w-full" :rules="phoneRules" />
    </div>
    <div class="flex gap-4 flex-col sm:flex-row w-full">
      <VaInput
        v-model="formData.FechaNacimiento"
        label="Fecha de Nacimiento"
        type="date"
        class="w-full"
        :rules="dateRules"
      />
    </div>
    <div class="flex gap-4 flex-col sm:flex-row w-full">
      <VaValue v-slot="isPasswordVisible" :default-value="false">
        <VaInput
          ref="password1"
          v-model="formData.Contrasena"
          :rules="passwordRules"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="w full sm:w-1/2 mb-4"
          label="Contraseña"
          messages="La contraseña debe tener al menos 8 caracteres, una letra, un número y un caracter especial"
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
            />
          </template>
        </VaInput>
        <VaInput
          ref="password2"
          v-model="repeatContrasena"
          :rules="[
            (v: any) => !!v || 'Confirmar contraseña es requerido',
            (v: string) => v === formData.Contrasena || 'Las contraseñas no coinciden',
          ]"
          :type="isPasswordVisible.value ? 'text' : 'password'"
          class="w full sm:w-1/2 mb-4"
          label="Confirmar contraseña"
          @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
            />
          </template>
        </VaInput>
      </VaValue>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> Crear cuenta</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const formData = reactive({
  Nombre: '',
  TipoDocumento: '',
  NumeroDocumento: '',
  Apellidos: '',
  CorreoElectronico: '',
  Contrasena: '',
  Direccion: '',
  Telefono: '',
  FechaNacimiento: '',
})

const submit = () => {
  //link del api http://localhost:8000/usuarios/register
  if (validate()) {
    console.log(formData)
    fetch('https://apinodedvp.onrender.com/clientes/crearCliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nombre: formData.Nombre,
        Apellidos: formData.Apellidos,
        TipoDocumento: formData.TipoDocumento,
        NumeroDocumento: formData.NumeroDocumento,
        CorreoElectronico: formData.CorreoElectronico,
        Contrasena: formData.Contrasena,
        IdRol: 2,
        Direccion: formData.Direccion,
        Telefono: formData.Telefono,
        FechaNacimiento: formData.FechaNacimiento,
        EstadoUsuario: 'Activo',
      }),
    })
      .then((response) => {
        if (response.ok) {
          init({
            title: 'Cuenta creada',
            message: 'Tu cuenta ha sido creada exitosamente',
            color: 'success',
          })
          push({ name: 'login' })
        } else {
          init({
            title: 'Error',
            message: 'Ha ocurrido un error al crear tu cuenta',
            color: 'error',
          })
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        init({
          title: 'Error',
          message: 'Ha ocurrido un error al crear tu cuenta',
          color: 'error',
        })
      })
  }
}

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La contraseña es requerida',
  (v) => (v && v.length >= 8) || 'La contraseña debe tener al menos 8 caracteres',
  (v) => (v && /[A-Za-z]/.test(v)) || 'La contraseña debe tener al menos una letra',
  (v) => (v && /\d/.test(v)) || 'La contraseña debe tener al menos un número',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'La contraseña debe tener al menos un caracter especial',
]
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
    switch (formData.TipoDocumento) {
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
</script>
