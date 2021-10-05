import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RecuperarContrasenaPageRoutingModule } from './recuperar-contrasena-routing.module';
import { RecuperarContrasenaPage } from './recuperar-contrasena.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    RecuperarContrasenaPageRoutingModule
  ],
  declarations: [RecuperarContrasenaPage]
})
export class RecuperarContrasenaPageModule {}
