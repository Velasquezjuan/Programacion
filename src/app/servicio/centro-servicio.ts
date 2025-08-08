import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class CentroServicio {


    private centros = {
        salud:[
        { value: 'CESFAM Bernardo Leightom', label: 'CESFAM Bernardo Leightom' },
        { value: 'CESFAM Vista Hermosa', label: 'CESFAM Vista Hermosa' },
        { value: 'COSAM-CEIF Centro', label: 'COSAM-CEIF Centro' },
        { value: 'CESFAM Padre Manuel Villaseca', label: 'CESFAM Padre Manuel Villaseca' },
        { value: 'CESFAM Cardenal Raúl Silva Henriquez', label: 'CESFAM Cardenal Raúl Silva Henriquez' },
        { value: 'CEP San Lázaro', label: 'CEP San Lázaro' },
        { value: 'Farmacia Solidaria', label: 'Farmacia Solidaria' },
        { value: 'CESFAM Karol Wojtyla', label: 'CESFAM Karol Wojtyla' },
        { value: 'CESFAM DR. Alejandro del Río', label: 'CESFAM DR. Alejandro del Río' },
        { value: 'Centro de Integracion María Isabel', label: 'Centro de Integracion María Isabel' },
        { value: 'COSAM-CEIF Norte', label: 'COSAM-CEIF Norte' },
        ],
        educacion: [
         { value: 'Centro Educacional Nueva Creación' , label: 'Centro Educacional Nueva Creación' },
         { value: 'Centro Integral de Adultos Profesora Teresa Moya Reyes' , label: 'Centro Integral de Adultos Profesora Teresa Moya Reyes' },
         { value: 'Colegio Maipo' , label: 'Colegio Maipo' },
         { value: 'Complejo Educacional Consolidada' , label: 'Complejo Educacional Consolidada'}, 
         { value: 'Escuela Andes del Sur' , label: 'Escuela Andes del Sur' },
         { value: 'Escuela Básica Padre Alberto Hurtado' , label: 'Escuela Básica Padre Alberto Hurtado'},
         { value: 'Escuela Casas Viejas' , label: 'Escuela Casas Viejas' }, 
         { value: 'Escuela Ejército Libertador' , label: 'Escuela Ejército Libertador' }, 
         { value: 'Escuela Especial Open Door' , label: 'Escuela Especial Open Door' },
         { value: 'Escuela Gabriela' , label: 'Escuela Gabriela' }, 
         { value: 'Escuela Las Palmas', label: 'Escuela Las Palmas' },
         { value: 'Escuela Los Andes' , label: 'Escuela Los Andes'}, 
         { value: 'Escuela Luis Matte Larraín' , label: 'Escuela Luis Matte Larraín' },
         { value: 'Escuela Nonato Coo' , label: 'Escuela Nonato Coo' }, 
         { value: 'Escuela Óscar Bonilla' , label: 'Escuela Óscar Bonilla' },  
         { value: 'Escuela República de Grecia' , label: 'Escuela República de Grecia' },                           
         { value: 'Escuela Villa Independencia' , label: 'Escuela Villa Independencia' },
         { value: 'Escuela Villa Pedro Aguirre Cerda' , label: 'Escuela Villa Pedro Aguirre Cerda' }, 
         { value: 'Liceo Industrial de Puente Alto' , label: 'Liceo Industrial de Puente Alto' },
         { value: 'Liceo Camino de Luz'  , label: 'Liceo Camino de Luz' },
         { value: 'Liceo Comercial de Puente Alto' , label: 'Liceo Comercial de Puente Alto' }, 
         { value: 'Liceo Municipal Chiloé' , label: 'Liceo Municipal Chiloé' },
         { value: 'Liceo Municipal Ingeniero Militar Juan MAckenna O´reilly' , label: 'Liceo Municipal Ingeniero Militar Juan MAckenna O´reilly'},
         { value: 'Liceo Puente Alto' , label: 'Liceo Puente Alto' },
         { value: 'Liceo San Gerónimo' , label: 'Liceo San Gerónimo' }, 
         { value: 'Liceo San Pedro' , label: 'Liceo San Pedro' },
         { value: 'Liceo Volcan San José' , label: 'Liceo Volcan San José' },
         { value: 'Centro Integral Ketrawe' , label: 'Centro Integral Ketrawe' },
         { value: 'Casa Estudio Sargento Menadier' , label: 'Casa Estudio Sargento Menadier' }, 
         { value: 'Casa Estudio San José de la Construcción' , label: 'Casa Estudio San José de la Construcción' },
         { value: 'Casa Estudio El Sauce' , label: 'Casa Estudio El Sauce' }
        ],
        atm: [
            { value: 'Jardín Infantil Sargento Menadier' , label: 'Jardín Infantil Sargento Menadier' },
            { value: 'Jardín Infantil Creación' , label: 'Jardín Infantil Creación'},
            { value: 'Jardín Infantil San Miguel I' , label: 'Jardín Infantil San Miguel I' },
            { value: 'Jardín Infantil Volcán San José' , label: 'Jardín Infantil Volcán San José' },
            { value: 'Sala Cuna y Jardín Infantil Ferroviaria' , label: 'Sala Cuna y Jardín Infantil Ferroviaria' },
            { value: 'Sala Cuna y Jardín Infantil Almendral' , label: 'Sala Cuna y Jardín Infantil Almendral' },
            { value: 'Sala Cuna y Jardín Infantil Pacífico Sur' , label: 'Sala Cuna y Jardín Infantil Pacífico Sur' },
            { value: 'Sala Cuna y Jardín Infantil Monseñor Alvear' , label: 'Sala Cuna y Jardín Infantil Monseñor Alvear' },
            { value: 'Sala Cuna y Jardín Infantil Francisco Coloane I' , label: 'Sala Cuna y Jardín Infantil Francisco Coloane I' },
            { value: 'Sala Cuna y Jardín Infantil Padre Hurtado' , label: 'Sala Cuna y Jardín Infantil Padre Hurtado' },
            { value: 'Jardín Infantil Nocedal' , label: 'Jardín Infantil Nocedal' },
            { value: 'Sala Cuna y Jardín Infantil Francisco Coloane II' , label: 'Sala Cuna y Jardín Infantil Francisco Coloane II' },
            { value: 'Sala Cuna y Jardín Infantil San Francisco Troncal' , label: 'Sala Cuna y Jardín Infantil San Francisco Troncal' },
            { value: 'Sala Cuna y Jardín Infantil San Gerónimo' , label: 'Sala Cuna y Jardín Infantil San Gerónimo' },
            { value: 'Sala Cuna y Jardín Infantil Pedro Lira' , label: 'Sala Cuna y Jardín Infantil Pedro Lira' },
            { value: 'Sala Cuna y Jardín Infantil altué' , label: 'Sala Cuna y Jardín Infantil altué' },
            { value: 'Sala Cuna y Jardín Infantil Rosa Valdés Ramírez' , label: 'Sala Cuna y Jardín Infantil Rosa Valdés Ramírez' },
            { value: 'Sala Cuna y Jardín Infantil Chiloé' , label: 'Sala Cuna y Jardín Infantil Chiloé' },
            { value: 'Sala Cuna y Jardín Infantil Andes del Sur' , label: 'Sala Cuna y Jardín Infantil Andes del Sur' },
            { value:  'Sala Cuna y Jardín Infantil San Pedro y San Pablo' , label: 'Sala Cuna y Jardín Infantil San Pedro y San Pablo' },
            { value: 'Sala Cuna y Jardín Infantil San José de la Construcción' , label: 'Sala Cuna y Jardín Infantil San José de la Construcción' },
            { value: 'Sala Cuna y Jardín Infantil Bernardo Leighton' , label: 'Sala Cuna y Jardín Infantil Bernardo Leighton' },
            { value: 'Sala Cuna y Jardín Infantil Don Vicente' , label: 'Sala Cuna y Jardín Infantil Don Vicente' },
            { value: 'Sala Cuna y Jardín Infantil Los Nogales' , label: 'Sala Cuna y Jardín Infantil Los Nogales' },
            { value:  'Sala Cuna y Jardín Infantil Cerrito Arriba' , label: 'Sala Cuna y Jardín Infantil Cerrito Arriba' },
            { value: 'Sala Cuna y Jardín Infantil El Mariscal' , label: 'Sala Cuna y Jardín Infantil El Mariscal' },
            { value: 'Sala Cuna y Jardín Infantil Casas Viejas' , label: 'Sala Cuna y Jardín Infantil Casas Viejas' },
            { value: 'Sala Cuna y Jardín Infantil Humberto Díaz Casanueva' , label: 'Sala Cuna y Jardín Infantil Humberto Díaz Casanueva' },
            { value: 'Sala Cuna y Jardín Infantil Las Azaleas' , label: 'Sala Cuna y Jardín Infantil Las Azaleas' },
            { value: 'Sala Cuna y Jardín Infantil Vista Hermosa' , label: 'Sala Cuna y Jardín Infantil Vista Hermosa' },
            { value: 'Sala Cuna y Jardín Infantil Lomas Oriente' , label: 'Sala Cuna y Jardín Infantil Lomas Oriente' },
            { value: 'Sala Cuna y Jardín Infantil Los Canales' , label: 'Sala Cuna y Jardín Infantil Los Canales' },
            { value:  'Sala Cuna y Jardín Infantil La Frontera' , label: 'Sala Cuna y Jardín Infantil La Frontera' },
            { value: 'Sala Cuna y Jardín Infantil Sor Teresa' , label: 'Sala Cuna y Jardín Infantil Sor Teresa' },
            { value: 'Sala Cuna y Jardín Infantil Los Robles' , label: 'Sala Cuna y Jardín Infantil Los Robles' }

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
            { value: 'suv', label: 'suv' },
            { value: 'minivan', label: 'Minivan' },
            { value: 'camioneta', label: 'Camioneta' },
            { value: 'camion', label: 'Camion' },
        ]

    };

    private programa = {
        prog: [
        {value: 'operacional', label: 'Operacional' },
        {value: 'chile crece contigo', label: 'Chile Crece Contigo' },
        {value: 'fofar', label: 'FOFAR' },
        {value: 'acompañamiento', label: 'Acompañamiento' },
        {value: 'odontologia a domicilio', label: 'Odontologia A Domicilio' },
        {value: 'sembrando sonrisas', label: 'Sembrando Sonrisas' },
        {value: 'junaeb', label: 'JUNAEB' },
        {value: 'pama', label: 'PAMA' },
        {value: 'cuidados paleativos', label: 'Cuidados Paleativos' },
        {value: 'transferencia municipal (vacunas)', label: 'Transferencia Municipal Vacunas' },
        {value: 'transferencia municiapl(farmacia domicilio)', label: 'Transferencia Municipal Farmacia a Domicilio' },
        {value: 'cuidados paleativos', label: 'Cuidados Paleativos' },
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
