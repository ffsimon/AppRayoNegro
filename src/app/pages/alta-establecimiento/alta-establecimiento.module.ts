import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AltaEstablecimientoPageRoutingModule } from './alta-establecimiento-routing.module';
import { AltaEstablecimientoPage } from './alta-establecimiento.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { NetworkService } from '../../services/network.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    AltaEstablecimientoPageRoutingModule
  ],
  declarations: [AltaEstablecimientoPage],
  providers: [NetworkService]
})
export class AltaEstablecimientoPageModule { }
