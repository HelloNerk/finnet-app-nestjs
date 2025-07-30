import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bono } from './bono.entity';
import { Repository } from 'typeorm';
import { CreateBonoDto } from './dto/create-bono.dto';
import { UpdateBonoDto } from './dto/update-bono.dto';
import e from 'express';
import { getMesesCapitalizacion } from 'src/common/enums/capitalizacion.enum';
import { diferenciaEnMeses, getMesesFrecuenciaPago } from 'src/common/enums/frecuenciaPago.enum';

export interface Cupon {
    periodo: number;
    saldoInicial: number;
    amortizacion: number;
    interes: number;
    cuota: number;
    saldoFinal: number;
}


@Injectable()
export class BonosService {

    constructor(@InjectRepository(Bono) private bonosRepository: Repository<Bono>){}

    createBono(createBonoDto: CreateBonoDto){
        const newBono = this.bonosRepository.create(createBonoDto);
        return this.bonosRepository.save(newBono);
    }

    findBonosByUserId(userId: number) {
        return this.bonosRepository.find({
            where: { userId },
            order: { fechaCreacion: 'DESC' },    
        });
    }

    findBonoById(id: number) {
        return this.bonosRepository.findOneBy({ id });
    }

    async updateBono(id: number, updateBonoDto: UpdateBonoDto) {
        await this.bonosRepository.update(id, updateBonoDto);
        return this.findBonoById(id);
    }


    async deleteBono(id: number) {
        const bono = await this.findBonoById(id);
        if (!bono) {
            throw new Error('Bono not found');
        }
        return this.bonosRepository.remove(bono);
    }
    
    

