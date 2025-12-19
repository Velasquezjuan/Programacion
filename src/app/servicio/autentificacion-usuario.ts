import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Memorialocal } from '../almacen/memorialocal';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs'; 
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router'; 
import { ToastController, AlertController } from '@ionic/angular';


interface LoginResponse {
  message: string;
  token: string;
  usuario: any;
}

export interface NuevoUsuario {
  id:string;
  rut: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  rol: 'adminsistema' | 'conductor' | 'its' | 'solicitante' | 'coordinador';
  correo: string;
}

  @Injectable({
    providedIn: 'root'
  })
  export class AutentificacionUsuario {
  private apiUrl = `${environment.apiUrl}api/auth`;
  private tokenKey = 'auth-token';
  private usuarioActivoSubject = new BehaviorSubject<any | null>(null);
  public usuarioActivo$ = this.usuarioActivoSubject.asObservable();

  // Configuración de tiempos
  private readonly TIEMPO_INACTIVIDAD = 30 * 60 * 1000; // 30 Minutos (tiempo real de inactividad)
  private readonly TIEMPO_ADVERTENCIA = 10 * 1000; // 10 Segundos antes

  private logoutTimer: any;
  private warningTimer: any;
  private inactividadTimer: any;
  private advertenciaTimer: any;

  private listener: () => void;

  private alertaCuentaRegresiva: HTMLIonAlertElement | null = null;

  constructor( 
    private http: HttpClient,
    private router: Router, 
    private toastController: ToastController,
    private alertController: AlertController,
    private ngZone: NgZone
  ) {
    this.listener = () => this.reiniciarConteo();
     this.cargarUsuarioInicial();
  }

  /** Obtiene todos los usuarios */
  public getUsuarios(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/usuarios`);  
}

/** Busca un usuario por su RUT */
  buscarUsuarioPorRut(rut: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/buscar-por-rut`, { rut });
}

