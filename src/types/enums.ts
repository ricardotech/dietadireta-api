export enum Objetivo {
  EMAGRECER = 'emagrecer',
  EMAGRECER_MASSA = 'emagrecer+massa',
  GANHAR_MASSA_MUSCULAR = 'ganhar massa muscular',
  DEFINICAO_MUSCULAR_GANHAR = 'definicao muscular + ganhar massa',
}

export enum CaloriasDiarias {
  DESCONHECIDO = 0,
  CAL_1200 = 1200,
  CAL_1500 = 1500,
  CAL_1800 = 1800,
  CAL_2000 = 2000,
  CAL_2200 = 2200,
  CAL_2500 = 2500,
  CAL_2800 = 2800,
  CAL_3000 = 3000,
}

export enum HorariosRefeicoesOption {
  PERSONALIZADO = 'personalizado',
  H0530 = '05:30-08:30-12:00-15:00-19:00',
  H0600 = '06:00-09:00-12:00-15:00-19:00',
  H0630 = '06:30-09:30-13:00-16:00-20:00',
  H0700 = '07:00-10:00-12:30-15:30-19:30',
  H0730 = '07:30-10:30-12:00-15:00-19:00',
  H0800 = '08:00-11:00-13:30-16:30-20:30',
  H0900 = '09:00-11:00-13:00-16:00-21:00',
}

export enum Genero {
  MASCULINO = 'm',
  FEMININO = 'f',
}

export enum NivelAtividade {
  SEDENTARIO = 'sedentario',
  LEVE = 'leve',
  MODERADO = 'moderado',
  INTENSO = 'intenso',
  MUITO_INTENSO = 'muito_intenso',
}

export enum TipoPlanoTreino {
  ACADEMIA = 'academia',
  CASA = 'casa',
  NENHUM = 'nenhum',
}