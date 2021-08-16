/* eslint-disable @typescript-eslint/naming-convention */
export class Fotografias {
  efotografia_catalogo_id_evidencia?: number;
  imagBase64?: string;
}

export class Competencias {
  ecompentencia_comentario?: string;
  ecompentencia_catalogo_competencia?: number;
  ecompentencia_catalogo_competencia_material?: number;
  ecompentencia_foto?: string;
}

export class EvaluacionesRequest {
  evaluacion_nombre_establecimiento?: string;
  evaluacion_razon_social?: string;
  evaluacion_ca_tipo_comercio?: number;
  evaluacion_ca_tipo_sub_comercio?: number;
  evaluacion_outlet?: number;
  evaluacion_nombre_outlet?: string;
  evaluacion_numero?: string;
  evaluacion_calle?: string;
  evaluacion_colonia?: string;
  evaluacion_municipio_alcadia?: string;
  evaluacion_cp?: string;
  evaluacion_latitud?: string;
  evaluacion_longitud?: string;
  evaluacion_renovacion?: number;
  evaluacion_ca_id_comunicacion?: number;
  evaluacion_localizacion_id?: number;
  list_fotografias?: Array<Fotografias>;
  lista_competencias?: Array<Competencias>;
  evaluacion_tbl_usuarios_id?: number;
}
