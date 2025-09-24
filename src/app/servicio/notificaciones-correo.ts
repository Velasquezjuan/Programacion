import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlantillasCorreo } from './plantillas-correo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NotificacionesCorreo {

private apiUrl = `${environment.apiUrl}api/notificaciones`;

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

  public enviarCorreoVehiculoRegistrado(email: string, patente: string) {
    const asunto = `¡Tu vehículo ${patente} ha sido registrado con éxito!`;
    const contenido = PlantillasCorreo.vehiculoRegistrado(patente);
    const cuerpoHtml = PlantillasCorreo.base('Vehículo Registrado', contenido);
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

    public enviarCorreoViajeRealizado(email: string, viaje: any) {
    const asunto = `Nos alegra saber que tu viaje #${viaje.id} fue realizado`;
    const contenido = PlantillasCorreo.viajeRealizado(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Viaje Realizado con exito', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoViajeNoRealizado(email: string, viaje: any) {
    const asunto = `Lamentamos saber que tu viaje #${viaje.id} no fue realizado`;
    const contenido = PlantillasCorreo.viajeNoRealizado(viaje);
    const cuerpoHtml = PlantillasCorreo.base('viaje no realizado', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoAceptacionReagendamiento(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido reagendada y aceptada`;
    const contenido = PlantillasCorreo.aceptacionReagendamiento(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Solicitud Reagendada y Aceptada', contenido);
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

    public enviarCorreoRechazoReagendamiento(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido reagendada y rechazada`;
    const contenido = PlantillasCorreo.rechazoReagendamiento(viaje);
    const cuerpoHtml = PlantillasCorreo.base('Solicitud Reagendada y Rechazada', contenido);
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
