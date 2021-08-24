export class objetivos_usuario {
    horas: number;
    num_evaluaciones: number;
    list_objetivos?: Array<objetivos>;
    informacion_graficas?:  Array<graficas>;
  }

export class objetivos{
    dia: number;
    semana: number;
    tipo_objetivo: number;
}

export class graficas{
    dia: string;
		evaluaciones: number;
}