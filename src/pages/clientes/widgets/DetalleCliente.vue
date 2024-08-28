<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Cliente } from '../types' // Asegúrate de que la interfaz Cliente esté definida en types
import { ObtenerClientePorId } from '../../../data/pages/clientes'

// Usamos el router
const router = useRouter()
const route = useRoute()

const cliente = ref<Cliente>({
  IdCliente: 0,
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
    EstadoUsuario: 'Activo',
    TipoDocumento: '',
    NumeroDocumento: '',
    FechaNacimiento: '',
  },
  IdUsuarioCliente: 0,
})

// Reglas para la fecha de nacimiento
const dateRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'La fecha de nacimiento es requerida',
  (v) => new Date(v ?? '') < new Date() || 'La fecha de nacimiento no puede ser mayor a la fecha actual',
  (v) =>
    new Date().getFullYear() - new Date(v).getFullYear() >= 10 || 'La fecha de nacimiento no puede ser menor a 10 años',
]

// Reglas para el número de teléfono
const phoneRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'El número de teléfono es requerido',
  (v) => (v && v.length <= 10) || 'El número de teléfono no puede tener más de 10 caracteres',
  (v) => (v && v.length >= 7) || 'El número de teléfono no puede tener menos de 7 caracteres',
  (v) => (v && /^[0-9]*$/.test(v)) || 'El número de teléfono solo puede contener números',
]

onMounted(async () => {
  const Id = route.query.id
  let IdCliente = Id?.toString()

  if (Array.isArray(IdCliente)) {
    IdCliente = IdCliente[0]
  }

  if (IdCliente) {
    try {
      const ClienteData = await ObtenerClientePorId(IdCliente)
      console.log('Datos del cliente obtenidos:', ClienteData)

      cliente.value = {
        IdCliente: ClienteData.IdCliente,
        Nombre: '',
        Apellidos: '',
        TipoDocumento: '',
        NumeroDocumento: '',
        CorreoElectronico: '',
        Contrasena: '',
        IdRol: 2,
        EstadoUsuario: ClienteData.EstadoUsuario ?? '',
        FechaNacimiento: new Date().toISOString(),
        Direccion: ClienteData.Direccion ?? '',
        Telefono: ClienteData.Telefono ?? '',
        Usuario: {
          IdUsuario: ClienteData.Usuario?.IdUsuario ?? 0,
          Nombre: ClienteData.Usuario?.Nombre ?? '',
          Apellidos: ClienteData.Usuario?.Apellidos ?? '',
          CorreoElectronico: ClienteData.Usuario?.CorreoElectronico ?? '',
          EstadoUsuario: ClienteData.Usuario?.EstadoUsuario ?? 'Activo',
          TipoDocumento: ClienteData.Usuario?.TipoDocumento ?? '',
          NumeroDocumento: ClienteData.Usuario?.NumeroDocumento ?? '',
          FechaNacimiento: ClienteData.Usuario?.FechaNacimiento ?? new Date().toISOString(),
        },
        IdUsuarioCliente: ClienteData.IdUsuarioCliente ?? 0,
      }
      console.log('Cliente:', cliente.value.Direccion)
    } catch (error) {
      console.error('Error al obtener el cliente', error)
    }
  }
})

const close = () => {
  router.push('/clientes')
}
</script>
<template>
  <h2 class="text-xl font-semibold mb-4">Detalle Cliente</h2>
  <VaCard>
    <VaCardContent>
      <VaForm ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full"> </VaForm>
      <div class="self-stretch flex-col justify-start items-start gap-4 flex">
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="cliente.Usuario.Nombre"
            label="Nombre"
            placeholder="Nombre"
            class="w-full sm:w-1/2"
            :rules="[
              (v: any) => !!v || 'El nombre es requerido',
              (v: string | any[]) => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres',
              (v: string | any[]) => (v && v.length >= 3) || 'El nombre no puede tener menos de 3 caracteres',
              (v: string) => /^[a-zA-Z\s]*$/.test(v) || 'El nombre no puede contener números ni caracteres especiales',
            ]"
            readonly
          />
          <VaInput
            v-model="cliente.Usuario.Apellidos"
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
            readonly
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaSelect
            v-model="cliente.Usuario.TipoDocumento"
            label="Tipo de Documento"
            placeholder="Elija un tipo de documento"
            class="w-full sm:w-1/2"
            :options="['Cédula de Ciudadanía', 'Cédula de Extranjeria', 'Pasaporte', 'Tarjeta de Identidad']"
            :rules="[(v: any) => !!v || 'El tipo de documento es requerido']"
            readonly
          />
          <VaInput
            v-model="cliente.Usuario.NumeroDocumento"
            label="Número de Documento"
            placeholder="Número de Documento"
            class="w-full sm:w-1/2"
            :rules="[
              (v: any) => !!v || 'El número de documento es requerido',
              (v: string | any[]) =>
                (v && v.length <= 50) || 'El número de documento no puede tener más de 50 caracteres',
              (v: string | any[]) =>
                (v && v.length >= 3) || 'El número de documento no puede tener menos de 3 caracteres',
              (v: string) => /^[0-9]*$/.test(v) || 'El número de documento solo puede contener números',
            ]"
            readonly
          />
        </div>
        <VaInput
          v-model="cliente.Usuario.CorreoElectronico"
          label="Correo Electrónico"
          placeholder="Correo Electrónico"
          class="w-full"
          :rules="[
            (v: any) => !!v || 'El correo electrónico es requerido',
            (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido',
          ]"
          readonly
        />
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="cliente.Direccion"
            label="Dirección"
            placeholder="Dirección"
            type="text"
            class="w-full"
            readonly
          />
          <VaInput
            v-model="cliente.Telefono"
            label="Teléfono"
            placeholder="Teléfono"
            type="text"
            class="w-full"
            :rules="phoneRules"
            readonly
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaInput
            v-model="cliente.Usuario.FechaNacimiento"
            label="Fecha de Nacimiento"
            placeholder="Fecha de Nacimiento"
            type="date"
            class="w-full"
            :rules="dateRules"
            readonly
          />
        </div>
        <div class="flex gap-4 flex-col sm:flex-row w-full">
          <VaSelect
            v-model="cliente.Usuario.EstadoUsuario"
            label="Estado"
            placeholder="Elija un estado"
            class="w-full"
            :options="['Activo', 'Inactivo']"
            :rules="[(v: any) => !!v || 'El rol es requerido']"
            readonly
          />
        </div>
        <div class="flex justify-end gap-4 w-full">
          <VaButton preset="secondary" color="secondary" @click="close">Cancelar</VaButton>
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>
