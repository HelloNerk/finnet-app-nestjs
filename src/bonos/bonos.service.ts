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
            return this.calcularConPlazoGraciaTotal(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else if(bono.plazoGracia === 'PARCIAL') {
            return this.calcularConPlazoGraciaParcial(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else {
            return this.calcularConPlazoGraciaNinguno(periodos,bono.valorNominal, Number(tasaEfectivaFinal), cupones, true);
        }
        



        // console.log('Calculating results for Bono:', bono);
        // // Aquí puedes implementar la lógica para calcular los resultados del bono
        // // Por ejemplo, calcular el rendimiento, el valor actual, etc.
        // // Retorna un objeto con los resultados calculados
        return cupones;
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


    calculateTCEA(cupones:Cupon[]): number {
        // Implementar la lógica para calcular la TCEA (Tasa de Costo Efectivo Anual)
        // Basado en los cupones generados
        // Este es un ejemplo simple, necesitarás ajustar según tu lógica específica
        let totalIntereses = 0;
        let totalAmortizaciones = 0;

        cupones.forEach(cupon => {
            totalIntereses += cupon.interes;
            totalAmortizaciones += cupon.amortizacion;
        });

        const tcea = (totalIntereses + totalAmortizaciones) / cupones.length; // Ejemplo simple
        return tcea;
    }
}
