import { Injectable } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
    ,private geolocation: Geolocation) { }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public obtenerMesStringActual(){
    let fecha = new Date();
    var mes = fecha.getMonth() + 1; 
    if (mes == 1) {
      return "Enero";
    }else if(mes == 2){
      return "Febrero";
    }else if(mes == 3){
      return "Marzo";
    }else if(mes == 4){
      return "Abril";
    }else if(mes == 5){
      return "Mayo";
    }else if(mes == 6){
      return "Junio";
    }else if(mes == 7){
      return "Julio";
    }else if(mes == 8){
      return "Agosto";
    }else if(mes == 9){
      return "Septiembre";
    }else if(mes == 10){
      return "Octubre";
    }else if(mes == 11){
      return "Noviembre";
    }else if(mes == 12){
      return "Diciembre";
    }
    console.log(mes)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async alert(title: string, message: string, nombreBoton?: string) {
    this.alertCtrl.create({
      cssClass: "alertCustom",
      mode: "ios",
      header: title,
      message: message,
      buttons: [{
        text: nombreBoton ? nombreBoton : "Aceptar"
      }]
    }).then(alert => {
      alert.present();
    });
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async getGeolocationAsync(): Promise<any>{
    return new Promise(resolve => {
      this.geolocation.getCurrentPosition().then((resp) => {
        console.log(resp)
        return resolve(resp)
      }, err => {
          return resolve(<any>{
              currentException: err.message.toString(),
              respuesta: null,
              status: false,
              success: false
          });
      });
  });
}

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public toast(message: string, duration: number = 3000, position: any = "middle") {
    this.toastController.create({
        message: message,
        cssClass: "toast",
        duration: duration,
        position: position //"top" | "bottom" | "middle"
    }).then(toast => {
        toast.present();
    });
}

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async loadingAsync() {
    return await this.loadingController.create({
        // cssClass: 'custom-loading',
        // spinner: null,
    });
  }

}
