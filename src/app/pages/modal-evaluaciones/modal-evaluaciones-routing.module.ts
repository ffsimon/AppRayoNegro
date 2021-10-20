import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalEvaluacionesPage } from './modal-evaluaciones.page';

const routes: Routes = [
  {
    path: '',
    component: ModalEvaluacionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalEvaluacionesPageRoutingModule {}
