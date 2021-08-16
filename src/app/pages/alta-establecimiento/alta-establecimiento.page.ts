/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSlides, NavController } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { promise } from 'protractor';
import { WebRayoService } from 'src/app/services/web-rayo.service';
import { Competencias, EvaluacionesRequest, Fotografias } from 'src/app/models/evaluacion_request_model';
import { GeocoderResult } from 'src/app/models/geocoder_model';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';

@Component({
  selector: 'app-alta-establecimiento',
  templateUrl: './alta-establecimiento.page.html',
  styleUrls: ['./alta-establecimiento.page.scss'],
})
export class AltaEstablecimientoPage implements OnInit {

  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;
  public usuarioSesion: usuario_sesion_model; 
  public tempImg: string;
  public fotoIdentificastePublicidad = '';
  public fotoDefault: string = '';
  public comentarios = null;
  public compartieronRazonSocial = false;
  public estasEnOutlet = false;
  public pasoFormulario =1;
  public opcionesParafoto: any = [];
  public sliderOne: any;
  public listaMastercardRadio: any[] = [
    { nombre: 'Sticker', valor: 'sticker' },
    { nombre: 'Reloj (open / close)', valor: 'reloj' },
    { nombre: 'Acrilico', valor: 'acrilico' }
  ];
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
  public primerOpcionPasoCinco = false;
  public segundaOpcionPasoCinco = false;
  public tercerOpcionPasoCinco = false;

