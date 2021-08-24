import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { HttpClientModule } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { UtilitiesService } from './services/utilities.service';
import { customTransition } from "./transition";
import { Network } from '@ionic-native/network/ngx';
// import { MapaComponent } from './components/mapa/mapa.component';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [IonicModule.forRoot({
    scrollAssist: false,
    navAnimation: customTransition
  }),BrowserModule, 
  IonicModule.forRoot(),
  AppRoutingModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule],
  providers: [
    Camera,
    AndroidPermissions,
    Geolocation,
    NativeGeocoder,
    HttpClientModule,
    LocationAccuracy,
    UtilitiesService,
    Network,
    HTTP,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
