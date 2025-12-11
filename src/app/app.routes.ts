import { Routes } from '@angular/router';
import { AuthGuard } from './servicio/auth.guard';

export const routes: Routes = [

  //-- Rutas publicas sin proteccion AuthGuard -- 
 {
    path: '',
    redirectTo: 'login', 
    pathMatch: 'full',
  },
   {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./recuperar-contrasena/recuperar-contrasena.page').then( m => m.RecuperarContrasenaPage)
  },
   {
    path: 'nueva-contrasena',
    loadComponent: () => import('./nueva-contrasena/nueva-contrasena.page').then( m => m.NuevaContrasenaPage)
  },

  //-- Rutas privadas con proteccion AuthGuard --
   {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'mis-viajes',
    loadComponent: () => import('./mis-viajes/mis-viajes.page').then( m => m.MisViajesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'inicio-viaje',
    loadComponent: () => import('./inicio-viaje/inicio-viaje.page').then( m => m.InicioViajePage),
    canActivate: [AuthGuard]
  },

    {
    path: 'fin-viaje',
    loadComponent: () => import('./fin-viaje/fin-viaje.page').then( m => m.FinViajePage),
    canActivate: [AuthGuard]
  },

  // -- Rutas Solicitudes de Viajes con roles --
  {
    path: 'solicitud-viaje',
    loadComponent: () => import('./solicitud-viaje/solicitud-viaje.page').then( m => m.SolicitudViajePage),
    canActivate: [AuthGuard],
    data: { roles: ['solicitante', 'coordinador', 'adminSistema', 'its'] }
  },
  {
    path: 'solicitud-viaje-emergencia',
    loadComponent: () => import('./solicitud-viaje-emergencia/solicitud-viaje-emergencia.page').then( m => m.SolicitudViajeEmergenciaPage),
    canActivate: [AuthGuard],
    data: { roles: ['solicitante', 'coordinador', 'adminSistema', 'its'] }
  },

  {
    path: 'viajes-masivos',
    loadComponent: () => import('./viajes-masivos/viajes-masivos.page').then( m => m.ViajesMasivosPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },



  // -- administracion y gestion por roles --
{
    path: 'gestion',
    loadComponent: () => import('./gestion/gestion.page').then( m => m.GestionPage), 
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'registro-usuario',
    loadComponent: () => import('./registro-usuario/registro-usuario.page').then( m => m.RegistroUsuarioPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema'] } 
  },
  {
    path: 'registro-vehiculo',
    loadComponent: () => import('./registro-vehiculo/registro-vehiculo.page').then( m => m.RegistroVehiculoPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'viajes-solicitados',
    loadComponent: () => import('./viajes-solicitados/viajes-solicitados.page').then( m => m.ViajesSolicitadosPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'viajes-masivos',
    loadComponent: () => import('./viajes-masivos/viajes-masivos.page').then( m => m.ViajesMasivosPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
 {
    path: 'bitacora',
    loadComponent: () => import('./bitacora/bitacora.page').then( m => m.BitacoraPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'calendario',
    loadComponent: () => import('./calendario/calendario.page').then( m => m.CalendarioPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'programacion',
    loadComponent: () => import('./programacion/programacion.page').then( m => m.ProgramacionPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
  {
    path: 'historico-solicitud',
    loadComponent: () => import('./historico-solicitud/historico-solicitud.page').then( m => m.HistoricoSolicitudPage),
    canActivate: [AuthGuard],
    data: { roles: ['adminSistema', 'coordinador'] }
  },
 

  //-- vistas extras a futuro --
  {
    path: 'home-conductor',
    loadComponent: () => import('./home-conductor/home-conductor.page').then( m => m.HomeConductorPage),
    canActivate: [AuthGuard],
    data: { roles: ['conductor', 'adminSistema'] }
  },
  {
    path: 'carga-kilometraje',
    loadComponent: () => import('./carga-kilometraje/carga-kilometraje.page').then( m => m.CargaKilometrajePage),
    canActivate: [AuthGuard],
    data: { roles: ['conductor', 'adminSistema'] }
  },
  {
    path: 'estado-movil',
    loadComponent: () => import('./estado-movil/estado-movil.page').then( m => m.EstadoMovilPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'estado-viaje',
    loadComponent: () => import('./estado-viaje/estado-viaje.page').then( m => m.EstadoViajePage), 
    canActivate: [AuthGuard]
  },

  {
    path: 'estado-movil-global',
    loadComponent: () => import('./estado-movil-global/estado-movil-global.page').then( m => m.EstadoMovilGlobalPage),
    canActivate: [AuthGuard]
  },
  // -- -- NUEVAS RUTAS SIN PROTECIO Y RECIEN AGREGADAS SOLO DEBES MOVERLAS  - 

];
