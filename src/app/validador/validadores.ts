import { AbstractControl, ValidationErrors } from "@angular/forms";

export class Validadores {

    // Validador de RUT chileno con puntos y guión (formato: 12.345.678-5)
    static validarRut(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;
      
        const rawValue = String(control.value).trim();
        const rut = rawValue.replace(/\./g, '').replace('-', '');
      
        if (rut.length < 8) return { validarRut: true };
      
        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1).toUpperCase();
      
        let suma = 0;
        let multiplo = 2;
      
        for (let i = cuerpo.length - 1; i >= 0; i--) {
          suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
          multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }
      
        const dvEsperado = 11 - (suma % 11);
        let dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
      
        return dvFinal === dv ? null : { validarRut: true };
      }
 
  
    // Validador de texto (solo letras y espacios)
    static soloTexto(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(control.value) ? null : { textoInvalido: true };
    }

    //Validador de contrasena(numero, letra y caracter especial)
    static contra(control: AbstractControl): ValidationErrors | null  {
      const valor = control.value;
      if (!valor) return null;

      if (valor.length !== 6) {
        return { longitudIncorrecta: true };
      }

      const tieneLetra = /[a-zA-Z]/.test(valor);
      const tieneNumero = /[0-9]/.test(valor);
      const tieneSimbolo = /[!"#$%&/()=?¡]/.test(valor);

      if (!tieneLetra || !tieneNumero || !tieneSimbolo) {
        return { claveInsegura: true };
      }

      return null;
    }
  
    // Validador de número de teléfono chileno (formato general)
    static telefono(control: any): ValidationErrors  | null {
      if (!control.value) return null;
      const regex = /^(\+?56)?(\s?9\s?)?[98765432]\d{8}$/;
      return regex.test(control.value) ? null : { telefonoInvalido: true };
    }
  
    // Validador de correo electrónico para que tenga el dominio @cmpuentealto.cl
    static correoValido(control: any): ValidationErrors  | null {
      if (!control.value) return null;
      const regex = /^[a-zA-Z]+\.[a-zA-Z]+@cmpuentealto.cl$/;
      return regex.test(control.value) ? null : { correoInvalido: true };
    }

    // Validador de patente estándar chilena: 4 letras y 2 números sin guiones ni espacios
  static validarPatente(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;

    if (!valor) return null;

    // Remover espacios y convertir a mayúsculas para validar correctamente
    const patente = valor.toUpperCase().trim();

    // Expresión regular: 4 letras (A-Z) seguidas de 2 dígitos (0-9)
    const regex = /^[A-Z]{4}[0-9]{2}$/;

    return regex.test(patente) ? null : { patenteInvalida: true };
  }

  validarMaximoProgramas(event: any) {
    if (event.detail.value.length > 2) {
      event.target.value = event.detail.value.slice(0, 2);
    }
  }
  
  validarPatente(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const regex = /^[A-Z]{4}\d{2}$/;
    return value && !regex.test(value) ? { patenteInvalida: true } : null;
  }
  
  }
  