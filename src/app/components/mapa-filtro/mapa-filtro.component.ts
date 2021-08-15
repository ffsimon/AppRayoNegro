import { Component, Input, OnInit } from '@angular/core';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Platform } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocation.service';

declare var google;
interface Marker {
  position: {
    lat: number,
    lng: number,
  };
  title: string;
};


@Component({
  selector: 'app-mapa-filtro',
  templateUrl: './mapa-filtro.component.html',
  styleUrls: ['./mapa-filtro.component.scss'],
})
export class MapaFiltroComponent implements OnInit {

  @Input() coordenadas;

  public map: any = null;
  public latitud: number =  null; 
  public longitud: number = null;
  public address:string;
  public marker: Marker;
  
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private platform: Platform,
    public utilitiesService: UtilitiesService,
    public geolocationService: GeolocationService) {

      
     }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
   
    this.loadMap();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async loadMap() {

    console.log(this.coordenadas)

    // this.coordenadas.lat = 19.756846;
    // this.coordenadas.lng = -99.2106002;
    
    let loading = await this.utilitiesService.loadingAsync();
    loading.present();
    const mapEle: HTMLElement = document.getElementById('map');
    let myLatLng = { lat: parseFloat(this.coordenadas.lat), lng: parseFloat(this.coordenadas.lng) }
   

    let maker = {
      position : {
        lat: this.coordenadas.lat,
        lng: this.coordenadas.lng
      },
      title: "Mi ubicación"
    }
    this.marker = maker;
    let myLat = Number(this.coordenadas.lat)
    let myLng = Number(this.coordenadas.lng)
    console.log(typeof myLat, typeof myLng)
    console.log(myLatLng)

    this.map = new google.maps.Map(mapEle, {  
      center: myLatLng,
      disableDefaultUI: true,
      zoom: 16,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      
      this.renderMarkers();
      mapEle.classList.add('show-map');
    });
    loading.dismiss();
    // await this.obtenerDireccionDeCoordenadas(this.latitud, this.longitud);
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
