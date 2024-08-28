export interface Rol {
  length: number
  IdRol?: number
  Nombre: string
  Descripcion: string
  permisos?: Permiso[] // Ajusta el nombre del campo para que coincida con la respuesta de la API
}

export interface Permiso {
  IdPermiso: number
  Nombre: string
  Descripcion: string
  privilegios?: Privilegio[] // Ajusta el nombre del campo para que coincida con la respuesta de la API
}

export interface Privilegio {
  IdPrivilegio: number
  Nombre: string
  Descripcion: string
}
