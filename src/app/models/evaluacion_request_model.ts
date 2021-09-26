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
  ecompentencia_evaluacion_id?: number;
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

export class Eficiencia_Evaluadores{
  numero_evaluadores: number;
  numero_evaluaciones: number;
  evaluaciones_aprovadas: number;
  evaluaciones_rechazadas: number;
  eficacia_evaluaciones: number;
  objetivos_visa: number;
}


export class Competencia_Evaluaciones{
  nombre_tipo_catalogo: string;
  lista_tipo_catalogo: Array<grafica_radio>;
}

export class grafica_radio{
  nombre_tipo: string;
  porcenaje: number;
  color: string;
}

// export class Comparativas_Generales{
//   comparativas: Array<Comparativas>
// }

export class Comparativas{
  objetivo_visa: number;
  objetivo_rayo_negro: number;
  evaluaciones_reales: number;
  numero_evaluadores: number;
  objetivo_visa_anterior: number;
  objetivo_rayo_negro_anterio: number;
  evaluaciones_reales_anterior: number;
  numero_evaluadores_anterior: number;
  objetivo_a_la_baja: boolean;
}