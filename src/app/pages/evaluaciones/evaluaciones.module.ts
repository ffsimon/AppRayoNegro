import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EvaluacionesPageRoutingModule } from './evaluaciones-routing.module';

import { EvaluacionesPage } from './evaluaciones.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    EvaluacionesPageRoutingModule
  ],
  declarations: [EvaluacionesPage]
})
export class EvaluacionesPageModule { }