  get nombreEstablecimiento() {
    return this.datosGenerales.get('nombreEstablecimiento');
  }
  get razonSocial() {
    return this.datosGenerales.get('razonSocial');
  }
  get tipoComercio() {
    return this.datosGenerales.get('tipoComercio');
  }
  get subTipoComercio() {
    return this.datosGenerales.get('subTipoComercio');
  }
  get nombreOutlet() {
    return this.datosGenerales.get('nombreOutlet');
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private utilitiesService: UtilitiesService,
    private webRayoService: WebRayoService,
    private camera: Camera) {
      console.log(this.opcionesParafoto.length);
      this.usuarioSesion = JSON.parse(sessionStorage.getItem("usuario_sesion"));
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
    const loading = await this.utilitiesService.loadingAsync();
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
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 1
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
      this.listaTipoComercio = [];
    } else {
      this.listaTipoComercio = respuesta.response;
    }
  }
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async validacionDatosGenerales() {

    console.log(this.pasoFormulario);

    if(this.pasoFormulario === 1){
      console.log(this.datosGenerales.valid);
      console.log(this.datosGenerales, this.compartieronRazonSocial, this.estasEnOutlet);

      if(!this.datosGenerales.valid){
        this.utilitiesService.alert('', 'Verifica que los datos esten completos.');
          return;
      }

      if(this.compartieronRazonSocial && this.datosGenerales.value.razonSocial == null ||
        this.compartieronRazonSocial && this.datosGenerales.value.razonSocial === ''){
          this.utilitiesService.alert('', 'Agrega la razón social.');
          return;
      }

      if(this.estasEnOutlet && this.datosGenerales.value.nombreOutlet == null ||
        this.estasEnOutlet && this.datosGenerales.value.nombreOutlet === ''){
          this.utilitiesService.alert('', 'Agrega nombre del outlet.');
          return;
      }
    }

    if(this.pasoFormulario === 2){
      if(this.datosUbicacion.value.numeroEstablecimiento == null || this.datosUbicacion.value.numeroEstablecimiento === ''){
        this.utilitiesService.alert('', 'Agrega el número del establecimiento.');
          return;
      }
    }

    if(this.pasoFormulario === 3){
      if(!this.seleccioneMaterial.valid){
        this.utilitiesService.alert('', 'Agregue todos los campos requeridos.');
        return;
      }

      console.log(this.sliderOne.slidesItems);
      this.opcionesParafoto = this.sliderOne.slidesItems.filter(item => item.seleccionado === true);
      console.log(this.opcionesParafoto);
    }

    let bandera = false;
    if (this.pasoFormulario === 4) {
      if (this.opcionesParafoto.length === 0) {
        if (this.tempImg === '' || this.tempImg === null) {
          bandera = true;
        }
      } else {
        this.opcionesParafoto.forEach(element => {
          console.log(element.fotoBase64, this.tempImg);
          if (element.fotoBase64 === '' || this.tempImg === '') {
            bandera = true;
          }
        });
      }

      if (bandera) {
        this.utilitiesService.alert('', 'Todas las fotos son requeridas.');
        return;
      }
    }

    if(this.pasoFormulario === 5){
      // this.ordenarCompetencias();
      // return;
      if(this.tercerOpcionPasoCinco && this.fotoIdentificastePublicidad === ''){
        console.log('falta foto');
        this.utilitiesService.alert('', 'Captura foto de publicidad nueva.');
        return;
      }

      let envioEvaluacion = await this.enviarEvaluacion();
      if(!envioEvaluacion){
        await this.utilitiesService.alert("", "¡Algo salió mal, intentálo más tarde!");
        return;
      }
    }

    this.pasoFormulario = this.pasoFormulario + 1;
    if (this.pasoFormulario === 6) {
      this.utilitiesService.alert('¡Éxito!', 'Se ha guardado exitosamente el establecimiento.');
      this.navCtrl.navigateRoot('home');
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerListaComunicacion(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 4
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
      this.subListaTipoComunicacion = [];
    } else {
      this.subListaTipoComunicacion = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerListaLocalizacion(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 5
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
      this.subListaTipoLocalizacion = [];
    } else {
      this.subListaTipoLocalizacion = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerBaners(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 2
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
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
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 6
    });
    const url = 'Catalogos/CatalogoGenerico/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
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
    const params = this.webRayoService.fromObjectToGETString({
      crelacion_id_padre: idPadre
    });
    const url = 'Catalogos/CatalogoArbol/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
     return [];
    } else {
      for (let i = 0; i < respuesta.response.length; i++) {
        respuesta.response[i].estatus = false;
      }
      console.log(respuesta.response);
      return respuesta.response;
    }
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cerrarFormularios() {
    this.navCtrl.navigateRoot('home');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async camara(): Promise<string> {
    console.log('tomar foto');
    let fotoBase64 = '';
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA
    };

    await this.camera.getPicture(options).then((imageData) => {
      const base64Image = 'data:image/jpeg;base64,' + imageData;
      fotoBase64 = base64Image;
    }, (err) => {
      fotoBase64 = '';
      console.log('error', err);
    });

    return fotoBase64;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cambiarValores(){
    const valor = this.datosGenerales.value.tipoComercio.cagenerico_clave;
    this.subListaTipoComercio = await this.buscarSubtipoComercio(valor);
  }
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async buscarSubtipoComercio(idPadre){
    this.subTipoComercio.setValue(null);
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();

    const params = this.webRayoService.fromObjectToGETString({
      crelacion_id_padre: idPadre
    });
    const url = 'Catalogos/CatalogoArbol/Get' + params;
    const respuesta: any = await this.webRayoService.getAsync(url);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
      loading.dismiss();
      return this.subListaTipoComercio = [];
    } else {
      console.log(this.subListaTipoComercio);
      loading.dismiss();
      return this.subListaTipoComercio = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public limpiarInput(tipo: number){
    //1 para limpiar input de razon social, 2 para limpiar outlet
    if (tipo === 1) {
      this.razonSocial.setValue(null);
      return;
    } else {
      this.nombreOutlet.setValue(null);
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ayuda(){
    this.utilitiesService.toast('Ayuda');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async tomarFoto(opt: number, posicion?: number) {
    if (opt === 1) {
      this.tempImg = await this.camara();
      console.log(this.tempImg);
    } else if (opt === 2) {
      this.opcionesParafoto[posicion].fotoBase64 = await this.camara();
      console.log(this.opcionesParafoto);
    } else if (opt === 3){
      this.fotoIdentificastePublicidad = await this.camara();
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async enviarEvaluacion(){

    let datosUbicacion: GeocoderResult = JSON.parse(localStorage.getItem("geocoder")); 
    console.log(datosUbicacion);
    
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    let objeto: EvaluacionesRequest = {
      evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
      evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
      evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio.cagenerico_clave,
      evaluacion_ca_tipo_sub_comercio: this.datosGenerales.value.subTipoComercio,
      evaluacion_outlet: this.estasEnOutlet == false? 0: 1,
      evaluacion_nombre_outlet: this.estasEnOutlet ?  this.datosGenerales.value.nombreOutlet: null,
      evaluacion_numero: this.datosUbicacion.value.numeroEstablecimiento,
      evaluacion_calle: datosUbicacion != null ? datosUbicacion.thoroughfare: null,
      evaluacion_colonia: datosUbicacion != null ? datosUbicacion.subLocality : null,
      evaluacion_municipio_alcadia:  datosUbicacion != null ? datosUbicacion.administrativeArea: null,
      evaluacion_cp: datosUbicacion != null ? datosUbicacion.postalCode: null,
      evaluacion_latitud: datosUbicacion != null ? String(datosUbicacion.latitude): null,
      evaluacion_longitud: datosUbicacion != null ? String(datosUbicacion.longitude): null,
      evaluacion_renovacion: 0,
      evaluacion_ca_id_comunicacion: this.seleccioneMaterial.value.comunicacion,
      evaluacion_localizacion_id: this.seleccioneMaterial.value.localizacionItem,
      list_fotografias: this.ordenarListaFotos(),
      // lista_competencias: this.ordenarCompetencias(),
      evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
    }
    console.log(objeto)
    const url = 'Operaciones/Evaluacion';
    const respuesta: any = await this.webRayoService.postAsync(url, objeto);
    if ( respuesta == null || respuesta.success === false ||respuesta.response.length === 0 ) {
      loading.dismiss();
      return false;
    } else
      return true;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ordenarListaFotos(){
    // la foto de fachada que va por default que efotografia_catalogo_id_evidencia lleva
    let listafotos: Array<Fotografias> = [];

    // limpiamos la foto por default
    let stringBase64: string = "data:image/jpeg;base64," 
    let seEncuentraStringBase64 = this.tempImg.indexOf(stringBase64);
    if (seEncuentraStringBase64 !== -1){
      this.tempImg = this.tempImg.replace(stringBase64, "")
    }

       

    // agregamos la foto de fachada que esta por default
     let imagenFachadaDefault: Fotografias = { efotografia_catalogo_id_evidencia: 0, imagBase64: this.tempImg }
     listafotos.push(imagenFachadaDefault)
     
     // se agregan las imagene para el carrusel
     for (let i = 0; i < this.opcionesParafoto.length; i++) {
      let stringBase64: string = "data:image/jpeg;base64," 
      let seEncuentraStringBase64 = this.opcionesParafoto[i].fotoBase64.indexOf(stringBase64);
      if (seEncuentraStringBase64 !== -1){
        this.opcionesParafoto[i].fotoBase64 = this.opcionesParafoto[i].fotoBase64.replace(stringBase64, "")
      }
      
      
      let imagenesCarrusel: Fotografias = { efotografia_catalogo_id_evidencia: this.opcionesParafoto[i].cagenerico_clave, imagBase64: this.opcionesParafoto[i].fotoBase64 }
      listafotos.push(imagenesCarrusel);

     
    }
    return listafotos;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ordenarCompetencias(){
    let listaCompetencias: Array<Competencias> = [];
    let listaPreeliminar: Array<any> = [];
   
    for (let i = 0; i < this.lstaCompetencia.length; i++) {
      for (let j = 0; j < this.lstaCompetencia[i].arregloHijos.length; j++) {
        if(this.lstaCompetencia[i].arregloHijos[j].estatus == true){
          listaPreeliminar.push(this.lstaCompetencia[i].arregloHijos[j])
        }
      }
    }

    console.log(listaPreeliminar)
   
    // agregamos las competencias que vienen de catalogos
    for (let i = 0; i < listaPreeliminar.length; i++) {
      let competencia: Competencias = {
        ecompentencia_comentario: "",
        ecompentencia_catalogo_competencia: listaPreeliminar[i].crelacion_id_hijo,
        ecompentencia_catalogo_competencia_material: listaPreeliminar[i].crelacion_id_padre,
        ecompentencia_foto: ""
      }
      listaCompetencias.push(competencia);
    }

    // limpiamos la foto de idetificaste nueva publicidad
    this.fotoDefault = '';
    if(this.fotoIdentificastePublicidad != ''){
    let stringBase64: string = "data:image/jpeg;base64," 
    let seEncuentraStringBase64 = this.fotoIdentificastePublicidad.indexOf(this.fotoIdentificastePublicidad);
      if (seEncuentraStringBase64 !== -1){
        this.fotoDefault = this.fotoIdentificastePublicidad.replace(stringBase64, "")
        console.log(this.fotoIdentificastePublicidad)
      }
    }
    

    // agregamos las competencias que vienen por default
    let competenciaCatalogo: Competencias = {
      ecompentencia_comentario: this.comentarios,
        ecompentencia_catalogo_competencia: 0,
        ecompentencia_catalogo_competencia_material: 0,
        ecompentencia_foto: this.fotoIdentificastePublicidad != '' ? this.fotoDefault : ''
    }

    listaCompetencias.push(competenciaCatalogo);

    return listaCompetencias;
  }
}
