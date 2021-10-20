import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';

@Component({
  selector: 'app-modal-evaluaciones',
  templateUrl: './modal-evaluaciones.page.html',
  styleUrls: ['./modal-evaluaciones.page.scss'],
})
export class ModalEvaluacionesPage implements OnInit {
  public evaluacion: any;
  public usuarioSesion: usuario_sesion_model;
  public evaluacionCompleta: any = null;

  constructor(private modalController: ModalController,
    private navParams: NavParams, 
    private utilitiesService: UtilitiesService,
    private webRayoService: WebRayoService) {
      this.usuarioSesion = JSON.parse(localStorage.getItem('usuario_sesion'));
      this.evaluacion = this.navParams.data.evaluacion;
      console.log(this.evaluacion)
     }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async ngOnInit() {
      await this.obtenerEvaluacionesUsuario()
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async cerrarModal(){
      localStorage.removeItem('direccionLocal');
      await this.modalController.dismiss(null);
    }

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    public async obtenerEvaluacionesUsuario(){
      console.log("evaluaciones")
      const loading = await this.utilitiesService.loadingAsync();
      loading.present();
      const params = this.webRayoService.fromObjectToGETString({
        evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id,
        evaluacion_id: this.evaluacion.evaluacion_id
      });
      const url = 'Operaciones/Evaluacion/Get' + params;
      const respuesta: any = await this.webRayoService.getAsync(url);
      if ( respuesta === null || respuesta.success === false ||respuesta.response.length === 0 ) {
        loading.dismiss()
        return;
      } else {
        this.evaluacionCompleta = respuesta.response[0];
        console.log(this.evaluacionCompleta)
        loading.dismiss()
      }
    }


}