    async calculateResults(id:number){
        const bono = await this.findBonoById(id);
        if (!bono) {
            throw new Error('Bono not found');
        }

        //valor nominal
        //tasa cupon
        //tasa cupon (si es nominal anual convertir a efectiva anual)
        //una vez que ya lo tengo a efectiva pasarlo a como sea la frecuencia de pago
        // periodo de gracia? 
        // Si: 
        // TOTAL: NO C, NO SE COBRA NADA HASTA QUE ACABE PERIODO DE GRACIA
        // PARCIAL: COBRAR INTERES NOMAS, ACABA Y SOLO COBRAR LA CAPITAL

        //Calcular periodos de pago dias((fechaVencimiento - fechaEmision))/frecuenciaPago(dias)
        const fechaEmision = new Date(bono.fechaEmision);
        const fechaVencimiento = new Date(bono.fechaVencimiento);
        const mesesFrecuencia = getMesesFrecuenciaPago(bono.frecuenciaPago); // Por ejemplo, 180 para SEMESTRAL
        console.log('Meses de frecuencia:', mesesFrecuencia);
        const mesesResta = diferenciaEnMeses(fechaEmision, fechaVencimiento);
        console.log('Meses restantes:', mesesResta);
        
        if (mesesResta <= 0) {
            throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión.');
        }

        const periodos = Math.floor(mesesResta / mesesFrecuencia);
        console.log('Total de cuotas (incluyendo cuota 0):', periodos);
        console.log('Total de cuotas (incluyendo cuota 0):', periodos);
        const mesesCapitalizacion = getMesesCapitalizacion(bono.capitalizacionCupon);
        console.log('Meses de capitalización:', mesesCapitalizacion);
        const tasaCuponNumerica = Number(bono.tasaCupon);
        const tasaEfectivaFinal = 
            this.convertirTasaEfectivaAEquivalente(
                tasaCuponNumerica / 100,
                mesesCapitalizacion,
                mesesFrecuencia
            );
        
        console.log('Tasa efectiva final:', tasaEfectivaFinal);

        let cupones: Cupon[]=[];

        //Verificar si hay comision y gastos adicionales


        if(bono.plazoGracia === 'TOTAL') {
            cupones =  this.calcularConPlazoGraciaTotal(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else if(bono.plazoGracia === 'PARCIAL') {
            cupones =  this.calcularConPlazoGraciaParcial(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else {
            cupones = this.calcularConPlazoGraciaNinguno(periodos,bono.valorNominal, Number(tasaEfectivaFinal), cupones, true);
        }
        
        const resultados = this.calculateTCEA(cupones, getMesesCapitalizacion(bono.capitalizacionCupon));
        const metricas = this.calcularMetricasBono(cupones, resultados.tcea, mesesFrecuencia);

        const data = {
            cupones: cupones,
            resultados: resultados,
            metricas: metricas,
        };

        // console.log('Calculating results for Bono:', bono);
        // // Aquí puedes implementar la lógica para calcular los resultados del bono
        // // Por ejemplo, calcular el rendimiento, el valor actual, etc.
        // // Retorna un objeto con los resultados calculados
        return data;
    }

    convertirTasaEfectivaAEquivalente(tasaEfectiva: number, mesesCapitalizacion: number, mesesFrecuencia: number) {
        // mesesCapitalizacion: cada cuántos meses se capitaliza la tasa original
        // mesesFrecuencia: cada cuántos meses es el pago
        return Math.pow(1 + tasaEfectiva, mesesFrecuencia / mesesCapitalizacion) - 1;
    }

    calcularConPlazoGraciaParcial(duracionPlazoGracia: number, valorNominal:number, tasaCupon:number, periodosTotales:number, cupones:Cupon[]){
        let saldo: number = valorNominal;
        let valorNominalFinal = valorNominal;
        cupones.push({
            periodo: 0,
            saldoInicial: saldo,
            amortizacion: 0,
            interes: 0,
            cuota: 0,
            saldoFinal: valorNominalFinal
        });
        console.log('Valor Nominal:', valorNominal);
        console.log('Tasa Cupon:', tasaCupon);

        const interes:number = valorNominalFinal * tasaCupon;
        const cuota:number = valorNominalFinal * tasaCupon;
        for(let i=1; i <= duracionPlazoGracia; i++) {
            cupones.push({
                periodo: i,
                saldoInicial: valorNominalFinal,
                amortizacion: 0,
                interes: interes,
                cuota: cuota,
                saldoFinal: valorNominalFinal
            });
            console.log(`Iteración ${i}: saldo=${saldo}, tasaCupon=${tasaCupon}`);
            if (isNaN(saldo) || isNaN(tasaCupon)) {
                throw new Error(`Error: saldo o tasaCupon es NaN en la iteración ${i}`);
            }
        }
        console.log('valorNominalFinal:', valorNominalFinal);
        console.log('Periodos totales:', periodosTotales);
        const plazosRestantes:number = (periodosTotales - (duracionPlazoGracia));
        console.log('Duración del plazo de gracia:', duracionPlazoGracia);
        if(plazosRestantes <= 0){
            return cupones;
        }
        console.log('Plazos restantes:', plazosRestantes);
        return this.calcularConPlazoGraciaNinguno(plazosRestantes, valorNominalFinal, tasaCupon, cupones, false);
    }

    calcularConPlazoGraciaTotal(duracionPlazoGracia: number, valorNominal: number, tasaCupon: number, periodosTotales:number, cupones:Cupon[]){
        let saldo: number = valorNominal;
        let valorNominalFinal = valorNominal;
        cupones.push({
            periodo: 0,
            saldoInicial: saldo,
            amortizacion: 0,
            interes: 0,
            cuota: 0,
            saldoFinal: valorNominalFinal
        });

        for (let i = 1; i <= duracionPlazoGracia; i++) {
            console.log(`Iteración ${i}: saldo=${saldo}, tasaCupon=${tasaCupon}`);
            if (isNaN(saldo) || isNaN(tasaCupon)) {
                throw new Error(`Error: saldo o tasaCupon es NaN en la iteración ${i}`);
            }
            const interes:number = valorNominalFinal * tasaCupon; // <-- esta es la fórmula correcta
            const nominal = valorNominalFinal; // El valor nominal no cambia en el plazo de gracia
            saldo = saldo * (1 + tasaCupon); // <-- esta es la fórmula correcta
            valorNominalFinal = saldo;
            cupones.push({
                periodo: i,
                saldoInicial: nominal,
                amortizacion: 0,
                interes: interes,
                cuota: 0,
                saldoFinal: valorNominalFinal
            })
            console.log('Saldo:', saldo);
        }
        console.log('valorNominalFinal:', valorNominalFinal);
        console.log('Periodos totales:', periodosTotales);
        console.log('Duración del plazo de gracia:', duracionPlazoGracia);
        const plazosRestantes:number = (periodosTotales - (duracionPlazoGracia));
        return this.calcularConPlazoGraciaNinguno(plazosRestantes, valorNominalFinal, tasaCupon, cupones, false);
    }

    calcularConPlazoGraciaNinguno(plazos:number, capital:number, tasaCupon:number, cupones:Cupon[], isPeriodZero:boolean){
        console.log('Plazos:', plazos);
        console.log('Capital:', capital);
        console.log('Tasa Cupon:', tasaCupon);
        const cuota:number = (capital * tasaCupon)/(1-((1+tasaCupon)**(-plazos)));
        console.log(`Cuota a pagar por periodo sin plazo de gracia: ${cuota}`);

        if(isPeriodZero){
            cupones.push({
                periodo: 0,
                saldoInicial: capital,
                amortizacion: 0,
                interes: 0,
                cuota: 0,
                saldoFinal: capital
            });
        }


        const cantCupones:number = cupones.length -1;
        let valorNominalFinal:number = capital;
        for(let i = 1; i <= plazos; i++) {
            let interes:number = valorNominalFinal * tasaCupon;
            let amortizacion:number = cuota - interes;
            let saldoInicial:number = valorNominalFinal;
            valorNominalFinal -= amortizacion;
            if (i === plazos) {
                const valorNominalFinalRedondeado = parseFloat(valorNominalFinal.toFixed(2));
                valorNominalFinal = valorNominalFinalRedondeado; // Redondear el valor nominal final solo al final
            }
            console.log(`Periodo ${i}: Interés: ${interes}, Amortización: ${amortizacion}, Valor Nominal Final: ${valorNominalFinal}`);

            let period:number = isPeriodZero? i : i + cantCupones;
            cupones.push({
                periodo: period,
                saldoInicial: saldoInicial,
                amortizacion: amortizacion,
                interes: interes,
                cuota: cuota,
                saldoFinal: valorNominalFinal
            })
        }
        console.log('Cantidad de cupones: ', cupones.length);
        console.log('Cupones generados:', cupones);
        return cupones;
    }


    calculateTCEA(cupones: Cupon[], mesesFrecuencia: number = 6): any {
        // Generar flujos de caja
        const flujos: number[] = [];
        
        // Flujo inicial (dinero recibido, positivo)
        flujos.push(cupones[0].saldoInicial);
        
        // Flujos de pagos (dinero pagado, negativo)
        for (let i = 1; i < cupones.length; i++) {
            if (cupones[i].cuota > 0) {
                flujos.push(-cupones[i].cuota); // Negativo porque es pago
            } else {
                flujos.push(0); // Período de gracia
            }
        }
        
        console.log('Flujos de caja:', flujos);
        
        // Calcular TIR semestral usando Newton-Raphson
        const tirSemestral = this.calcularTIR(flujos);
        
        // Convertir TIR semestral a TCEA anual
        // TCEA = (1 + TIR_semestral)^2 - 1
        const tcea = Math.pow(1 + tirSemestral, 2) - 1;
        
        // console.log('TIR Semestral:', tirSemestral * 100, '%');
        // console.log('TCEA Anual:', tcea * 100, '%');
        

        const resultados = {
            tir: tirSemestral * 100, // Convertir a porcentaje
            tcea: tcea * 100 // Convertir a porcentaje
        }
        return resultados; // Retornar TCEA en porcentaje

    }

    private calcularTIR(flujos: number[]): number {
        let tir = 0.1; // Estimación inicial 10% semestral
        const precision = 0.000001;
        const maxIteraciones = 100;
        
        for (let i = 0; i < maxIteraciones; i++) {
            const vpn = this.calcularVPN(flujos, tir);
            const vpnDerivada = this.calcularVPNDerivada(flujos, tir);
            
            if (Math.abs(vpnDerivada) < 1e-10) break;
            
            const nuevaTir = tir - vpn / vpnDerivada;
            
            if (Math.abs(nuevaTir - tir) < precision) {
                return nuevaTir;
            }
            
            tir = nuevaTir;
        }
        
        return tir;
    }

    private calcularVPN(flujos: number[], tasa: number): number {
        let vpn = 0;
        
        for (let i = 0; i < flujos.length; i++) {
            vpn += flujos[i] / Math.pow(1 + tasa, i);
        }
        
        return vpn;
    }

    private calcularVPNDerivada(flujos: number[], tasa: number): number {
        let derivada = 0;
        
        for (let i = 1; i < flujos.length; i++) {
            derivada -= (i * flujos[i]) / Math.pow(1 + tasa, i + 1);
        }
        
        return derivada;
    }


    /**
     * Calcula el precio máximo del bono (Valor Presente de flujos futuros)
     * @param cupones - Array de cupones
     * @param tasaDescuento - Tasa de descuento (TCEA o tasa de mercado)
     * @param mesesFrecuencia - Meses entre pagos (6 para semestral)
     */
    calcularPrecioMaximo(cupones: Cupon[], tasaDescuento: number, mesesFrecuencia: number): number {
        let precioMaximo = 0;
        
        for (const cupon of cupones) {
            if (cupon.periodo > 0 && cupon.cuota > 0) {
                // Convertir período a años
                const periodoAnual = (cupon.periodo * mesesFrecuencia) / 12;
                
                // Valor presente del flujo
                const valorPresente = cupon.cuota / Math.pow(1 + tasaDescuento / 100, periodoAnual);
                precioMaximo += valorPresente;
            }
        }
        
        return precioMaximo;
    }

    /**
     * Calcula la duración (duration) del bono
     * @param cupones - Array de cupones
     * @param tasaDescuento - Tasa de descuento
     * @param mesesFrecuencia - Meses entre pagos
     */
    calcularDuracion(cupones: Cupon[], tasaDescuento: number, mesesFrecuencia: number): number {
        const precioMaximo = this.calcularPrecioMaximo(cupones, tasaDescuento, mesesFrecuencia);
        let sumaPonderada = 0;
        
        for (const cupon of cupones) {
            if (cupon.periodo > 0 && cupon.cuota > 0) {
                const periodoAnual = (cupon.periodo * mesesFrecuencia) / 12;
                const valorPresente = cupon.cuota / Math.pow(1 + tasaDescuento / 100, periodoAnual);
                
                // Duración = Σ(t × VP(CFt)) / Precio
                sumaPonderada += periodoAnual * valorPresente;
            }
        }
        
        return sumaPonderada / precioMaximo;
    }

    /**
     * Calcula la duración modificada del bono
     * @param cupones - Array de cupones
     * @param tasaDescuento - Tasa de descuento
     * @param mesesFrecuencia - Meses entre pagos
     */
    calcularDuracionModificada(cupones: Cupon[], tasaDescuento: number, mesesFrecuencia: number): number {
        const duracion = this.calcularDuracion(cupones, tasaDescuento, mesesFrecuencia);
        
        // Duración Modificada = Duración / (1 + r)
        return duracion / (1 + tasaDescuento / 100);
    }

    /**
     * Calcula la convexidad del bono
     * @param cupones - Array de cupones
     * @param tasaDescuento - Tasa de descuento
     * @param mesesFrecuencia - Meses entre pagos
     */
    calcularConvexidad(cupones: Cupon[], tasaDescuento: number, mesesFrecuencia: number): number {
        const precioMaximo = this.calcularPrecioMaximo(cupones, tasaDescuento, mesesFrecuencia);
        let sumaConvexidad = 0;
        
        for (const cupon of cupones) {
            if (cupon.periodo > 0 && cupon.cuota > 0) {
                const periodoAnual = (cupon.periodo * mesesFrecuencia) / 12;
                const valorPresente = cupon.cuota / Math.pow(1 + tasaDescuento / 100, periodoAnual);
                
                // Convexidad = Σ[t(t+1) × VP(CFt)] / [P × (1+r)²]
                sumaConvexidad += periodoAnual * (periodoAnual + 1) * valorPresente;
            }
        }
        
        const denominador = precioMaximo * Math.pow(1 + tasaDescuento / 100, 2);
        return sumaConvexidad / denominador;
    }

    /**
     * Calcula la TREA (Tasa de Rendimiento Efectivo Anual) desde el punto de vista del bonista
     * @param cupones - Array de cupones
     * @param precioCompra - Precio al cual el bonista compra el bono
     * @param mesesFrecuencia - Meses entre pagos
     */
    calcularTREA(cupones: Cupon[], precioCompra: number, mesesFrecuencia: number): number {
        // Generar flujos de caja desde la perspectiva del bonista
        const flujos: number[] = [];
        
        // Flujo inicial (dinero pagado por el bonista, negativo)
        flujos.push(-precioCompra);
        
        // Flujos de cobros (dinero recibido por el bonista, positivo)
        for (let i = 1; i < cupones.length; i++) {
            if (cupones[i].cuota > 0) {
                flujos.push(cupones[i].cuota); // Positivo porque recibe dinero
            } else {
                flujos.push(0); // Período de gracia
            }
        }
        
        console.log('Flujos TREA (bonista):', flujos);
        
        // Calcular TIR referencial del bonista
        const tirReferencial = this.calcularTIRBonista(flujos);
        
        // Convertir TIR referencial a TREA anual
        const periodosAnuales = 12 / mesesFrecuencia;
        const trea = Math.pow(1 + tirReferencial, periodosAnuales) - 1;
        
        console.log('TIR Referencial Bonista:', tirReferencial * 100, '%');
        console.log('TREA Anual:', trea * 100, '%');
        
        return trea * 100; // Retornar en porcentaje
    }

    /**
     * Calcula la TIR para el bonista (similar al método anterior pero con flujos invertidos)
     */
    private calcularTIRBonista(flujos: number[]): number {
        let tir = 0.1; // Estimación inicial 10% referencial
        const precision = 0.000001;
        const maxIteraciones = 100;
        
        for (let i = 0; i < maxIteraciones; i++) {
            const vpn = this.calcularVPN(flujos, tir);
            const vpnDerivada = this.calcularVPNDerivada(flujos, tir);
            
            if (Math.abs(vpnDerivada) < 1e-10) break;
            
            const nuevaTir = tir - vpn / vpnDerivada;
            
            if (Math.abs(nuevaTir - tir) < precision) {
                return nuevaTir;
            }
            
            tir = nuevaTir;
        }
        
        return tir;
    }

    /**
     * Método principal que calcula todas las métricas del bono
     */
    calcularMetricasBono(cupones: Cupon[], tasaDescuento: number, mesesFrecuencia: number, precioCompra?: number) {
        const precioMaximo = this.calcularPrecioMaximo(cupones, tasaDescuento, mesesFrecuencia);
        const duracion = this.calcularDuracion(cupones, tasaDescuento, mesesFrecuencia);
        const duracionModificada = this.calcularDuracionModificada(cupones, tasaDescuento, mesesFrecuencia);
        const convexidad = this.calcularConvexidad(cupones, tasaDescuento, mesesFrecuencia);
        
        // Calcular TREA si se proporciona precio de compra, sino usar el precio máximo
        const precioParaTREA = precioCompra || precioMaximo;
        const trea = this.calcularTREA(cupones, precioParaTREA, mesesFrecuencia);
        
        return {
            precioMaximo: Number(precioMaximo.toFixed(2)),
            duracion: Number(duracion.toFixed(4)),
            duracionModificada: Number(duracionModificada.toFixed(4)),
            convexidad: Number(convexidad.toFixed(6)),
            trea: Number(trea.toFixed(2))
        };
    }
}
