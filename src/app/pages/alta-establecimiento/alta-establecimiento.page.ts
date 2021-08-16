import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSlides, NavController } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { promise } from 'protractor';
import { WebRayoService } from 'src/app/services/web-rayo.service';

@Component({
  selector: 'app-alta-establecimiento',
  templateUrl: './alta-establecimiento.page.html',
  styleUrls: ['./alta-establecimiento.page.scss'],
})
export class AltaEstablecimientoPage implements OnInit {

  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;
  public tempImg: string;
  public fotoIdentificastePublicidad: string = '';
  public comentarios = null;
  public compartieronRazonSocial: boolean = false;
  public estasEnOutlet: boolean = false;
  public pasoFormulario: number = 1;
  public opcionesParafoto: any = [];
  public sliderOne: any;
  public listaMastercardRadio: any[] = [
    { nombre: 'Sticker', valor: 'sticker' },
    { nombre: 'Reloj (open / close)', valor: 'reloj' },
    { nombre: 'Acrilico', valor: 'acrilico' }
  ]
  public datosGenerales: FormGroup = this.formBuilder.group({
    nombreEstablecimiento: [null, Validators.required],
    razonSocial: [null, this.compartieronRazonSocial? [Validators.required]: []],
    tipoComercio: [null, Validators.required],
    subTipoComercio: [null, Validators.required],
    nombreOutlet: [null, this.estasEnOutlet? [Validators.required]: []]
  });

  public datosUbicacion: FormGroup = this.formBuilder.group({
    numeroEstablecimiento: ['', Validators.required]
  });

  public seleccioneMaterial: FormGroup = this.formBuilder.group({
    comunicacion: ['', Validators.required],
    localizacionItem: ['', Validators.required]
  });
  public listaTipoComercio: any = [];
  public subListaTipoComercio: any = [];
  public subListaTipoComunicacion: any = [];  
  public subListaTipoLocalizacion: any = [];
  public lstaCompetencia: any = [];
  public listaCompetenciaCaracteristicas: any [];
  public primerOpcionPasoCinco: boolean = false;
  public segundaOpcionPasoCinco: boolean = false;
  public tercerOpcionPasoCinco: boolean = false;

