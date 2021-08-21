import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { MapaComponent } from './mapa/mapa.component';
import { MapaFiltroComponent } from './mapa-filtro/mapa-filtro.component';
import { SlideDrawerComponent } from './slide-drawer/slide-drawer.component';



@NgModule({
    declarations: [
        HeaderComponent,
        MenuComponent,
        MapaComponent,
        MapaFiltroComponent,
        SlideDrawerComponent
    ],
    exports: [
        HeaderComponent,
        MenuComponent,
        MapaComponent,
        MapaFiltroComponent,
        SlideDrawerComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        RouterModule
    ]
})
export class ComponentsModule { }
