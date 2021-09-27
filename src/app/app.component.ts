import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { UtilitiesService } from './services/utilities.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { WebRayoService } from './services/web-rayo.service';
import { const_jwt_credentials } from './constants';
import { usuario_sesion_model } from './models/usuario_sesion';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public oneSignalUserId: string = null;
  public usuarioSesion: usuario_sesion_model;
  public opciones: any[] = [
    {
      nombre: 'Perfil',
      ulr: '/perfil'
    },
    {
      nombre: 'Cambiar contraseña',
      ulr: '/cambiar-contrasenia'
    }

  ];
  public oneSignalId = '25c1bedf-5abf-40cc-8edb-76a303ed229a';
  public firebaseId = '438127086671';

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private menuCtrl: MenuController,
    private navCtrl: NavController, private oneSignal: OneSignal,
    private utilitiesService: UtilitiesService, private splashScreen: SplashScreen,
    private platform: Platform, public webRayoService: WebRayoService) {
      this.usuarioSesion = JSON.parse(localStorage.getItem('usuario_sesion'));
    }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ngOnInit() {
    this.platform.ready().then(async() => {
      let temporalTokenJWT = await this.obtenerTokenJWTAsync(const_jwt_credentials);
      if (temporalTokenJWT != null) {
        localStorage.setItem("token_jwt", temporalTokenJWT);
        return;
      }
      
      this.oneSignal.startInit(this.oneSignalId, this.firebaseId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
      this.oneSignal.handleNotificationReceived().subscribe((res) => {
        console.log(res);
      });

      this.oneSignal.handleNotificationOpened().subscribe((res) => {
        // do something when a notification is opened
        console.log(res);
      });
      this.oneSignal.endInit();

      // Obtenemos el userId del OneSignal.
      this.oneSignal.getIds().then((resp) => {
        console.log(resp);
        this.oneSignalUserId = resp.userId;
      });
    });
    this.splashScreen.hide();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cerrarSesion() {
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    await this.cerrarSesionAsync(this.usuarioSesion.user_id)
    this.navCtrl.navigateRoot('login');
    this.menuCtrl.toggle();
    localStorage.removeItem('usuario_sesion');
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public proximasFuncionalidades() {
    this.utilitiesService.alert('Aviso', 'Próximas funcionalidades!');
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
  public async cerrarSesionAsync(sesion_usuario: any) {
    let usuario = {
      id_usuario: sesion_usuario
    }
    let url = "Usuarios/UsuarioSesion/logout";
    let respuesta: any = await this.webRayoService.postAsync(url, usuario);
    if (respuesta == null || respuesta.token == null) {
      return false;
    }
    return true;
  } 

}