  get nombreEstablecimiento() {
    return this.datosGenerales.get("nombreEstablecimiento");
  }
  get razonSocial() {
    return this.datosGenerales.get("razonSocial");
  }
  get tipoComercio() {
    return this.datosGenerales.get("tipoComercio");
  }
  get subTipoComercio() {
    return this.datosGenerales.get("subTipoComercio");
  }
  get nombreOutlet() {
    return this.datosGenerales.get("nombreOutlet");
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(
    private formBuilder: FormBuilder, 
    private navCtrl: NavController, 
    private utilitiesService: UtilitiesService,
    private webRayoService: WebRayoService,
    private camera: Camera) {
      console.log(this.opcionesParafoto.length)
    this.sliderOne =
    {
      initialSlide: 0,
      slidesPerView: 1,
      speed: 400,
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
      },
      slidesItems: []
    };
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    let loading = await this.utilitiesService.loadingAsync();
    loading.present();

    await this.obtenerTipoComercion();
    await this.obtenerListaComunicacion();
    await this.obtenerListaLocalizacion();
    await this.obtenerBaners();
    await this.obtenerCompetencia(); 
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerTipoComercion(){
    let params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 1
    });
    let url = "Catalogos/CatalogoGenerico/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      this.listaTipoComercio = [];
    } else {
      this.listaTipoComercio = respuesta.response;
    }
  }
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public validacionDatosGenerales() {

    console.log(this.pasoFormulario)

    if(this.pasoFormulario == 1){
      console.log(this.datosGenerales.valid)
      console.log(this.datosGenerales, this.compartieronRazonSocial, this.estasEnOutlet)
      
      if(!this.datosGenerales.valid){
        this.utilitiesService.alert("", "Verifica que los datos esten completos.")
          return;
      }

      if(this.compartieronRazonSocial && this.datosGenerales.value.razonSocial == null || 
        this.compartieronRazonSocial && this.datosGenerales.value.razonSocial == ''){
          this.utilitiesService.alert("", "Agrega la razón social.")
          return;
      }

      if(this.estasEnOutlet && this.datosGenerales.value.nombreOutlet == null || 
        this.estasEnOutlet && this.datosGenerales.value.nombreOutlet == ''){
          this.utilitiesService.alert("", "Agrega nombre del outlet.")
          return;
      }
      
    }

    if(this.pasoFormulario == 2){
      if(this.datosUbicacion.value.numeroEstablecimiento == null || this.datosUbicacion.value.numeroEstablecimiento == ''){
        this.utilitiesService.alert("", "Agrega el número del establecimiento.")
          return;
      }
    }
    
    if(this.pasoFormulario == 3){
      if(!this.seleccioneMaterial.valid){
        this.utilitiesService.alert("", "Agregue todos los campos requeridos.")
          return;
      }

      console.log(this.sliderOne.slidesItems)
      this.opcionesParafoto = this.sliderOne.slidesItems.filter(item => item.seleccionado == true)
      console.log(this.opcionesParafoto)
    }

    let bandera = false;
    if (this.pasoFormulario == 4) {
      if (this.opcionesParafoto.length === 0) {
        if (this.tempImg === '' || this.tempImg === null) {
          bandera = true;
        }
      } else {
        this.opcionesParafoto.forEach(element => {
          console.log(element.fotoBase64, this.tempImg)
          if (element.fotoBase64 === '' || this.tempImg === '') {
            bandera = true;
          }
        });
      }

      if (bandera) {
        this.utilitiesService.alert("", "Todas las fotos son requeridas.");
        return;
      }
    }

    if(this.pasoFormulario == 5){
      if(this.tercerOpcionPasoCinco && this.fotoIdentificastePublicidad == ''){
        console.log("falta foto");
        this.utilitiesService.alert("", "Captura foto de publicidad nueva.");
        return;
      }
    }

    

    this.pasoFormulario = this.pasoFormulario + 1;
    if (this.pasoFormulario == 6) {
      this.utilitiesService.alert("¡Éxito!", "Se ha guardado exitosamente el establecimiento.")
      this.navCtrl.navigateRoot("home");
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerListaComunicacion(){
    let params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 4
    });
    let url = "Catalogos/CatalogoGenerico/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      this.subListaTipoComunicacion = [];
    } else {
      this.subListaTipoComunicacion = respuesta.response;
    }
  }
  
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerListaLocalizacion(){
    let params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 5
    });
    let url = "Catalogos/CatalogoGenerico/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      this.subListaTipoLocalizacion = [];
    } else {
      this.subListaTipoLocalizacion = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerBaners(){
    let params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 2
    });
    let url = "Catalogos/CatalogoGenerico/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      this.sliderOne.slidesItems = [];
    } else {
      this.sliderOne.slidesItems = respuesta.response;
      for (let i = 0; i < this.sliderOne.slidesItems.length; i++) {
        this.sliderOne.slidesItems[i].seleccionado = false;
        this.sliderOne.slidesItems[i].fotoBase64 = '';
      }
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerCompetencia(){
    let params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 6
    });
    let url = "Catalogos/CatalogoGenerico/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      this.lstaCompetencia = [];
    } else {
      this.lstaCompetencia = respuesta.response;
      for (let i = 0; i < this.lstaCompetencia.length; i++) {
       let hijoCompetencia =  await this.obtenerCompetenciaCaracteristica(this.lstaCompetencia[i].cagenerico_clave);  
       this.lstaCompetencia[i].arregloHijos = hijoCompetencia;
      }
    }
    console.log(this.lstaCompetencia)
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerCompetenciaCaracteristica(idPadre:number){
    let params = this.webRayoService.fromObjectToGETString({
      crelacion_id_padre: idPadre
    });
    let url = "Catalogos/CatalogoArbol/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
     return [];
    } else {

      for (let i = 0; i < respuesta.response.length; i++) {
        respuesta.response[i].estatus = false;
        
      }
      console.log(respuesta.response)
      return respuesta.response; 
    }
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cerrarFormularios() {
    this.navCtrl.navigateRoot("home");
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async camara(): Promise<string> {
    console.log("tomar foto")
    let fotoBase64: string = ''
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA
    };

    await this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      fotoBase64 = base64Image;
    }, (err) => {
      fotoBase64 = ''
      console.log("error", err)
    });

    return fotoBase64;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cambiarValores(){
    let valor = this.datosGenerales.value.tipoComercio.cagenerico_clave;
    this.subListaTipoComercio = await this.buscarSubtipoComercio(valor);
    
  }
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async buscarSubtipoComercio(idPadre){
    this.subTipoComercio.setValue(null);
    let loading = await this.utilitiesService.loadingAsync();
    loading.present();

    let params = this.webRayoService.fromObjectToGETString({
      crelacion_id_padre: idPadre
    });
    let url = "Catalogos/CatalogoArbol/Get" + params;
    let respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success == false ||respuesta.response.length == 0 ) {
      loading.dismiss();
      return this.subListaTipoComercio = [];
    } else {
      console.log(this.subListaTipoComercio);
      loading.dismiss();
      return this.subListaTipoComercio = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public limpiarInput(tipo:number){
    //1 para limpiar input de razon social, 2 para limpiar outlet
    if(tipo == 1){
      this.razonSocial.setValue(null);
      return;
    }else{
      this.nombreOutlet.setValue(null);
    } 
  }
  
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ayuda(){
    this.utilitiesService.toast("Ayuda");
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async tomarFoto(opt: number, posicion?: number) {
    if (opt == 1){
      this.tempImg = await this.camara();
      console.log(this.tempImg);
    } else if (opt == 2) {
      this.opcionesParafoto[posicion].fotoBase64 = await this.camara();
      console.log(this.opcionesParafoto);
    }else if(opt == 3){
      this.fotoIdentificastePublicidad = await this.camara();
    }
  }

}
