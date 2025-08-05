import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class NotificacionesCorreo {

  // La URL donde está funcionando tu API.
  // Durante el desarrollo será localhost, en producción será la URL de tu servidor.
  private apiUrl = 'http://localhost:3000/enviar-correo';

  constructor(private http: HttpClient) { }

  /**
   * Envía una petición a la API para mandar un correo.
   * @param data Un objeto con destinatario, asunto y cuerpoHtml.
   */
  private enviarPeticionCorreo(data: { destinatario: string, asunto: string, cuerpoHtml: string }) {
    
    this.http.post(this.apiUrl, data).subscribe({
      next: () => console.log('Petición de correo enviada a la API.'),
      error: (err) => console.error('Error al contactar la API de correos:', err)
    });
  }

  // --- MÉTODOS PARA CADA TIPO DE NOTIFICACIÓN ---

  public enviarCorreoBienvenida(email: string, nombre: string) {
    const asunto = '¡Bienvenido a nuestra aplicación!';
    const cuerpoHtml = `
      <h1>¡Hola, ${nombre}!</h1>
      <p>Tu cuenta ha sido creada con éxito. Ya puedes empezar a solicitar y gestionar tus viajes.</p>
      <p>¡Gracias por unirte!</p>
    `;
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoSolicitud(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido recibida`;
    const cuerpoHtml = `
      <h1>Solicitud Recibida</h1>
      <p>Hemos recibido tu solicitud de viaje con destino a <b>${viaje.puntoDestino}</b>.</p>
      <p>Por favor, espere a que su solicitud se revise y apruebe.</p>
      <p>Recibirás una notificación cuando sea aceptada.</p>
    `;
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

   public enviarCorreoReagendamiento(email: string, viaje: any) {
    const asunto = `Tu solicitud de viaje #${viaje.id} ha sido reagendada`;
    const cuerpoHtml = `
      <h1>Solicitud Reagendada</h1>
      <p>Su solicitud #${viaje.id} con destino a <b>${viaje.puntoDestino}</b>.</p>
      <p>tuvo que ser reagendada por #${viaje.motivoReagendamiento}.</p>
      <p>Porfavor, si la fecha indicada es favorable porfavor aceptar reagendamiento.</p>
      <p>de lo contrario porfavor indicar fecha favorable para usted.</p>
    `;
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

  public enviarCorreoAceptacion(email: string, viaje: any) {
    const asunto = `¡Tu viaje #${viaje.id} ha sido aceptado!`;
    const cuerpoHtml = `
      <h1>¡Viaje Aceptado!</h1>
      <p>Tu viaje para el día <b>${viaje.fecha}</b> a las <b>${viaje.hora}</b> ha sido aceptado.</p>
      <p><b>Destino:</b> ${viaje.puntoDestino}</p>
      <p><b>Vehículo Asignado:</b> ${viaje.vehiculo}</p>
      <p>Por favor, no olvides marcar el viaje como "realizado" en la sección "Mis Viajes" una vez que haya concluido.</p>
    `;
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }

    public enviarCorreoFinViaje(email: string, viaje: any) {
    const asunto = `Tu viaje #${viaje.id} ha finalizado`;
    const cuerpoHtml = `
      <h1>¡Viaje Finalizado!</h1>
      <p>Tu viaje para el día <b>${viaje.fecha}</b> a las <b>${viaje.hora}</b> ha sido completado?.</p>
      <p><b>Destino:</b> ${viaje.puntoDestino}</p>
      <p><b>Vehículo Asignado:</b> ${viaje.vehiculo}</p>
      <p>Por favor, no olvides marcar el viaje como "realizado" en la sección "Mis Viajes" una vez que haya concluido.</p>
    `;
    this.enviarPeticionCorreo({ destinatario: email, asunto, cuerpoHtml });
  }
}
