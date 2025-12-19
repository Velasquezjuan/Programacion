import { SolicitudViajePage } from "../solicitud-viaje/solicitud-viaje.page";

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
        <p>Este es un correo generado automáticamente por la aplicación Gemovil by jv.</p>
      </div>
    </div>
  `,

  /*bienvenida: (nombre: string) => `
    <p>¡Hola, ${nombre}!</p>
    <p>Bienvenido a GEMOVIL, el sistema para poder administrar tus viajes de la CMPA.</p>
    <p>Estamos encantados de tenerte a bordo y esperamos que disfrutes de una experiencia fluida y eficiente al gestionar tus viajes con nosotros.</p>
    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
    <p>Por favor genere su contraseña inicial haciendo clic en el siguiente enlace:</p>
    <p><a href="http:172.30.0.9:3000/recuperar-contrasena">Generar Contraseña Inicial</a></p>
    <p>¡Gracias por unirte!</p>
  `,*/

  solicitud: (viaje: any) => `
    <p>Hemos recibido tu solicitud de viaje con destino a <b>${viaje.punto_destino}</b>.</p>
    <p>Por favor, espere a que su solicitud se revise y apruebe.</p>
    <p>Recibirás una notificación cuando sea aceptada.</p>
  `,

  aceptacion: (viaje: any) => `
    <p>Tu viaje para el día <b>${viaje.fecha_viaje}</b> a las <b>${viaje.hora_inicio}</b> ha sido aceptado.</p>
    <p><b>Destino:</b> ${viaje.punto_destino}</p>
    <p><b>Vehículo Asignado:</b> ${viaje.patenteVehiculo}</p>
    <p><b>Conductor:</b> ${viaje.nombreConductor}</p>
    <p>Por favor, no olvides marcar el viaje como "realizado" en la sección "Mis Viajes" una vez que haya concluido.</p>
  `,

  rechazo: (viaje: any) => `
    <p>Se ha rechazado tu solicitud de viaje con destino a <b>${viaje.punto_destino}</b>.</p>
    <p>Por los siguientes motivos: <b>${viaje.motivo_rechazo}</b>.</p>
    <p>Puedes agendar un viaje nuevamente en la sección "Solicitar viaje".</p>
    <p>Gracias por tu comprensión.</p>
  `,
  
  notificacionAdmin: (viaje: any) => `
    <p>El usuario <b>${viaje.nombre}</b> ha creado una nueva solicitud de viaje.</p>
    <ul>
      <li><b>ID de Solicitud:</b> ${viaje.id_viaje}</li>
      <li><b>Destino:</b> ${viaje.punto_destino}</li>
      <li><b>Fecha:</b> ${viaje.fecha_viaje}</li>
      <li><b>Hora:</b> ${viaje.hora_inicio}</li>
      <li><b>Responsable:</b> ${viaje.responsable}</li>
    </ul>
    <p>Por favor, ingrese a la aplicación para revisar, aceptar o rechazar la solicitud en la sección de Viajes Solicitados.</p>
  `,

  reagendamiento: (viaje: any) => `
    <p>Su solicitud #${viaje.id_viaje} con destino a <b>${viaje.punto_destino}</b> ha sido reagendada.</p>
    <p>Motivo del reagendamiento: <b>${viaje.motivo_reagendamiento || 'Revisión de disponibilidad'}</b>.</p>
    <p>Por favor, revise la nueva fecha y hora en la aplicación y confirme si es favorable para usted.</p>
  `,

  cargaMasiva: () => `
    <h1>Los viajes fueron cargados de forma exitosa.</h1>
    <p>Revisa tu calendario en la aplicación para poder confirmar los viajes cargados.</p>
    <p>Si tienes algún problema con la carga de viajes, por favor contacta con el administrador.</p>
    <p>Gracias por su comprensión.</p>
  `,

  viajeRealizado: (viaje: any ) => `
    <h1>Gracias por Aceptar su viaje <b>#${viaje.id_viaje} </b> </h1>
    <p>Nos alegra saber que su viaje fue realizado con exito.</p>
    <p>Gracias por su apoyo.</p>
  `,

  viajeNoRealizado: (viaje: any) => `
    <h1>Viaje No Realizado #${viaje.id_viaje}</h1>
    <p>Hemos registrado que el viaje con destino a <b>${viaje.punto_destino}</b> 
    no fue realizado.</p>
    <p>No olvide que puede agendar su viaje en la sección "Solicitar Viaje".</p>
    <p>Gracias por su comprensión.</p>
  `,

  aceptacionReagendamiento: (viaje: any) => `
    <p>Su solicitud #${viaje.id_viaje} ha sido reagendada y aceptada.</p>
    <p>Nueva fecha es: <b>${viaje.fecha_viaje}</b>.</p>
    <p>Nueva hora es: <b>${viaje.hora_inicio}</b>.</p>
    <p>Por favor, revise la nueva fecha y hora en la aplicación y confirme si es favorable para usted.</p>
  `,
  rechazoReagendamiento: (viaje: any) => `
    <p>Su solicitud #${viaje.id_viaje} ha sido reagendada y rechazada.</p>
    <p>Motivo del rechazo: <b>${viaje.motivo_rechazo}</b>.</p>
    <p>Por favor, ingrese a la aplicación para agendar un nuevo viaje en la sección de "Solicitar Viaje".</p>
  `,

  vehiculoRegistrado: (vehiculo: any) => `
    <p>El vehículo con la patente <b>${vehiculo.patente}</b> 
    ha sido registrado exitosamente.</p>
    <p>Gracias por mantener actualizada la información de los vehículos.</p>
  `,
  vencimientoRevisionTecnica: (vehiculo: any) => `
    <p>El vehículo con la patente <b>${vehiculo.patente}</b> tiene la revisión técnica vencida desde el <b>${vehiculo.fechaRevision}</b>.</p>
    <p>Por favor, actualice la revisión técnica lo antes posible para asegurar la seguridad y cumplimiento de las normativas.</p>
  `,
  vencimientoSeguro: (vehiculo: any) => `
    <p>El vehículo con la patente <b>${vehiculo.patente}</b> tiene el seguro vencido desde el <b>${vehiculo.fechaSeguro}</b>.</p>
    <p>Por favor, actualice el seguro lo antes posible para asegurar la seguridad y cumplimiento de las normativas.</p>
  `,
  vencimientoContrato: (vehiculo: any) => `
    <p>El contrato asociado al vehículo con la patente <b>${vehiculo.patente}</b> ha vencido el <b>${vehiculo.fechaContrato}</b>.</p>
    <p>Por favor, renueve el contrato lo antes posible para asegurar la continuidad del servicio.</p>
  `,
  vencimientoPermisoCirculacion: (vehiculo: any) => `
    <p>El vehículo con la patente <b>${vehiculo.patente}</b> tiene el permiso de circulación vencido desde el <b>${vehiculo.fechaPermisoCirculacion}</b>.</p>
    <p>Por favor, actualice el permiso de circulación lo antes posible para asegurar la seguridad y cumplimiento de las normativas.</p>
  `,
}
