import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AltaEstablecimientoPage } from './alta-establecimiento.page';

const routes: Routes = [
  {
    path: '',
    component: AltaEstablecimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaEstablecimientoPageRoutingModule {}
