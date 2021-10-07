import { Component, OnInit, ViewChild, ElementRef, NgZone, Input } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Platform } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { GeocoderResult } from './../../models/geocoder_model';

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
  public latitud: number =  null;
  public longitud: number = null;
  public address: string;
  public marker: Marker;
  public geocoderResult: GeocoderResult = null;
  public calle: string = "";
  public municipio: string = "";

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone, private platform: Platform,
    public utilitiesService: UtilitiesService,
    public geolocationService: GeolocationService) {
     }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    this.loadMap();
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
    await this.obtenerDireccionDeCoordenadas(this.latitud, this.longitud);
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerCoordenadas(){
    await this.geolocation.getCurrentPosition().then(async (resp) => {
      console.log(resp);
      this.latitud = resp.coords.latitude;
      this.longitud = resp.coords.longitude;
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

        /* const responseAddress = [];
        for (const [key, value] of Object.entries(result[0])) {
          if(value.length > 0) {
            responseAddress.push(value);
          }
        }
        responseAddress.reverse();
        console.log(responseAddress);
        for (const value of responseAddress) {
          this.address += value+', ';
        }
        this.address = this.address.slice(0, -2);
        console.log(this.address);
        this.utilitiesService.alert('', this.address); */
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
}
