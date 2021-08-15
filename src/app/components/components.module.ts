import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { MapaComponent } from './mapa/mapa.component';
import { MapaFiltroComponent } from './mapa-filtro/mapa-filtro.component';



@NgModule({
    declarations: [
        HeaderComponent,
        MenuComponent,
        MapaComponent,
        MapaFiltroComponent
    ],
    exports: [
        HeaderComponent,
        MenuComponent,
        MapaComponent,
        MapaFiltroComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        RouterModule
    ]
})
export class ComponentsModule { }