export enum Capitalizacion{
    ANUAL = 'ANUAL',
    SEMESTRAL = 'SEMESTRAL',
    CUATRIMESTRAL = 'CUATRIMESTRAL',
    TRIMESTRAL = 'TRIMESTRAL',
    BIMESTRAL = 'BIMESTRAL',
    MENSUAL = 'MENSUAL',
    QUINCENAL = 'QUINCENAL',
    SEMANAL = 'SEMANAL',
    DIARIA = 'DIARIA'
}

export const CapitalizacionValues = {
    ANUAL: 360,
    SEMESTRAL: 180,
    CUATRIMESTRAL: 120,
    TRIMESTRAL: 90,
    BIMESTRAL: 60,
    MENSUAL: 30,
    QUINCENAL: 15,
    SEMANAL: 7,
    DIARIA: 1
};

export function getDiasCapitalizacion(frecuencia: Capitalizacion): number {
    return CapitalizacionValues[frecuencia] || 30; // Default to MENSUAL if not found
}