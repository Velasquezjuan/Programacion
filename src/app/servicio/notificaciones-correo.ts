import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlantillasCorreo } from './plantillas-correo';

@Injectable({
  providedIn: 'root'
})

export class NotificacionesCorreo {

private apiUrl = 'http://localhost:3000/enviar-notificacion';

  constructor(private http: HttpClient) { }

  private enviarPeticionCorreo(data: { destinatario: string, asunto: string, cuerpoHtml: string }) {
    this.http.post(this.apiUrl, data).subscribe({
      next: () => console.log('Petición de correo enviada a la API.'),
      error: (err) => console.error('Error al contactar la API de correos:', err)
    });
  }

  public enviarCorreoBienvenida(email: string, nombre: string) {
    const asunto = '¡Bienvenido a nuestra aplicación!';
    const contenido = PlantillasCorreo.bienvenida(nombre);
    const cuerpoHtml = PlantillasCorreo.base('¡Bienvenido!', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoSolicitud(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido recibida`;
    const contenido = PlantillasCorreo.solicitud(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Solicitud Recibida', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoAceptacion(email: string, viaje: any) {
    const asunto = `¡Tu viaje #${viaje.id} ha sido aceptado!`;
    const contenido = PlantillasCorreo.aceptacion(viaje);
    const cuerpoHtml = PlantillasCorreo.base('¡Viaje Aceptado!', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoRechazo(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido rechazada`;
    const contenido = PlantillasCorreo.rechazo(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Solicitud Rechazada', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }
  
  public enviarCorreoMasivo(email: string) {
    const asunto = `Tus viajes han sido cargados con éxito`;
    const contenido = PlantillasCorreo.cargaMasiva();
    const cuerpoHtml = PlantillasCorreo.base('Carga de Viajes Exitosa', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoReagendamiento(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido reagendada`;
    const contenido = PlantillasCorreo.reagendamiento(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Solicitud Reagendada', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarNotificacionAdmin(destinatariosAdmin: string[], viaje: any) {
    if (!destinatariosAdmin || destinatariosAdmin.length === 0) {
      console.warn('No se encontraron administradores para notificar.');
      return;
    }
    
    const asunto = `Nueva Solicitud de Viaje Pendiente: #${viaje.id}`;
    const contenido = PlantillasCorreo.notificacionAdmin(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Nueva Solicitud Pendiente', contenido);
    const destinatariosComoString = destinatariosAdmin.join(', ');

    this.enviarPeticionCorreo({ destinatario: destinatariosComoString, asunto, cuerpoHtml });
  }

}