/** Carga el usuario activo desde el almacenamiento local */
  async cargarUsuarioInicial() {
    const token = await Memorialocal.obtenerValor<string>('token');
    if (token && this.tokenEsValido(token)) {
        const usuario = await Memorialocal.obtenerValor('usuarioActivo');
        this.usuarioActivoSubject.next(usuario);
        this.autoLogout(token);
        this.iniciarDeteccionInactividad();
    } else {
      
        this.logout(null); 
    }
  }

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      switchMap(async (response) => {
        
        await Memorialocal.guardarValor('token', response.token);
        await Memorialocal.guardarValor('usuarioActivo', response.usuario);
        this.usuarioActivoSubject.next(response.usuario);
        this.iniciarDeteccionInactividad();
        return response;
      }),
      catchError(error => {
        console.error('Error en el login de la API:', error);
        return throwError(() => error);
      })
    );
  }

  /** Login local usando Memorialocal */
  private async loginLocal(correo: string, contrasena: string): Promise<any> {
    const todos = await Memorialocal.obtener<NuevoUsuario>('usuarios') || [];
    const usuario = todos.find(u => u.correo === correo);
    
    if (!usuario || usuario.contraseña !== contrasena) {
      throw new Error('Credenciales locales inválidas.');
    }

    const { contraseña: _, ...usuarioParaSesion } = usuario;
    await Memorialocal.guardarValor('usuarioActivo', usuarioParaSesion);
    this.usuarioActivoSubject.next(usuarioParaSesion);
    return { message: 'Login local exitoso', usuario: usuarioParaSesion };
  }

  /** Registro de nuevo usuario online con respaldo offline*/
  registrarUsuario(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro-usuario`, datosUsuario);
  }

  /**  Cerrar secion (logout) **/
 async logout(mensaje: string | null = null): Promise<void> {
    // Detenemos la detección de inactividad
    this.detenerDeteccionInactividad();

    //  Limpiamos cualquier temporizador pendiente para que no se dupliquen
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Borramos datos
    await Memorialocal.eliminarValor('token');
    await Memorialocal.eliminarValor('usuarioActivo');
    this.usuarioActivoSubject.next(null);

    //  Redirigimos INMEDIATAMENTE al login
    this.router.navigate(['/login']);

    //  Mostramos mensaje si existe
    if (mensaje) {
      this.mostrarMensajeExpiracion(); 
    }
  }

 /**  Cerrar secion de forma automatizada (logout) **/
  private autoLogout(token: string) {
    const decodedToken: any = jwtDecode(token);
    const expiracionMs = decodedToken.exp * 1000; 
    const ahoraMs = new Date().getTime();
    
    const tiempoRestante = expiracionMs - ahoraMs;

    if (tiempoRestante <= 0) {
      this.logout('Su sesión ha expirado.');
      return;
    }

    console.log(`Cierre de sesion programado en: ${tiempoRestante / 1000}  ${new Date(expiracionMs)} `);

    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    //  TIMER DE ADVERTENCIA (10 segundos antes de morir)
    // Solo lo configuramos si queda suficiente tiempo (más de 12 segundos)
    if (tiempoRestante > 10000) {
      this.warningTimer = setTimeout(() => {
        this.mostrarToast('Tu sesión se cerrará en 10 segundos por inactividad.', 'danger', 10000);
      }, tiempoRestante - 10000); // Se dispara 10 seg antes del final
    }

    //  TIMER DE CIERRE DE SESIÓN 
    this.logoutTimer = setTimeout(() => {
      this.logout('Sesión cerrada por inactividad.');
    }, tiempoRestante);
  }
  
  /** Obtiene el token guardado */
  getToken(): Promise<string | null> {
    return Memorialocal.obtenerValor('token');
  }

  /** Usuario activo ( Memorialocal) */
  obtenerUsuarioActivo(): Promise<any | null> {
    return Memorialocal.obtenerValor('usuarioActivo');
  }
  
  /** ve rificacion del token es valido y no ha expirado */
  async estaLogeado(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
        return false;
    }

    if (!this.tokenEsValido(token)) {
        await this.logout(); 
        this.mostrarMensajeExpiracion(); 
        return false;
    }
    return true;
  }

  /** Verifica si el token es válido y no ha expirado  */
  private tokenEsValido(token: string | null): boolean {
    if (!token) {
      return false;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      const expiracion = decodedToken.exp * 1000; 
      return expiracion > new Date().getTime();
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return false;
    }
  }

  /** Inicia los escuchadores de eventos (clicks, teclas, mouse) */
  private iniciarDeteccionInactividad() {
    this.ngZone.runOutsideAngular(() => {
      // Escuchamos eventos globales
      window.addEventListener('click', this.listener);
      window.addEventListener('keydown', this.listener);
      window.addEventListener('mousemove', this.listener);
      window.addEventListener('scroll', this.listener);
      window.addEventListener('touchstart', this.listener); // Para móviles
    });

    // Arrancamos el primer conteo
    this.reiniciarConteo();
  }

  /** Se ejecuta cada vez que el usuario hace algo */
  private reiniciarConteo() {
    //  Limpiamos los timers anteriores (cancelamos el logout pendiente)
   clearTimeout(this.inactividadTimer);
    clearTimeout(this.advertenciaTimer);

    // Cerramos la alerta de cuenta regresiva si está abierta
    if (this.alertaCuentaRegresiva) {
      this.alertaCuentaRegresiva.dismiss();
      this.alertaCuentaRegresiva = null; 
    }

    // Iniciamos nuevos timers
    this.ngZone.run(() => {
      
      // Timer de Advertencia (29 minutos y 50 segundos)
      this.advertenciaTimer = setTimeout(() => {
        this.mostrarAlertaConteo();
      }, this.TIEMPO_INACTIVIDAD - this.TIEMPO_ADVERTENCIA);

      // Timer de Logout Final (30 minutos exactos)
      this.inactividadTimer = setTimeout(() => {
        this.logout('Sesión cerrada por falta de actividad.');
      }, this.TIEMPO_INACTIVIDAD);

    });
  }

  /** Detiene la escucha de eventos (se usa al cerrar sesión) */
  private detenerDeteccionInactividad() {
    clearTimeout(this.inactividadTimer);
    clearTimeout(this.advertenciaTimer);

    // Cerramos la alerta de cuenta regresiva si está abierta
    if (this.alertaCuentaRegresiva) {
      this.alertaCuentaRegresiva.dismiss();
      this.alertaCuentaRegresiva = null;
    }
    
    window.removeEventListener('click', this.listener);
    window.removeEventListener('keydown', this.listener);
    window.removeEventListener('mousemove', this.listener);
    window.removeEventListener('scroll', this.listener);
    window.removeEventListener('touchstart', this.listener);
  }

  /**Muestra una alerta con cuenta regresiva antes del logout */ 
  async mostrarAlertaConteo() {
    // Si ya hay una alerta, no creamos otra
    if (this.alertaCuentaRegresiva) return;

    let segundosRestantes = 10;

    this.alertaCuentaRegresiva = await this.alertController.create({
      header: 'Cierre de Sesión Inminente',
      subHeader: 'Por inactividad',
      message: `Tu sesión se cerrará en ${segundosRestantes} segundos.`,
      backdropDismiss: false, // Evita que se cierre haciendo clic afuera
      buttons: [
        {
          text: 'Seguir conectado',
          handler: () => {
            this.reiniciarConteo(); // Si pulsa el botón, reiniciamos todo
          }
        }
      ],
      cssClass: 'alerta-peligro' // para darle estilo rojo si quieres
    });

    await this.alertaCuentaRegresiva.present();

    // Iniciamos el intervalo para actualizar el mensaje cada segundo
    const intervalo = setInterval(() => {
      segundosRestantes--;
      
      // Actualizamos el mensaje de la alerta visible
      if (this.alertaCuentaRegresiva) {
        this.alertaCuentaRegresiva.message = `Tu sesión se cerrará en ${segundosRestantes} segundos.`;
      }

      // Si llega a 0 o la alerta se cerró (porque el usuario se movió), paramos
      if (segundosRestantes <= 0 || !this.alertaCuentaRegresiva) {
        clearInterval(intervalo);
      }
    }, 1000);
  }

  /** muestra el mensaje dado en cada funcion */
  private async mostrarToast(mensaje: string, color: string, duration: number = 4000) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duration,
      color: color,
      position: 'top',
      icon: 'time-outline'
    });
    await toast.present();
  }

  /** entrega el mensaje solamente de la validacion del token expirado  */
  async mostrarMensajeExpiracion() {
    const toast = await this.toastController.create({
      message: 'Su sesión ha expirado por inactividad (30 min). Por favor, ingrese nuevamente.',
      duration: 7000,
      color: 'warning',
      position: 'top',
      icon: 'time-outline'
    });
    await toast.present();
  }
  }