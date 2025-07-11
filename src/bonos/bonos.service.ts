import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bono } from './bono.entity';
import { Repository } from 'typeorm';
import { CreateBonoDto } from './dto/create-bono.dto';
import { UpdateBonoDto } from './dto/update-bono.dto';
import { getDiasFrecuenciaPago } from 'src/common/enums/frecuenciaPago.enum';
import e from 'express';
import { getDiasCapitalizacion } from 'src/common/enums/capitalizacion.enum';

export interface Cupon {
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
        const diasFrecuencia = getDiasFrecuenciaPago(bono.frecuenciaPago); // Por ejemplo, 180 para SEMESTRAL
        const diasResta = Math.ceil(
        (fechaVencimiento.getTime() - fechaEmision.getTime()) / (1000 * 60 * 60 * 24)
        );
        const periodos = Math.floor(diasResta / diasFrecuencia) + 1;
        console.log('Total de cuotas (incluyendo cuota 0):', periodos);
        const capitalizacion = getDiasCapitalizacion(bono.capitalizacionCupon);
        console.log('Días de capitalización:', capitalizacion);
        const tasaCuponNumerica = Number(bono.tasaCupon);
        const tasaEfectivaFinal = parseFloat(
        this.convertirTasaEfectivaAEquivalente(tasaCuponNumerica / 100, capitalizacion, diasFrecuencia).toFixed(8)
        );
        console.log('Tasa efectiva final:', tasaEfectivaFinal);

        let cupones: Cupon[]=[];

        if(bono.plazoGracia === 'TOTAL') {
            return this.calcularConPlazoGraciaTotal(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else if(bono.plazoGracia === 'PARCIAL') {
            return this.calcularConPlazoGraciaParcial(bono.duracionPlazoGracia, bono.valorNominal, Number(tasaEfectivaFinal), periodos, cupones);
        }else {
            return this.calcularConPlazoGraciaNinguno(periodos,bono.valorNominal, Number(tasaEfectivaFinal), cupones);
        }
        



        // console.log('Calculating results for Bono:', bono);
        // // Aquí puedes implementar la lógica para calcular los resultados del bono
        // // Por ejemplo, calcular el rendimiento, el valor actual, etc.
        // // Retorna un objeto con los resultados calculados
        return cupones;
    }

    convertirTasaEfectivaAEquivalente(tasaEfectiva, tipoTasa, frecuenciaPago){
        return (1+tasaEfectiva)**(frecuenciaPago/tipoTasa) - 1;
    }

    calcularConPlazoGraciaParcial(duracionPlazoGracia: number, valorNominal:number, tasaCupon:number, periodosTotales:number, cupones:Cupon[]){
        return cupones;
    }

    calcularConPlazoGraciaTotal(duracionPlazoGracia: number, valorNominal: number, tasaCupon: number, periodosTotales:number, cupones:Cupon[]){
        let saldo: number = valorNominal;
        let valorNominalFinal = valorNominal;
        cupones.push({
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
        console.log('Duración del plazo de gracia:', duracionPlazoGracia+1);
        const plazosRestantes:number = (periodosTotales - (duracionPlazoGracia+1));
        return this.calcularConPlazoGraciaNinguno(plazosRestantes, valorNominalFinal, tasaCupon, cupones);
    }

    calcularConPlazoGraciaNinguno(plazos:number, capital:number, tasaCupon:number, cupones:Cupon[]){
        console.log('Plazos:', plazos);
        console.log('Capital:', capital);
        console.log('Tasa Cupon:', tasaCupon);
        const cuota:number = (capital * tasaCupon)/(1-((1+tasaCupon)**(-plazos)));
        console.log(`Cuota a pagar por periodo sin plazo de gracia: ${cuota}`);

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

            cupones.push({
                saldoInicial: saldoInicial,
                amortizacion: amortizacion,
                interes: interes,
                cuota: cuota,
                saldoFinal: valorNominalFinal
            })
        }

        console.log('Cupones generados:', cupones);
        return cupones;
    }


    calculate
}
