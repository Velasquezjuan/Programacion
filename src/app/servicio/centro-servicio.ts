import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class CentroServicio {


   private establecimientos = [
        // Nivel Central id 1
        { id: 1, centroId: 1 , label: 'Nivel Central' },
        // Salud id 2
        { id: 2,  centroId: 2 , label: 'Nivel Central - Salud' },
        { id: 3,  centroId: 2 , label: 'CESFAM Bernardo Leighton' },
        { id: 4,  centroId: 2 , label: 'CESFAM Vista Hermosa' },
        { id: 5,  centroId: 2 , label: 'COSAM-CEIF Centro' },
        { id: 6,  centroId: 2 , label: 'CESFAM Padre Manuel Villaseca' },
        { id: 7,  centroId: 2 , label: 'CESFAM Cardenal Raúl Silva Henriquez' },
        { id: 8,  centroId: 2 , label: 'CEP San Lázaro' },
        { id: 9,  centroId: 2 , label: 'Farmacia Solidaria' },
        { id: 10, centroId: 2 , label: 'CESFAM Karol Wojtyla' },
        { id: 11, centroId: 2 , label: 'CESFAM DR. Alejandro del Río' },
        { id: 12, centroId: 2 , label: 'Centro de Integracion María Isabel' },
        { id: 13, centroId: 2 , label: 'COSAM-CEIF Norte' },
        { id: 14, centroId: 2 , label: 'CESFAM SAN GERONIMO' },
        { id: 15, centroId: 2 , label: 'CESFAM Laurita Vicuña' },    

        // Educacion id 3
         { id: 16, centroId: 3 , label: 'Nivel Central - Educación' },
         { id: 17, centroId: 3 , label: 'Centro Educacional Nueva Creación' },
         { id: 18, centroId: 3 , label: 'Centro Integral de Adultos Profesora Teresa Moya Reyes' },
         { id: 19, centroId: 3 , label: 'Colegio Maipo' },
         { id: 20, centroId: 3 , label: 'Complejo Educacional Consolidada'}, 
         { id: 21, centroId: 3 , label: 'Escuela Andes del Sur' },
         { id: 22, centroId: 3 , label: 'Escuela Básica Padre Alberto Hurtado'},
         { id: 23, centroId: 3 , label: 'Escuela Casas Viejas' }, 
         { id: 24, centroId: 3 , label: 'Escuela Ejército Libertador' }, 
         { id: 25, centroId: 3 , label: 'Escuela Especial Open Door' },
         { id: 26, centroId: 3 , label: 'Escuela Gabriela' }, 
         { id: 27, centroId: 3 , label: 'Escuela Las Palmas' },
         { id: 28, centroId: 3 , label: 'Escuela Los Andes'}, 
         { id: 29, centroId: 3 , label: 'Escuela Luis Matte Larraín' },
         { id: 30, centroId: 3 , label: 'Escuela Nonato Coo' }, 
         { id: 31, centroId: 3 , label: 'Escuela Óscar Bonilla' },  
         { id: 32, centroId: 3 , label: 'Escuela República de Grecia' },                           
         { id: 33, centroId: 3 , label: 'Escuela Villa Independencia' },
         { id: 34, centroId: 3 , label: 'Escuela Villa Pedro Aguirre Cerda' }, 
         { id: 35, centroId: 3 , label: 'Liceo Industrial de Puente Alto' },
         { id: 36, centroId: 3 , label: 'Liceo Camino de Luz' },
         { id: 37, centroId: 3 , label: 'Liceo Comercial de Puente Alto' }, 
         { id: 38, centroId: 3 , label: 'Liceo Municipal Chiloé' },
         { id: 39, centroId: 3 , label: 'Liceo Municipal Ingeniero Militar Juan MAckenna O´reilly'},
         { id: 40, centroId: 3 , label: 'Liceo Puente Alto' },
         { id: 41, centroId: 3 , label: 'Liceo San Gerónimo' }, 
         { id: 42, centroId: 3 , label: 'Liceo San Pedro' },
         { id: 43, centroId: 3 , label: 'Liceo Volcan San José' },
         { id: 44, centroId: 3 , label: 'Centro Integral Ketrawe' },
         { id: 45, centroId: 3 , label: 'Casa Estudio Sargento Menadier' }, 
         { id: 46, centroId: 3 , label: 'Casa Estudio San José de la Construcción' },
         { id: 47, centroId: 3 , label: 'Casa Estudio El Sauce' },
      // Atención a Menores id 4 
         { id: 48, centroId: 4 , label: 'Nivel Central -Atencion de Menores' },
         { id: 49, centroId: 4 , label: 'Jardín Infantil Sargento Menadier' },
         { id: 50, centroId: 4 , label: 'Jardín Infantil Creación'},
         { id: 51, centroId: 4 , label: 'Jardín Infantil San Miguel I' },
         { id: 52, centroId: 4 , label: 'Jardín Infantil Volcán San José' },
         { id: 53, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Ferroviaria' },
         { id: 54, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Almendral' },
         { id: 55, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Pacífico Sur' },
         { id: 56, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Monseñor Alvear' },
         { id: 57, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Francisco Coloane I' },
         { id: 58, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Padre Hurtado' },
         { id: 59, centroId: 4 , label: 'Jardín Infantil Nocedal' },
         { id: 60, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Francisco Coloane II' },
         { id: 61, centroId: 4 , label: 'Sala Cuna y Jardín Infantil San Francisco Troncal' },
         { id: 62, centroId: 4 , label: 'Sala Cuna y Jardín Infantil San Gerónimo' },
         { id: 63, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Pedro Lira' },
         { id: 64, centroId: 4 , label: 'Sala Cuna y Jardín Infantil altué' },
         { id: 65, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Rosa Valdés Ramírez' },
         { id: 66, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Chiloé' },
         { id: 67, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Andes del Sur' },
         { id: 68, centroId: 4 , label: 'Sala Cuna y Jardín Infantil San Pedro y San Pablo' },
         { id: 69, centroId: 4 , label: 'Sala Cuna y Jardín Infantil San José de la Construcción' },
         { id: 70, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Bernardo Leighton' },
         { id: 71, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Don Vicente' },
         { id: 72, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Los Nogales' },
         { id: 73, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Cerrito Arriba' },
         { id: 74, centroId: 4 , label: 'Sala Cuna y Jardín Infantil El Mariscal' },
         { id: 75, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Casas Viejas' },
         { id: 76, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Humberto Díaz Casanueva' },
         { id: 77, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Las Azaleas' },
         { id: 78, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Vista Hermosa' },
         { id: 79, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Lomas Oriente' },
         { id: 80, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Los Canales' },
         { id: 81, centroId: 4 , label: 'Sala Cuna y Jardín Infantil La Frontera' },
         { id: 82, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Sor Teresa' },
         { id: 83, centroId: 4 , label: 'Sala Cuna y Jardín Infantil Los Robles' }

        ];
    

    private centros= [
            { value: 1, label: 'Nivel Central' },
            { value: 2, label: 'Salud' },
            { value: 3, label: 'Educacion' },
            { value: 4, label: 'Atención a Menores' },
            { value: 5, label: 'otro' },
        ];
    

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

    obtenerCentros():{ value: number; label: string} []{
        return this.centros;
    }

    obtenerEstablecimientos(centroId: number): { value: number; label: string }[]{
        return this.establecimientos.filter(e => e.centroId === centroId)
        .map(e => ({ value: e.id, label: e.label}))
    }

    obtenerAuto(tipo: 'vehiculo'): any[] {
        return this.auto[tipo] || [];
    }

    obtenerPrograma(tipo: 'prog'): any[]{
        return this.programa[tipo] || [];
    }

    
    
}
