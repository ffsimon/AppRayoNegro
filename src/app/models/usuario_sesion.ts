// Esta info es la que se guardará en la sesión del usuario; estos datos NO son confiables; pueden cambiar en cualquier momento; 

import { Time } from "@angular/common";

// si se desea saber el valor actual de una propiedad del usuario se tiene que consultar desde la BD.
export class usuario_sesion_model {
  auth_token: string;
  user_activo: number
  user_ca_clave_so: number;
  user_fecha_registro: string;
  user_fecha_sesion: string;
  user_id: number;
  user_sesion_Calle: string;
  user_sesion_Numero: number;
  user_sesion_activa: number;
  user_sesion_amaterno: string;
  user_sesion_apaterno: string;
  user_sesion_colonia: string;
  user_sesion_cp: string;
  user_sesion_foto: string
  user_sesion_municipio_alcadia: string
  user_sesion_nombre: string;
  user_sesion_telefono: string;
  user_tipo_usuario_clave: number;
  user_token_notificacion: string;
  user_usuario: string;
  user_version_app: number;
}

export class user_pass_model {
    user: string
    password: string
}

export class user_jwt_token_model {
    usuario: string;
    contrasenia: string;
}

export class informacion_usuario_model_response {
  informacion_id?: number;
  informacion_nombre?: string;
  informacion_apellidopaterno?: string;
  informacion_apellidomaterno?: string;
  informacion_peso?: number;
  informacion_estatura?: number;
  informacion_edad?: string;
  informacion_usuario_id?: number;
  informacion_sexo_id?: number;
  informacion_transporte_id?: number;
  informacion_usuario_padre?: number;
  informacion_codigo_telefono_pais?: string;
  informacion_telefono?: string;
  informacion_estatus_usuario_id?: number;
  informacion_ubicacion?: string;
  informacion_activo?: boolean;
  informacion_usuario?: string;
  informacion_sexo?: string;
  informacion_transporte?: string;
  informacion_estatus?: string;
  informacion_covid?: boolean;
  informacion_valoracion_completa?: boolean;
  informacion_num_familiares?: number;
  informacion_p_terminos?: boolean;
  informacion_codigo_postal?: string;
  informacion_correo_electronico?: string;
  informacion_tbl_factor_id?: number;
  informacion_embarazo?: number;
  informacion_codigo_recuperar_cuenta?: string;
  informacion_codigo_recuperar_cuenta_fecha?: Date;
  informacion_alerta_creacion?: boolean;
  informacion_tiempo_lecturas_id?: number;
  informacion_parentesco_id?: number;
  informacion_parentesco?: string;
  informacion_parentesco_en?: string;
  informacion_sistema_medicion_clave?: number;
  hora_inicio_sueno?: Time;
  hora_fin_sueno?: Time;
}

export class informacion_usuario_model_request {
  public informacion_activo?: boolean;
  public informacion_apellidomaterno?: string;
  public informacion_apellidopaterno?: string;
  public informacion_aun_con_sintomas?: boolean;
  public informacion_codigo_postal?: number;
  public informacion_codigo_telefono_pais?: string;
  public informacion_correo_electronico?: string;
  public informacion_covid?: boolean;
  public informacion_edad?: Date;
  public informacion_embarazo?: number;
  public informacion_estatura?: number;
  public informacion_estatus_usuario_id?: number;
  public informacion_fecha_fin_sintomas?: string;
  public informacion_fecha_inicio_sintomas?: string;
  public informacion_id?: number;
  public informacion_nombre?: string;
  public informacion_num_familiares?: number;
  public informacion_p_terminos?: boolean;
  public informacion_parentesco_id?: number;
  public informacion_peso?: number;
  public informacion_sexo_id?: number;
  public informacion_sistema_medicion_clave?: number;
  public informacion_tbl_factor_id?: number;
  public informacion_telefono?: string;
  public informacion_tipo_estatura?: number;
  public informacion_tipo_peso?: number;
  public informacion_transporte_id?: number;
  public informacion_ubicacion?: string;
  public informacion_usuario?: string;
  public informacion_usuario_id?: number;
  public informacion_usuario_padre?: number;
  public informacion_valoracion_completa?: boolean;
  public nombre_usuario?: string;
  public usuario_contrasenia?: string;
  public informacion_tbl_instancia_id?: number;
  public alias?: string;
  public ocupacion_id?: number;
  public ca_tiempo_lecturas_id_personal?: number;
  public informacion_usuario_hora_inicio_suenio?: Time;
  public informacion_usuario_hora_fin_suenio?: Time;
}