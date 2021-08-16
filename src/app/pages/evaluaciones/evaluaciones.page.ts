/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.page.html',
  styleUrls: ['./evaluaciones.page.scss'],
})
export class EvaluacionesPage implements OnInit {

  public mostrarDetalle = false;
  public listaEvaluacionesUsuario: any = [];
  public nombreTipoComercio = '';
  public listaTipoComercio: any = [];
  public usuarioSesion: usuario_sesion_model;
  public saludos = [1,2,3];
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private navCtrl: NavController,
    private webRayoService: WebRayoService,
    private utilitiesService: UtilitiesService) {
    this.usuarioSesion = JSON.parse(sessionStorage.getItem('usuario_sesion'));
    console.log(this.usuarioSesion);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async ngOnInit() {
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    await this.obtenerEvaluacionesUsuario();
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerEvaluacionesUsuario(){
    const params = this.webRayoService.fromObjectToGETString({
      evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
    });
    const url = 'Operaciones/Evaluacion/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta === null || respuesta.success === false ||respuesta.response.length === 0 ) {
      this.listaEvaluacionesUsuario = [];
    } else {
      this.listaEvaluacionesUsuario = respuesta.response;
      for (let i = 0; i < this.listaEvaluacionesUsuario.length; i++) {
        this.listaEvaluacionesUsuario[i].visible = false;
      }
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerTipoComercion(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 1
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta === null || respuesta.success === false ||respuesta.response.length === 0 ) {
      this.listaTipoComercio = [];
    } else {
      this.listaTipoComercio = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public regresarHome() {
    this.navCtrl.navigateRoot('home');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irEstablecimiento() {
    this.navCtrl.navigateRoot('alta-establecimiento');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irEvaluaciones(){
  }


}
