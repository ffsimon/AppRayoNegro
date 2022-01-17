import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput, NavController, Platform } from '@ionic/angular';
import { const_jwt_credentials } from 'src/app/constants';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';
import { AppComponent } from 'src/app/app.component';
import { Device } from '@awesome-cordova-plugins/device/ngx';

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
  public idNotificacion: string = null;
  public sliderOne: any;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, private platform: Platform,
     public webRayoService: WebRayoService, 
     public geolocationService: GeolocationService,
     public utilitiesService: UtilitiesService,
     public appComponent: AppComponent,
     private device: Device) { 
    this.sliderOne = {
      initialSlide: 0,
      slidesPerView: 1,
      speed: 400,
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
      },
      slidesItems: []
    };
      this.usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion"));
      if(this.usuarioSesion != null){
        this.navCtrl.navigateRoot("home");
      }
    }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    
    this.platform.ready().then(platform => {
      console.log("entramos a platform ready")
      if(this.platform.is("android")){
        console.log("entramos a platform android")
        this.geolocationService.checkGPSPermission();
        console.log(device.cordova, device.model, device.platform, device.uuid, device.version, device.manufacturer, device.isVirtual, device.serial)
      }
    })
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async iniciarSesion() {

    console.log(this.form.valid)
    this.mensajeError = "";
    if(!this.form.valid){
      return;
    }

    localStorage.removeItem('direccionLocal');
    localStorage.removeItem('coordenadas');
    
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
    
    // borrar
    // usuario_sesion.tbl_bandera_offline = 1;
    // console.log(usuario_sesion)
    // borrar

    localStorage.setItem("token_jwt", usuario_sesion.auth_token);
    localStorage.setItem("usuario_sesion", JSON.stringify(usuario_sesion));

    // si tiene la bandera tbl_bandera_offline, entonces vamos a descargar y guardar los catalogos
    if(usuario_sesion.tbl_bandera_offline == 1){
      await this.obtenerBaners();
      await this.obtenerCompetencia();
      await this.obtenerListaComunicacion();
      await this.obtenerListaLocalizacion();
      await this.obtenerTipoComercion();
      await this.obtenerSubtipoComercio();
    }
    
    //ingresamos el id de la notificacion
    this.idNotificacion =  this.appComponent.oneSignalUserId;
    if(this.idNotificacion != null){
      this.agregarIdNotificacionUsuario(usuario_sesion.user_id, this.idNotificacion);
    }
    
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

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async agregarIdNotificacionUsuario(userId,idNoticacion: string){
    let url = "Usuarios/Usuario/Put";
    let objetoUsuario = {
      usuario_id: userId,
      usuario_token_notificacion: idNoticacion
    }
    let respuesta: any = await this.webRayoService.putAsync(url, objetoUsuario);
    console.log(respuesta)
    if (respuesta == null || respuesta.token == null) {
      return null;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irRecuperarCuenta(){
    this.navCtrl.navigateRoot('recuperar-cuenta');
  }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerListaComunicacion(){
      const params = this.webRayoService.fromObjectToGETString({
        cagenerico_ca_tipo_id: 4,
        cagenerico_ca_tipo_activo: 1
      });
      const url = 'Catalogos/CatalogoGenerico/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("subListaTipoComunicacion", null);
      } else {
        localStorage.setItem("subListaTipoComunicacion", JSON.stringify(respuesta.response));
      }
    }
  
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerListaLocalizacion(){
      const params = this.webRayoService.fromObjectToGETString({
        cagenerico_ca_tipo_id: 5,
        cagenerico_ca_tipo_activo: 1
      });
      const url = 'Catalogos/CatalogoGenerico/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("subListaTipoLocalizacion", null);
      } else {
        localStorage.setItem("subListaTipoLocalizacion", JSON.stringify(respuesta.response));
      }
    }
  
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerBaners(){
      const params = this.webRayoService.fromObjectToGETString({
        cagenerico_ca_tipo_id: 2,
        cagenerico_ca_tipo_activo: 1
      });
      const url = 'Catalogos/CatalogoGenerico/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("slidesItems", null);
      } else {
        this.sliderOne.slidesItems = respuesta.response;
        for (let i = 0; i < this.sliderOne.slidesItems.length; i++) {
          this.sliderOne.slidesItems[i].seleccionado = false;
          this.sliderOne.slidesItems[i].fotoBase64 = '';
          localStorage.setItem("slidesItems", JSON.stringify(this.sliderOne));
        }
      }
    }
  
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerCompetencia(){
      const params = this.webRayoService.fromObjectToGETString({
        cagenerico_ca_tipo_id: 6,
        cagenerico_ca_tipo_activo: 1
      });
      const url = 'Catalogos/CatalogoGenerico/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("listaCompetencia", null);
      } else {
        for (let i = 0; i < respuesta.response.length; i++) {
          let hijoCompetencia =  await this.obtenerCompetenciaCaracteristica(respuesta.response[i].cagenerico_clave);
          respuesta.response[i].arregloHijos = hijoCompetencia;
         }
        localStorage.setItem("listaCompetencia", JSON.stringify(respuesta.response));
      }
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerTipoComercion(){
      const params = this.webRayoService.fromObjectToGETString({
        cagenerico_ca_tipo_id: 1,
        cagenerico_ca_tipo_activo: 1
      });
      const url = 'Catalogos/CatalogoGenerico/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("tipoComercio", null);
      } else {
        localStorage.setItem("tipoComercio", JSON.stringify(respuesta.response));
      }
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerCompetenciaCaracteristica(idPadre:number){
      const params = this.webRayoService.fromObjectToGETString({
        crelacion_id_padre: idPadre,
        crelacion_activo: 1
      });
      const url = 'Catalogos/CatalogoArbol/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
       return [];
      } else {
        for (let i = 0; i < respuesta.response.length; i++) {
          respuesta.response[i].estatus = false;
        }
        return respuesta.response;
      }
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerSubtipoComercio(){
      let listaTipoComercio = JSON.parse(localStorage.getItem("tipoComercio"));
      
      if(listaTipoComercio == null){
        return;
      }
      
      console.log(listaTipoComercio);
      const params = this.webRayoService.fromObjectToGETString({
        crelacion_activo: 1
      });
      const url = 'Catalogos/CatalogoArbol/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
        localStorage.setItem("subTipoComercio", null);
      } else {
        let listaSubtipos = [];
        for (let i = 0; i < listaTipoComercio.length; i++) {
         for (let j = 0; j < respuesta.response.length; j++) {
         
          if(listaTipoComercio[i].cagenerico_clave == respuesta.response[j].crelacion_id_padre){
            console.log(respuesta.response[j].crelacion_id_padre);
            listaSubtipos.push(respuesta.response[j])
            // break;
          }
         }
      }
      console.log(listaSubtipos)
      localStorage.setItem("subTipoComercio", JSON.stringify(respuesta.response));
    }
  
  }

}