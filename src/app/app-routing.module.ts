import { NgModule }        from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',
    loadComponent: () => 
        import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'bitacora',
    loadComponent: () => 
        import('./bitacora/bitacora.page').then( m => m.BitacoraPage)
  },
  {
    path: 'carga-kilometraje',
    loadComponent: () => 
        import('./carga-kilometraje/carga-kilometraje.page').then( m => m.CargaKilometrajePage)
  },
  {
    path: 'estado-movil',
    loadComponent: () => 
        import('./estado-movil/estado-movil.page').then( m => m.EstadoMovilPage)
  },
  {
    path: 'estado-viaje',
    loadComponent: () => 
        import('./estado-viaje/estado-viaje.page').then( m => m.EstadoViajePage)
  },
  {
    path: 'fin-viaje',
    loadComponent: () => 
        import('./fin-viaje/fin-viaje.page').then( m => m.FinViajePage)
  },
  {
    path: 'home-conductor',
    loadComponent: () => 
        import('./home-conductor/home-conductor.page').then( m => m.HomeConductorPage)
  },
  {
    path: 'inicio-viaje',
    loadComponent: () => 
        import('./inicio-viaje/inicio-viaje.page').then( m => m.InicioViajePage)
  },
  {
    path: 'login',
    loadComponent: () => 
        import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => 
        import('./recuperar-contrasena/recuperar-contrasena.page').then( m => m.RecuperarContrasenaPage)
  },
  {
    path: 'registro-usuario',
    loadComponent: () => 
        import('./registro-usuario/registro-usuario.page').then( m => m.RegistroUsuarioPage)
  },
  {
    path: 'registro-vehiculo',
    loadComponent: () => 
        import('./registro-vehiculo/registro-vehiculo.page').then( m => m.RegistroVehiculoPage)
  },
  {
    path: 'solicitud-viaje',
    loadComponent: () => 
        import('./solicitud-viaje/solicitud-viaje.page').then( m => m.SolicitudViajePage)
  },
  {
    path: 'solicitud-viaje-emergencia',
    loadComponent: () => 
        import('./solicitud-viaje-emergencia/solicitud-viaje-emergencia.page').then( m => m.SolicitudViajeEmergenciaPage)
  },
  {
    path: 'viajes-solicitados',
    loadComponent: () => 
        import('./viajes-solicitados/viajes-solicitados.page').then( m => m.ViajesSolicitadosPage)
  },
  {
    path: 'home',
    loadComponent: () => 
        import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'estado-movil-global',
    loadComponent: () => 
        import('./estado-movil-global/estado-movil-global.page').then( m => m.EstadoMovilGlobalPage)
  },
  {
    path: 'gestion',
    loadComponent: () => 
        import('./gestion/gestion.page').then( m => m.GestionPage)
  },
   {
    path: 'calendario',
    loadComponent: () => import('./calendario/calendario.page').then( m => m.CalendarioPage)
  },
  {
    path: 'mis-viajes',
    loadComponent: () => import('./mis-viajes/mis-viajes.page').then( m => m.MisViajesPage)
  },
   {
    path: 'viajes-masivos',
    loadComponent: () => import('./viajes-masivos/viajes-masivos.page').then( m => m.ViajesMasivosPage)
  },
  {
    path: 'historico-solicitud',
    loadComponent: () => import('./historico-solicitud/historico-solicitud.page').then( m => m.HistoricoSolicitudPage)
  },
   {
    path: 'nueva-contrasena',
    loadComponent: () => import('./nueva-contrasena/nueva-contrasena.page').then( m => m.NuevaContrasenaPage)
  },
    {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./recuperar-contrasena/recuperar-contrasena.page').then( m => m.RecuperarContrasenaPage)
  },
  {
    path: 'programacion',
    loadComponent: () => import('./programacion/programacion.page').then( m => m.ProgramacionPage)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}