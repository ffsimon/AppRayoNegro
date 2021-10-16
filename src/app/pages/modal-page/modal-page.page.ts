import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-modal-page',
  templateUrl: './modal-page.page.html',
  styleUrls: ['./modal-page.page.scss'],
})
export class ModalPagePage {
  public direcciones: any;
  public direccionesFiltro: Array<any> = [];
  
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private modalController: ModalController,
    private navParams: NavParams, private utilitiesService: UtilitiesService) {
    this.direcciones = this.navParams.data.direcciones;
    // vamos a filtrar para que solo se muestren las direcciones que tengan mas de 20 length

    let listaDirecciones =[]; 
    for (let i = 0; i < this.direcciones.length; i++) {
      if(this.direcciones[i].formatted_address.length > 40){
        listaDirecciones.push(this.direcciones[i])
      }
    }
    this.direccionesFiltro = listaDirecciones;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cerrarModal(){
    localStorage.removeItem('direccionLocal');
    await this.modalController.dismiss(null);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async closeModal(direccion: any) {
    console.log(direccion)
    await this.modalController.dismiss(direccion);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async seleccionaDireccion(direccion: any){
    if(direccion != null){
      await this.closeModal(direccion);
    }
  }

}
