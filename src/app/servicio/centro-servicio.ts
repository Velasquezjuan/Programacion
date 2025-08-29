import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class CentroServicio {


    private centros = {
        salud:[
        { value: '1', label: 'CESFAM Bernardo Leightom' },
        { value: '2', label: 'CESFAM Vista Hermosa' },
        { value: '3', label: 'COSAM-CEIF Centro' },
        { value: '4', label: 'CESFAM Padre Manuel Villaseca' },
        { value: '5', label: 'CESFAM Cardenal Raúl Silva Henriquez' },
        { value: '6', label: 'CEP San Lázaro' },
        { value: '7', label: 'Farmacia Solidaria' },
        { value: '8', label: 'CESFAM Karol Wojtyla' },
        { value: '9', label: 'CESFAM DR. Alejandro del Río' },
        { value: '10', label: 'Centro de Integracion María Isabel' },
        { value: '11', label: 'COSAM-CEIF Norte' },
        { velue: '12' , label: 'CESFAM SAN GERONIMO' },
        { value: '13', label: 'CESFAM Laurita Vicuña' },    
         ],

        educacion: [
         { value: '14' , label: 'Centro Educacional Nueva Creación' },
         { value: '15' , label: 'Centro Integral de Adultos Profesora Teresa Moya Reyes' },
         { value: '16' , label: 'Colegio Maipo' },
         { value: '17' , label: 'Complejo Educacional Consolidada'}, 
         { value: '18' , label: 'Escuela Andes del Sur' },
         { value: '19' , label: 'Escuela Básica Padre Alberto Hurtado'},
         { value: '20' , label: 'Escuela Casas Viejas' }, 
         { value: '21' , label: 'Escuela Ejército Libertador' }, 
         { value: '22' , label: 'Escuela Especial Open Door' },
         { value: '23' , label: 'Escuela Gabriela' }, 
         { value: '24', label: 'Escuela Las Palmas' },
         { value: '25' , label: 'Escuela Los Andes'}, 
         { value: '26' , label: 'Escuela Luis Matte Larraín' },
         { value: '27' , label: 'Escuela Nonato Coo' }, 
         { value: '28' , label: 'Escuela Óscar Bonilla' },  
         { value: '29' , label: 'Escuela República de Grecia' },                           
         { value: '30' , label: 'Escuela Villa Independencia' },
         { value: '31' , label: 'Escuela Villa Pedro Aguirre Cerda' }, 
         { value: '32' , label: 'Liceo Industrial de Puente Alto' },
         { value: '33'  , label: 'Liceo Camino de Luz' },
         { value: '34' , label: 'Liceo Comercial de Puente Alto' }, 
         { value: '35' , label: 'Liceo Municipal Chiloé' },
         { value: '36' , label: 'Liceo Municipal Ingeniero Militar Juan MAckenna O´reilly'},
         { value: '37' , label: 'Liceo Puente Alto' },
         { value: '38' , label: 'Liceo San Gerónimo' }, 
         { value: '39' , label: 'Liceo San Pedro' },
         { value: '40' , label: 'Liceo Volcan San José' },
         { value: '41' , label: 'Centro Integral Ketrawe' },
         { value: '42' , label: 'Casa Estudio Sargento Menadier' }, 
         { value: '43' , label: 'Casa Estudio San José de la Construcción' },
         { value: '44' , label: 'Casa Estudio El Sauce' }
        ],
        atm: [
            { value: '45' , label: 'Jardín Infantil Sargento Menadier' },
            { value: '46' , label: 'Jardín Infantil Creación'},
            { value: '47' , label: 'Jardín Infantil San Miguel I' },
            { value: '48' , label: 'Jardín Infantil Volcán San José' },
            { value: '49' , label: 'Sala Cuna y Jardín Infantil Ferroviaria' },
            { value: '50' , label: 'Sala Cuna y Jardín Infantil Almendral' },
            { value: '51' , label: 'Sala Cuna y Jardín Infantil Pacífico Sur' },
            { value: '52' , label: 'Sala Cuna y Jardín Infantil Monseñor Alvear' },
            { value: '53' , label: 'Sala Cuna y Jardín Infantil Francisco Coloane I' },
            { value: '54' , label: 'Sala Cuna y Jardín Infantil Padre Hurtado' },
            { value: '55' , label: 'Jardín Infantil Nocedal' },
            { value: '56' , label: 'Sala Cuna y Jardín Infantil Francisco Coloane II' },
            { value: '57' , label: 'Sala Cuna y Jardín Infantil San Francisco Troncal' },
            { value: '58' , label: 'Sala Cuna y Jardín Infantil San Gerónimo' },
            { value: '59' , label: 'Sala Cuna y Jardín Infantil Pedro Lira' },
            { value: '60' , label: 'Sala Cuna y Jardín Infantil altué' },
            { value: '61' , label: 'Sala Cuna y Jardín Infantil Rosa Valdés Ramírez' },
            { value: '62' , label: 'Sala Cuna y Jardín Infantil Chiloé' },
            { value: '63' , label: 'Sala Cuna y Jardín Infantil Andes del Sur' },
            { value: '64' , label: 'Sala Cuna y Jardín Infantil San Pedro y San Pablo' },
            { value: '65' , label: 'Sala Cuna y Jardín Infantil San José de la Construcción' },
            { value: '66' , label: 'Sala Cuna y Jardín Infantil Bernardo Leighton' },
            { value: '67' , label: 'Sala Cuna y Jardín Infantil Don Vicente' },
            { value: '68' , label: 'Sala Cuna y Jardín Infantil Los Nogales' },
            { value: '69' , label: 'Sala Cuna y Jardín Infantil Cerrito Arriba' },
            { value: '70' , label: 'Sala Cuna y Jardín Infantil El Mariscal' },
            { value: '71' , label: 'Sala Cuna y Jardín Infantil Casas Viejas' },
            { value: '72' , label: 'Sala Cuna y Jardín Infantil Humberto Díaz Casanueva' },
            { value: '73' , label: 'Sala Cuna y Jardín Infantil Las Azaleas' },
            { value: '74' , label: 'Sala Cuna y Jardín Infantil Vista Hermosa' },
            { value: '75' , label: 'Sala Cuna y Jardín Infantil Lomas Oriente' },
            { value: '76' , label: 'Sala Cuna y Jardín Infantil Los Canales' },
            { value: '77' , label: 'Sala Cuna y Jardín Infantil La Frontera' },
            { value: '78' , label: 'Sala Cuna y Jardín Infantil Sor Teresa' },
            { value: '79' , label: 'Sala Cuna y Jardín Infantil Los Robles' }

        ],
        central: [
            { value: '1', label: 'Nivel Central' },
            { value: '2', label: 'Salud' },
            { value: '3', label: 'Educacion' },
            { value: '4', label: 'Atención a Menores' },
            { value: '5', label: 'otro' },
        ]
    };

    private auto = {
        vehiculo: [
            { value: '1', label: 'Suv' },
            { value: '2', label: 'Camioneta' },
            { value: '3', label: 'Camion' },
            { value: '4', label: 'Minivan' },            
        ]

    };

    private programa = {
        prog: [
        {value: '1', label: 'Operacional' },
        {value: '2', label: 'Chile Crece Contigo' },
        {value: '3', label: 'FOFAR' },
        {value: '4', label: 'Acompañamiento' },
        {value: '5', label: 'Odontologia A Domicilio' },
        {value: '6', label: 'Sembrando Sonrisas' },
        {value: '7', label: 'JUNAEB' },
        {value: '8', label: 'PAMA' },
        {value: '9', label: 'Cuidados Paleativos' },
        {value: '10', label: 'Transferencia Municipal Vacunas' },
        {value: '11', label: 'Transferencia Municipal Farmacia a Domicilio' },
        ]
    };
  
    constructor() {
        
    }

    obtenerCentros(tipo: 'salud' | 'educacion' | 'atm' | 'central' ): any[] {
        return this.centros[tipo] || [];
      }

    obtenerAuto(tipo: 'vehiculo'): any[] {
        return this.auto[tipo] || [];
    }

    obtenerPrograma(tipo: 'prog'): any[]{
        return this.programa[tipo] || [];
    }

    
    
}
