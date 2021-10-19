import { Component, OnInit, ViewChild, ElementRef, NgZone, Input } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Platform, ModalController } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GeocoderGoogleResult, GeocoderResult } from './../../models/geocoder_model';
import { WebRayoService } from 'src/app/services/web-rayo.service';
import { ModalPagePage } from '../../pages/modal-page/modal-page.page';

declare let google;

interface Marker {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
};

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit {

  @Input() nombreEstablecimiento;

  public map: any = null;
  public latitud: any =  null;
  public longitud: any = null;
  public address: string;
  public marker: Marker;
  public geocoderResult: GeocoderResult = null;
  public calle: string = "";
  public municipio: string = "";
  public latLng: string = "";
  public dataReturned: any = null;
  public resultados: Array<any> = [];

  public calleGeocode: string = null;
  public municipioGeocode: string = null;
  public ciudadGeocode: string = null;
  public localidadGeocode: string = null;
  public direccionCompleta:string = null;
  public codigoPostalGeocode:string = null;
  public coloniaGeocode:string = null;
  public municipioCiudad: string = null;
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone, private platform: Platform,
    public utilitiesService: UtilitiesService,
    public geolocationService: GeolocationService, 
    private webRayoService: WebRayoService,
    public modalCtrl : ModalController) {
     }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    await this.loadMap();
  }

  public pedirPermisos() {
    this.platform.ready().then(async platform => {
      if ((this.platform.is('android') || this.platform.is('ios')) && !this.platform.is('mobileweb')) {
      this.utilitiesService.getGeolocationAsync();
      }
    });
  }
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async loadMap() {
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    await this.obtenerCoordenadas();
    const mapEle: HTMLElement = document.getElementById('map');
    const myLatLng = {lat: this.latitud, lng: this.longitud};

    console.log(this.latitud, this.latitud);

    const myLat = Number(this.latitud);
    const myLng = Number(this.longitud);
    const maker = {
      position : {
        lat: myLat,
        lng: myLng
      },
      title: 'Mi ubicación'
    };
    this.marker = maker;
    console.log(myLat, myLng);
    this.map = new google.maps.Map(mapEle, {
      disableDefaultUI: true,
      center: {lat: myLat, lng: myLng},
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
      this.renderMarkers();
      mapEle.classList.add('show-map');
    });
    loading.dismiss();
    //await this.obtenerDireccionDeCoordenadas(this.latitud, this.longitud);
     await this.consultarDireccion(this.latLng);
   //await this.consultarDireccion("20.6582485,-100.3402784") // queretaro
    // await this.consultarDireccion("19.3821427,-99.1811972") // CDMX
    
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerCoordenadas(){
    await this.geolocation.getCurrentPosition().then(async (resp) => {
      console.log(resp);
      this.latitud = resp.coords.latitude;
      this.longitud = resp.coords.longitude;
      this.latLng = resp.coords.latitude + "," + resp.coords.longitude;
      localStorage.setItem('coordenadas', JSON.stringify(this.latLng));
      console.log(this.latLng)
    }, err => {
        console.log(err);
    });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerDireccionDeCoordenadas(lat: number, lng: number){
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lat, lng, options)
      .then((result: NativeGeocoderResult[]) => {

        this.address = '';
        this.geocoderResult = result[0];

        console.log('objecto obtenido del geocoder');
        console.log(this.geocoderResult);

        console.log('guardamos en memoria local');
        localStorage.setItem('geocoder', JSON.stringify(this.geocoderResult));
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public renderMarkers() {
      this.addMarker(this.marker);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public addMarker(marker: Marker) {
    return new google.maps.Marker({
      position: marker.position,
      map: this.map,
      title: marker.title
    });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async consultarDireccion(latLng: string){
    console.log(latLng)
    const params = this.webRayoService.fromObjectToGETString({
      latlng: latLng,
      key: 'AIzaSyDSVmDjbmmdQD_3B5NEZcO5lNsujDMzO2g'
    });
    let url: string = 'https://maps.googleapis.com/maps/api/geocode/json' + params;
    let respuesta = await this.webRayoService.getCoordenadas(url);
    console.log("*******")
    console.log(respuesta);

    if(respuesta.results == null){
      console.log("no hay resultados")
      return;
    }
    this.resultados = respuesta.results;
    await this.openModal(this.resultados);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async openModal(resultadosDirecciones) {
    const modal = await this.modalCtrl.create({
      component: ModalPagePage,
      componentProps: {
        direcciones : resultadosDirecciones
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      console.log(dataReturned)
      if (dataReturned != null) {
        this.dataReturned = dataReturned.data;
      }
    });
    return await modal.present();

  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async tratarDireccion(direccion: any){
    console.log(direccion)
    
    if(direccion.address_components != null){
      this.direccionCompleta = direccion.formatted_address;
      for (let i = 0; i < direccion.address_components.length; i++) {
        let tipo = direccion.address_components[i].types;
        for (let j = 0; j < tipo.length; j++) {
          if(tipo[j] == 'route' || tipo[j] == 'establishment' || tipo[j] == 'point_of_interest' || tipo[j] == 'transit_station')
            this.calleGeocode = direccion.address_components[i].long_name;

          if(tipo[j] == 'sublocality' || tipo[j] == 'sublocality_level_1' || tipo[j] == 'neighborhood')
            this.coloniaGeocode = direccion.address_components[i].long_name

          if(tipo[j] == 'administrative_area_level_1')
            this.ciudadGeocode = direccion.address_components[i].long_name;

          if(tipo[j] == 'locality')
            this.municipioGeocode = direccion.address_components[i].long_name;

          if(tipo[j] == 'postal_code')
            this.codigoPostalGeocode = direccion.address_components[i].long_name;
        }
      }
      
      debugger

      if( this.ciudadGeocode != null){
        if(this.municipioGeocode != null){
          this.municipioCiudad = this.ciudadGeocode + "/" + this.municipioGeocode
        }else{
          this.municipioCiudad = this.ciudadGeocode + "/"
        }
      }else{
       if(this.municipioGeocode != null){
        this.municipioCiudad = "/" + this.municipioGeocode;
       }else{
        this.municipioCiudad = "/"
       }
      }
      

    }

    let guardarDireccion: GeocoderGoogleResult = {
      calle: this.calleGeocode,
      colonia: this.coloniaGeocode,
      municipio: this.municipioGeocode,
      estado: this.ciudadGeocode,
      codigoPostal: this.codigoPostalGeocode,
      latitud: this.latitud,
      longitud: this.longitud
    }

    console.log(guardarDireccion);

    localStorage.setItem("direccionLocal", JSON.stringify(guardarDireccion));
  }

  public hola(){
  }


}
