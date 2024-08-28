<template>
  <h2 class="text-xl font-semibold mb-4">Agregar Rol</h2>
  <VaCard>
    <VaCardContent>
      <div class="flex flex-col gap-4 flex-col sm:flex-row w-full">
        <VaInput v-model="role.nombre" label="Nombre" placeholder="Ingresa el nombre del rol" class="w-full" />
        <VaInput
          v-model="role.descripcion"
          label="Descripción"
          placeholder="Ingresa la descripción del rol"
          class="w-full"
        />
      </div>
      <div class="table-container">
        <table class="table-auto w-full">
          <thead class="bg-gray-200">
            <tr>
              <th class="px-4 py-2 text-center">Módulo</th>
              <th v-for="permiso in permisos" :key="permiso" class="px-4 py-2 text-center">{{ permiso }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="modulo in role.modulos" :key="modulo.nombre">
              <td class="border px-4 py-2 text-center">{{ modulo.nombre }}</td>
              <td v-for="permiso in permisos" :key="permiso" class="border px-4 py-2 text-center">
                <div class="flex items-center justify-center">
                  <input
                    :id="modulo.nombre + '-' + permiso"
                    v-model="modulo.permisosSeleccionados"
                    type="checkbox"
                    :value="permiso"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-end space-x-4 mt-4">
        <VaButton preset="secondary" color="secondary" @click="cancelar">Cancelar</VaButton>
        <VaButton @click="guardar">Guardar</VaButton>
      </div>
    </VaCardContent>
  </VaCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VaCard, VaCardContent, VaInput, VaButton } from 'vuestic-ui'
import { ObtenerRolPorId, updateRol } from '../../../data/pages/roles'
import { useRouter, useRoute } from 'vue-router'

// Usamos el router
const router = useRouter()
const route = useRoute()

// Mapeo de los nombres de los módulos a sus respectivos IDs
const modulosMap = {
  Clientes: 1,
  Color: 16,
  Compras: 7,
  'Estampados-Vista-Administrador': 11,
  'Estampados-Vista-Cliente': 12,
  'Ficha Tecnica': 15,
  Insumos: 3,
  'Orden Producción': 19, // Agrega el ID correcto aquí
  Parametrización: 8,
  Pedidos: 4,
  'Productos-Vista-Administrador': 13,
  'Productos-Vista-Cliente': 14,
  Proveedores: 18,
  Roles: 20, // Agrega el ID correcto aquí
  'Ubicaciones-Vista-Administrador': 9,
  'Ubicaciones-Vista-Cliente': 10,
  Usuarios: 21, // Agrega el ID correcto aquí
  'Ventas-Vista-Administrador': 2,
  'Ventas-Vista-Cliente': 1,
}

const permisos = ['Crear', 'Ver', 'Editar', 'Eliminar']

const role = ref({
  nombre: '',
  descripcion: '',
  modulos: [
    { nombre: 'Clientes', permisosSeleccionados: [] },
    { nombre: 'Color', permisosSeleccionados: [] },
    { nombre: 'Compras', permisosSeleccionados: [] },
    { nombre: 'Estampados-Vista-Administrador', permisosSeleccionados: [] },
    { nombre: 'Estampados-Vista-Cliente', permisosSeleccionados: [] },
    { nombre: 'Ficha Tecnica', permisosSeleccionados: [] },
    { nombre: 'Insumos', permisosSeleccionados: [] },
    { nombre: 'Orden Producción', permisosSeleccionados: [] },
    { nombre: 'Parametrización', permisosSeleccionados: [] },
    { nombre: 'Pedidos', permisosSeleccionados: [] },
    { nombre: 'Productos-Vista-Administrador', permisosSeleccionados: [] },
    { nombre: 'Productos-Vista-Cliente', permisosSeleccionados: [] },
    { nombre: 'Proveedores', permisosSeleccionados: [] },
    { nombre: 'Roles', permisosSeleccionados: [] },
    { nombre: 'Ubicaciones-Vista-Administrador', permisosSeleccionados: [] },
    { nombre: 'Ubicaciones-Vista-Cliente', permisosSeleccionados: [] },
    { nombre: 'Usuarios', permisosSeleccionados: [] },
    { nombre: 'Ventas-Vista-Administrador', permisosSeleccionados: [] },
    { nombre: 'Ventas-Vista-Cliente', permisosSeleccionados: [] },
  ],
})

const cancelar = () => {
  // Lógica para cancelar la acción
  router.push('/roles')
}

onMounted(async () => {
  // Lógica para cargar los datos del rol a editar
  const id = route.query.id as string
  // Imprimimos en consola el id del rol a editar
  const data = await ObtenerRolPorId(parseInt(id))
  if (data !== undefined) {
    // Traemos el nombre del rol y la descripción
    const Nombre = data[0].Rol.Nombre
    const Descripcion = data[0].Rol.Descripcion

    //ASIGNAMOS LOS VALORES A LOS CAMPOS DE TEXTO
    role.value.nombre = Nombre
    role.value.descripcion = Descripcion
  }

  console.log('Rol a editar:', id)
})
const guardar = async () => {
  // Imprimimos en consola el rol a guardar
  console.log('Rol a guardar:', role.value)

  // Crear el objeto en el formato requerido
  const roleData = {
    Nombre: role.value.nombre,
    Descripcion: role.value.descripcion,
    Privilegios: role.value.modulos
      .map((modulo) => {
        return {
          IdPrivilegio: modulosMap[modulo.nombre] || null,
          Permisos: modulo.permisosSeleccionados.map((permisoSeleccionado) => {
            return {
              IdPermiso: permisos.indexOf(permisoSeleccionado) + 1, // Mapeo del índice de permiso + 1 como IdPrivilegio
            }
          }),
        }
      })
      .filter((privilegio) => privilegio.IdPrivilegio !== null && privilegio.Permisos.length > 0), // Filtra los permisos sin IdPermiso o sin privilegios
  }

  // Imprimimos en consola los datos del rol formateados
  console.log('Datos del rol formateados:', roleData)

  // Imprimimos en consola los datos del rol formateados
  console.log('Datos del rol formateados:', roleData)
  //Traemos el id del rol a editar
  const id = route.query.id as string

  await updateRol(parseInt(id), roleData)
  // Redirigimos a la vista de roles
  router.push('/roles')
}
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
}

.table-auto {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #e5e7eb;
}
</style>
