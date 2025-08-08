export const PlantillasCorreo = {

    base: (titulo: string, contenido: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div src="assets/img/logocmpa.png"  style="background-color: #3880ff; color: white; padding: 20px; text-align: center;">
        <h1>${titulo}</h1>
      </div>
      <div style="padding: 20px; line-height: 1.6;">
        ${contenido}
      </div>
      <div style="background-color: #f4f4f4; color: #555; padding: 10px; text-align: center; font-size: 0.8em;">
        <p>Este es un correo generado automáticamente por la aplicación cmpamov by juanVelasquez.</p>
      </div>
    </div>
  `,

  bienvenida: (nombre: string) => `
    <p>¡Hola, ${nombre}!</p>
    <p>Tu cuenta ha sido creada con éxito. Ya puedes empezar a solicitar y gestionar tus viajes.</p>
    <p>¡Gracias por unirte!</p>
  `,

  solicitud: (viaje: any) => `
    <p>Hemos recibido tu solicitud de viaje con destino a <b>${viaje.puntoDestino}</b>.</p>
    <p>Por favor, espere a que su solicitud se revise y apruebe.</p>
    <p>Recibirás una notificación cuando sea aceptada.</p>
  `,

  aceptacion: (viaje: any) => `
    <p>Tu viaje para el día <b>${viaje.fecha}</b> a las <b>${viaje.hora}</b> ha sido aceptado.</p>
    <p><b>Destino:</b> ${viaje.puntoDestino}</p>
    <p><b>Vehículo Asignado:</b> ${viaje.vehiculo}</p>
    <p>Por favor, no olvides marcar el viaje como "realizado" en la sección "Mis Viajes" una vez que haya concluido.</p>
  `,

  rechazo: (viaje: any) => `
    <p>Se ha rechazado tu solicitud de viaje con destino a <b>${viaje.puntoDestino}</b>.</p>
    <p>Por los siguientes motivos: <b>${viaje.motivoRechazo}</b>.</p>
    <p>Puedes agendar un viaje nuevamente en la sección "Solicitar viaje".</p>
    <p>Gracias por tu comprensión.</p>
  `,
  
  notificacionAdmin: (viaje: any) => `
    <p>El usuario <b>${viaje.solicitante}</b> ha creado una nueva solicitud de viaje.</p>
    <ul>
      <li><b>ID de Solicitud:</b> ${viaje.id}</li>
      <li><b>Destino:</b> ${viaje.puntoDestino}</li>
      <li><b>Fecha:</b> ${viaje.fecha}</li>
      <li><b>Hora:</b> ${viaje.hora}</li>
    </ul>
    <p>Por favor, ingrese a la aplicación para revisar, aceptar o rechazar la solicitud en la sección de Viajes Solicitados.</p>
  `,

  reagendamiento: (viaje: any) => `
    <p>Su solicitud #${viaje.id} con destino a <b>${viaje.puntoDestino}</b> ha sido reagendada.</p>
    <p>Motivo del reagendamiento: <b>${viaje.motivoReagendamiento || 'Revisión de disponibilidad'}</b>.</p>
    <p>Por favor, revise la nueva fecha y hora en la aplicación y confirme si es favorable para usted.</p>
  `,

  cargaMasiva: () => `
    <h1>Los viajes fueron cargados de forma exitosa.</h1>
    <p>Revisa tu calendario en la aplicación para poder confirmar los viajes cargados.</p>
    <p>Si tienes algún problema con la carga de viajes, por favor contacta con el administrador.</p>
    <p>Gracias por su comprensión.</p>
  `,
}
