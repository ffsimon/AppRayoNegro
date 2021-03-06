import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DataResolveService } from './services/params/data-resolve.service';

const routes: Routes = [
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  // },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'evaluaciones',
    loadChildren: () => import('./pages/evaluaciones/evaluaciones.module').then( m => m.EvaluacionesPageModule)
  },
  {
    path: 'alta-establecimiento',
    loadChildren: () => import('./pages/alta-establecimiento/alta-establecimiento.module').then( m => m.AltaEstablecimientoPageModule)
  },
  {
    path: 'alta-establecimiento/:id',
    resolve: { establecimiento: DataResolveService},
    loadChildren: () => import('./pages/alta-establecimiento/alta-establecimiento.module').then( m => m.AltaEstablecimientoPageModule)
  },
  {
    path: 'recuperar-cuenta',
    loadChildren: () => import('./pages/login/recuperar-contrasena/recuperar-contrasena.module').then(m => m.RecuperarContrasenaPageModule)
  },
  {
    path: 'modal-page',
    loadChildren: () => import('./pages/modal-page/modal-page.module').then( m => m.ModalPagePageModule)
  },
  {
    path: 'modal-evaluaciones',
    loadChildren: () => import('./pages/modal-evaluaciones/modal-evaluaciones.module').then( m => m.ModalEvaluacionesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
