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
    ANUAL: 12,
    SEMESTRAL: 6,
    CUATRIMESTRAL: 4,
    TRIMESTRAL: 3,
    BIMESTRAL: 2,
    MENSUAL: 1,
    QUINCENAL: 0.5,   // 15 días ≈ 0.5 meses
    SEMANAL: 0.25,    // 7 días ≈ 0.25 meses
    DIARIA: 0.0333333 // 1 día ≈ 1/30 meses
};

export function getMesesCapitalizacion(frecuencia: Capitalizacion): number {
    return CapitalizacionValues[frecuencia] || 1; // Default a 1 mes si no se encuentra
}