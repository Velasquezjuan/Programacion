import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class CentroServicio {


    private centros = {
        salud:[
        { value: 'bl', label: 'CESFAM Bernardo Leightom' },
        { value: 'vh', label: 'CESFAM Vista Hermosa' },
        { value: 'ceifCentro', label: 'COSAM-CEIF Centro' },
        { value: 'pmv', label: 'CESFAM Padre Manuel Villaseca' },
        { value: 'crsh', label: 'CESFAM Cardenal Raúl Silva Henriquez' },
        { value: 'sl', label: 'CEP San Lázaro' },
        { value: 'fs', label: 'Farmacia Solidaria' },
        { value: 'kw', label: 'CESFAM Karol Wojtyla' },
        { value: 'ar', label: 'CESFAM DR. Alejandro del Río' },
        { value: 'cimi', label: 'Centro de Integracion María Isabel' },
        { value: 'ceifNorte', label: 'COSAM-CEIF Norte' },
        ],
        educacion: [
         { value: 'nc', label: 'Centro Educacional Nueva Creación' },
         { value: 'ceia', label: 'Centro Integral de Adultos Profesora Teresa Moya Reyes' },
         { value:'mp', label: 'Colegio Maipo' },
         { value: 'conso', label: 'Complejo Educacional Consolidada'}, 
         { value: 'as', label: 'Escuela Andes del Sur' },
         { value: 'pah', label: 'Escuela Básica Padre Alberto Hurtado'},
         { value: 'cv', label: 'Escuela Casas Viejas' }, 
         { value: 'el', label: 'Escuela Ejército Libertador' }, 
         { value: 'od', label: 'Escuela Especial Open Door' },
         { value: 'gb', label: 'Escuela Gabriela' }, 
         { value: 'lp', label:'Escuela Las Palmas' },
         { value: 'la', label: 'Escuela Los Andes'}, 
         { value:'lml', label: 'Escuela Luis Matte Larraín' },
         { value: 'enc', label: 'Escuela Nonato Coo' }, 
         { value: 'ob', label: 'Escuela Óscar Bonilla' },  
         { value: 'rg', label: 'Escuela República de Grecia' },                           
         { value: 'vi', label: 'Escuela Villa Independencia' },
         { value: 'vpac', label: 'Escuela Villa Pedro Aguirre Cerda' }, 
         { value: 'ipa', label: 'Liceo Industrial de Puente Alto' },
         { value: 'cl', label: 'Liceo Camino de Luz' },
         { value: 'cpa', label: 'Liceo Comercial de Puente Alto' }, 
         { value: 'mc', label: 'Liceo Municipal Chiloé' },
         { value: 'mjm', label: 'Liceo Municipal Ingeniero Militar Juan MAckenna O´reilly'},
         { value: 'pa', label: 'Liceo Puente Alto' },
         { value: 'lsg', label: 'Liceo San Gerónimo' }, 
         { value: 'lsp', label: 'Liceo San Pedro' },
         { value: 'lvsj', label: 'Liceo Volcan San José' },
         { value: 'cik', label: 'Centro Integral Ketrawe' },
         { value: 'cesm', label: 'Casa Estudio Sargento Menadier' }, 
         { value: 'cesjc', label: 'Casa Estudio San José de la Construcción' },
         { value: 'cees', label: 'Casa Estudio El Sauce' }
        ],
        atm: [
            { value: 'jism', label: 'Jardín Infantil Sargento Menadier' },
            { value: 'jic', label: 'Jardín Infantil Creación'},
            { value: 'jism1', label: 'Jardín Infantil San Miguel I' },
            { value: 'jivsj', label: 'Jardín Infantil Volcán San José'},
            { value: 'scjif', label: 'Sala Cuna y Jardín Infantil Ferroviaria' },
            { value: 'scjia', label: 'Sala Cuna y Jardín Infantil Almendral' },
            { value: 'scjips', label: 'Sala Cuna y Jardín Infantil Pacífico Sur' },
            { value: 'scjima', label: 'Sala Cuna y Jardín Infantil Monseñor Alvear' },
            { value: 'scjifc1', label: 'Sala Cuna y Jardín Infantil Francisco Coloane I' },
            { value: 'scjiph', label: 'Sala Cuna y Jardín Infantil Padre Hurtado' },
            { value:'jin', label: 'Jardín Infantil Nocedal' },
            { value: 'scjifc2', label: 'Sala Cuna y Jardín Infantil Francisco Coloane II' },
            { value: 'scjisft', label:'Sala Cuna y Jardín Infantil San Francisco Troncal' },
            { value: 'scjisg', label: 'Sala Cuna y Jardín Infantil San Gerónimo' },
            { value: 'scjipl', label: 'Sala Cuna y Jardín Infantil Pedro Lira' },
            { value: 'scjia', label: 'Sala Cuna y Jardín Infantil altué' },
            { value:'scjirvr', label: 'Sala Cuna y Jardín Infantil Rosa Valdés Ramírez' },
            { value: 'scjic', label: 'Sala Cuna y Jardín Infantil Chiloé' },
            { value: 'scjias', label: 'Sala Cuna y Jardín Infantil Andes del Sur' },
            { value: 'scjispdspb', label: 'Sala Cuna y Jardín Infantil San Pedro y San Pablo' },
            { value: 'scjisjc', label: 'Sala Cuna y Jardín Infantil San José de la Construcción' },
            { value: 'scjibl', label: 'Sala Cuna y Jardín Infantil Bernardo Leighton' },
            { value:'scjidv', label: 'Sala Cuna y Jardín Infantil Don Vicente' },
            { value: 'scjiln', label: 'Sala Cuna y Jardín Infantil Los Nogales' },
            { value: 'scjica', label: 'Sala Cuna y Jardín Infantil Cerrito Arriba' },
            { value: 'scjiem', label: 'Sala Cuna y Jardín Infantil El Mariscal' },
            { value: 'scjicv', label: 'Sala Cuna y Jardín Infantil Casas Viejas' },
            { value: 'scjihdc', label: 'Sala Cuna y Jardín Infantil Humberto Díaz Casanueva' },
            { value: 'scjilaz', label: 'Sala Cuna y Jardín Infantil Las Azaleas' },
            { value: 'scjivh', label: 'Sala Cuna y Jardín Infantil Vista Hermosa' },
            { value: 'scjilo', label: 'Sala Cuna y Jardín Infantil Lomas Oriente' },
            { value: 'scjilc', label: 'Sala Cuna y Jardín Infantil Los Canales' },
            { value: 'scjilf', label: 'Sala Cuna y Jardín Infantil La Frontera' },
            { value: 'scjist', label: 'Sala Cuna y Jardín Infantil Sor Teresa' },
            { value: 'scjilr', label: 'Sala Cuna y Jardín Infantil Los Robles' }

        ],
        central: [
            { value: 'nivelCentral', label: 'Nivel Central' },
            { value: 'educacion', label: 'Educacion' },
            { value: 'salud', label: 'Salud' },
            { value: 'atm', label: 'Atención a Menores' },
        ]
    };

    private auto = {
        vehiculo: [
            { value: 'sv', label: 'suv' },
            { value: 'mvn', label: 'Minivan' },
            { value: 'cm', label: 'Camioneta' },
            { value: 'sd', label: 'Sedan' },

        ]

    };

    private programa = {
        prog: [
        {value: 'programa1', label: 'Programa1' },
        {value: 'programa2', label: 'Programa2' },
        {value: 'programa3', label: 'Programa3' },
        {value: 'programa4', label: 'Programa4' },
        {value: 'programa5', label: 'Programa5' },
        {value: 'programa6', label: 'Programa6' },
        {value: 'programa7', label: 'Programa7' },
        {value: 'programa8', label: 'Programa8' },
        {value: 'programa9', label: 'Programa9' },
        {value: 'programaA', label: 'ProgramaA' },
        {value: 'programaB', label: 'ProgramaB' },
        {value: 'programaC', label: 'ProgramaC' },
        {value: 'programaD', label: 'ProgramaD' },
        {value: 'programaE', label: 'ProgramaE' },
        {value: 'ProgramaF', label: 'ProgramaF' }
        ]
    };
  
    constructor() {
        
    }

    obtenerCentros(tipo: 'salud' | 'educacion' | 'atm' | 'central'): any[] {
        return this.centros[tipo] || [];
      }

    obtenerAuto(tipo: 'vehiculo'): any[] {
        return this.auto[tipo] || [];
    }

    obtenerPrograma(tipo: 'prog'): any[]{
        return this.programa[tipo] || [];
    }

    
    
}
