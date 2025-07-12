export enum FrecuenciaPago{
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

export const FrecuenciasPagoValues = {
    ANUAL: 12,
    SEMESTRAL: 6,
    CUATRIMESTRAL: 4,
    TRIMESTRAL: 3,
    BIMESTRAL: 2,
    MENSUAL: 1,
    QUINCENAL: 0.5,
    SEMANAL: 0.25,
    DIARIA: 0.0333333 // Aproximadamente 1/30
};

export function getMesesFrecuenciaPago(frecuencia: FrecuenciaPago): number {
    return FrecuenciasPagoValues[frecuencia] || 1; // Default a 1 mes si no se encuentra
}

export function diferenciaEnMeses(fechaInicio: Date, fechaFin: Date): number {
    return (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaFin.getMonth() - fechaInicio.getMonth());
}