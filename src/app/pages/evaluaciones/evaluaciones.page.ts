/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GeolocationModel } from 'src/app/models/geolocation_model';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { DataService } from 'src/app/services/params/data.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';

declare let google;
interface Marker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
};


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

  public marker: Marker;
  public map: any = null;
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private navCtrl: NavController,
    private webRayoService: WebRayoService,
    private utilitiesService: UtilitiesService,
    private geolocationService: GeolocationService,
    private dataService: DataService) {
    this.usuarioSesion = JSON.parse(sessionStorage.getItem('usuario_sesion'));
    console.log(this.usuarioSesion);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async ngOnInit() {
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    await this.obtenerEvaluacionesUsuario();
    setTimeout(async () => {
      await this.cargarMapas();
    }, 1000);
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

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cargarMapas() {
    /* const loading = await this.utilitiesService.loadingAsync();
    loading.present(); */
    if (this.listaEvaluacionesUsuario.length > 0) {
      this.listaEvaluacionesUsuario.forEach(async element => {
        const cordenadas = {
          lat: element.evaluacion_latitud,
          lng: element.evaluacion_longitud,
        };
        await this.loadMap(cordenadas, element.evaluacion_id);
      });
    }
    /* loading.dismiss(); */
  }

    //#region Load Mapa
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async loadMap(coordenadas: any, idMapa: string) {
    const geolocationModel: GeolocationModel = {
      latitude: coordenadas.lat,
      longitude: coordenadas.lng
    };

    console.log(geolocationModel);
    console.log(idMapa);

    const mapEle: HTMLElement = document.getElementById(`map${idMapa}`);
    const lat = Number(geolocationModel.latitude);
    const lng = Number(geolocationModel.longitude);
    const myLatLng = { lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) };

    const maker = {
      position : {
        lat: parseFloat(myLatLng.lat.toString()),
        lng: parseFloat(myLatLng.lng.toString())
      },
      title: 'Mi ubicación'
    };
    this.marker = maker;
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      disableDefaultUI: true,
      zoom: 16,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }],
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }],
        },
      ],
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      this.renderMarkers();
    });
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public renderMarkers() {
    this.addMarker(this.marker);
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public addMarker(marker: Marker) {
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public enviarEditarEvaluacion(evaluacion){
    this.dataService.setData("establecimiento", evaluacion)
    this.navCtrl.navigateForward("alta-establecimiento/establecimiento");
    console.log(evaluacion);
  }
  //#endregion
}
