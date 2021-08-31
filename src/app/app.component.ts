import { Component } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { UtilitiesService } from './services/utilities.service';

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

  ]

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private menuCtrl: MenuController,
    private navCtrl: NavController,
    private utilitiesService: UtilitiesService) {}

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
