import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
@Injectable({
providedIn: 'root'
})
export class DeviceDetailsService {
name: string = "";
osVersion: string = "";
uuid: string = "";
platform: string = "";
model: string = ""
constructor( private plt: Platform, private device: Device) {
this.plt.ready().then(() => {
this.osVersion = this.device.version;
this.uuid = this.device.uuid;
this.name = (window as any).device.name;
this.platform = device.platform;
this.model = this.device.model
});
}
}