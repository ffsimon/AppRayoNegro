import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { UtilitiesService } from './services/utilities.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public opciones: any[] = [
    {
      nombre: "Perfil",
      ulr: "/perfil"
    },
    {
      nombre: "Cambiar contraseña",
      ulr: "/cambiar-contrasenia"
    }

  ];
  public oneSignalId: string = '25c1bedf-5abf-40cc-8edb-76a303ed229a';
  public firebaseId: string = '438127086671'

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private menuCtrl: MenuController,
    private navCtrl: NavController, private oneSignal: OneSignal,
    private utilitiesService: UtilitiesService, private platform: Platform) {

      platform.ready().then(() => {
        this.oneSignal.startInit(this.oneSignalId, this.firebaseId);
        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
        
        this.oneSignal.handleNotificationReceived().subscribe((res) => {
          console.log(res)
        });

        oneSignal.handleNotificationOpened().subscribe((res) => {
          // do something when a notification is opened
          console.log(res)
        });
        
        // intentando obtener el token
        this.oneSignal.getIds().subscribe((resp) =>{
          console.log(resp)
        })

        this.oneSignal.endInit();
        
      })
    }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  
  public cerrarSesion() {
    this.navCtrl.navigateRoot("login");
    this.menuCtrl.toggle();
    localStorage.removeItem("usuario_sesion")
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public proximasFuncionalidades() {
    this.utilitiesService.alert("Aviso", "Próximas funcionalidades!")
  }
}
