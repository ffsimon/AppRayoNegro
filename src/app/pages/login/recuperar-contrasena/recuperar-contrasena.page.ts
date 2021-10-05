import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { UtilitiesService } from '../../../services/utilities.service';
import { ValidacionContrasena } from 'src/app/services/validar-contrasenia';
import { WebRayoService } from 'src/app/services/web-rayo.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
})
export class RecuperarContrasenaPage implements OnInit {

  get correoContacto() {
    return this.formVerificaCorreo.get("correoContacto");
  }

  get codigo() {
    return this.formVerificaCodigo.get("codigo");
  }

  get contrasenia() {
    return this.formRestableceContrasenia.get("contrasenia");
  }

  get confirmacionContrasenia() {
    return this.formRestableceContrasenia.get("confirmacionContrasenia");
  }

  public mensajesValidacion = {
    correoContacto: [
      // { type: "required", message: "Ingresa tu correo electrónico." },
      { type: "pattern", message: "Ingresa tu correo electrónico." },
    ],
    codigo: [
      { type: "required", message: "Ingresa tu código de seguridad." },
      { type: "pattern", message: "Introduce sólo números." },
    ],
    contrasenia: [
      { type: "required", message: "Escriba una contraseña." },
    ],
    confirmacionContrasenia: [
      { type: "required", message: "Repita su contraseña." },
    ],
  };

  public formVerificaCorreo: FormGroup = this.formBuilder.group({
    correoContacto: [
      "",
      [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
      ],
    ],
  });

  public formVerificaCodigo: FormGroup = this.formBuilder.group({
    codigo: ["", [Validators.required, Validators.pattern("^[0-9]+$")]],
  });

  public formRestableceContrasenia: FormGroup = this.formBuilder.group(
    {
      contrasenia: [
        "",
        Validators.required,
      ],
      confirmacionContrasenia: ["", Validators.required],
    },
    {
      validator: ValidacionContrasena.compararPassword,
    }
  );

  public step: number = 1;
  private correoRecuperacion: string;
  public mensajeErrorCodigo: string = "";
  public mensajeErrorCorreo: string = "";
  private codigoVerificacion: string = null;
  private informacionUsuario;
  public mensajeErrorCambioContrasenia: string = "";
  public mensajeError: string = "";
  public numeroIntentos: number = 0;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(
    private navCtrl: NavController,
    private WebRayoService: WebRayoService,
    private formBuilder: FormBuilder,
    private utilitiesService: UtilitiesService
  ) { }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ngOnInit() { }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async recuperarContrasenia() {
    this.mensajeErrorCorreo = "";
    if (this.formVerificaCorreo.valid) {
      let loading = await this.utilitiesService.loadingAsync();
      loading.present();
      this.correoRecuperacion = this.formVerificaCorreo.value.correoContacto;
      let params = {
        tbl_usuario_correo_electronico: this.correoRecuperacion,
      }
      let url = "usuarios/Usuario/RecuperarCuentaMovil";
      let respuestaCodigo = await this.WebRayoService.postAsync(url, params)
      if (!respuestaCodigo) {
        this.mensajeErrorCorreo = "Ocurrió un error, inténtelo más tarde."
      } else {
        this.step = 2;
      }
      loading.dismiss();
    } else {
      this.mensajeErrorCorreo = "Ingrese su correo de contacto";
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async verificarCodigo() {
    if (this.formVerificaCodigo.valid) {
      this.mensajeErrorCodigo = "";
   
      let verificacionCuenta = {
        tbl_usuario_correo_electronico: this.correoRecuperacion, 
        tbl_usuario_codigo_recuperar_cuenta: this.formVerificaCodigo.value.codigo 
      }
      let url = "Usuarios/Usuario/ValidacionRecuperarCuentaMovil";
      
      let respuestaInformacionUsuario = await this.WebRayoService.postAsync(url, verificacionCuenta);
      if (respuestaInformacionUsuario != null && respuestaInformacionUsuario.response != null && respuestaInformacionUsuario.response.length != 0) {
        this.informacionUsuario = respuestaInformacionUsuario.response[0]
      }

      if (respuestaInformacionUsuario == 1) {
        this.step = 3;
      } else {
        this.mensajeErrorCodigo = "El código de verificacion es inválido ó ha expirado.";
        this.numeroIntentos++;
        if (this.numeroIntentos == 3) {
          this.navCtrl.navigateRoot("login");
        }
      }
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async restablecerContrasenia() {

    if(this.formRestableceContrasenia.value.contrasenia.trim() == ''){
      this.mensajeErrorCambioContrasenia = "Ingresa tu contraseña sin espacios";
      return;
    }

    if (
      this.formRestableceContrasenia.valid &&
      !this.contrasenia.errors &&
      !this.confirmacionContrasenia.errors
    ) {
      let nuevaContrasenia = {
        usuario_email: this.correoRecuperacion,
        usuario_contrasenia: this.formRestableceContrasenia.value.contrasenia.trim(),
      };
      let url = "Usuarios/Usuario/PutPC";
      let respuestaNuevaContrasenia = await this.WebRayoService.putAsync(
        url,
        nuevaContrasenia
      );
      if (
        respuestaNuevaContrasenia == null ||
        respuestaNuevaContrasenia.success == false
      ) {
        this.mensajeErrorCambioContrasenia = "Ocurrió un error, inténtelo nuevamente.";
        return;
      }
      this.utilitiesService.alert('', 'Tu contraseña se ha cambiado con éxito');
      this.navCtrl.navigateRoot("login");
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irLogin() {
    this.navCtrl.navigateRoot("login");
  }

}
