import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalEvaluacionesPageRoutingModule } from './modal-evaluaciones-routing.module';

import { ModalEvaluacionesPage } from './modal-evaluaciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalEvaluacionesPageRoutingModule
  ],
  declarations: [ModalEvaluacionesPage]
})
export class ModalEvaluacionesPageModule {}
