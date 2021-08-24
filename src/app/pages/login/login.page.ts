import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, NavController, Platform } from '@ionic/angular';
import { const_jwt_credentials } from 'src/app/constants';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('inputPassword', { static: false }) inputPassword: IonInput;
  public usuarioSesion: usuario_sesion_model;
  public verContrasena: boolean = false;
  public mensajeError: string = "";
  public form: FormGroup = this.formBuilder.group({
    usuario: ["", Validators.required],
    contrasenia: ["", Validators.required]
  });

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, private platform: Platform,
     public webRayoService: WebRayoService, public geolocationService: GeolocationService,
     public utilitiesService: UtilitiesService) { 
      this.usuarioSesion = JSON.parse(sessionStorage.getItem("usuario_sesion"));
      if(this.usuarioSesion != null){
        this.navCtrl.navigateRoot("home");
      }
      console.log(this.usuarioSesion)
    }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    
    this.platform.ready().then(platform => {
      console.log("entramos a platform ready")
      if(this.platform.is("android")){
        console.log("entramos a platform android")
        this.geolocationService.checkGPSPermission();
      }
    })

    let loading = await this.utilitiesService.loadingAsync();
    loading.present();

     let temporalTokenJWT = await this.obtenerTokenJWTAsync(const_jwt_credentials);
     if (temporalTokenJWT == null) {
      // this.mensajeError = "i18n_ERROR.err_general";
      loading.dismiss();
      return;
    }
    // Guardamos el token genérico para hacer la petición al login (Ojo este no es el token final);
    localStorage.setItem("token_jwt", temporalTokenJWT);
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async iniciarSesion() {

    console.log(this.form.valid)
    this.mensajeError = "";
    if(!this.form.valid){
      return;
    }
  
    let loading = await this.utilitiesService.loadingAsync();
    loading.present();

    let params = {
      // sesion_usuario: this.form.value.usuario.toLowerCase().trim(),
      sesion_usuario: this.form.value.usuario.trim(),
      sesion_contrasenia: this.form.value.contrasenia
    };

    let respuesta: any = await this.webRayoService.postAsync("Usuarios/UsuarioSesion/Get", params);
   
    if (respuesta == null || respuesta.success == false || respuesta.response == null || respuesta.response.length == 0) {
      this.mensajeError = "Usuario o contraseña incorrectos"
      loading.dismiss();
      return;
    }
    let usuario_sesion: usuario_sesion_model = respuesta.response[0];
    localStorage.setItem("token_jwt", usuario_sesion.auth_token);
    sessionStorage.setItem("usuario_sesion", JSON.stringify(usuario_sesion));
    this.navCtrl.navigateRoot("home");
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public mostrarContrasena() {
    if (this.verContrasena) this.verContrasena = false;
    else this.verContrasena = true;
    this.inputPassword.type = this.verContrasena ? 'text' : 'password';
    this.inputPassword.autofocus;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerTokenJWTAsync(user_jwt_token: any) {
    let url = "Authenticate/authenticate/authenticate";
    let respuesta: any = await this.webRayoService.postAsync(url, user_jwt_token);
    console.log(respuesta)
    if (respuesta == null || respuesta.token == null) {
      return null;
    }

    return respuesta.token;
  } 


}
