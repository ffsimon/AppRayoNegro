import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSlides, NavController } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebRayoService } from 'src/app/services/web-rayo.service';
import { Competencias, EvaluacionesRequest, Fotografias } from 'src/app/models/evaluacion_request_model';
import { GeocoderResult } from 'src/app/models/geocoder_model';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { ConnectivityService } from 'src/app/services/connectivity.service';
import { ActivatedRoute } from '@angular/router';


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
  public pasoFormulario = 1;
  public opcionesParafoto: any = [];
  public sliderOne: any;
  public hayInternet: boolean = true;
  public esEdicion: boolean = false;
  public evaluacion = null;
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
  get comunicacion() {
    return this.seleccioneMaterial.get('comunicacion');
  }
  get localizacionItem() {
    return this.seleccioneMaterial.get('localizacionItem');
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private utilitiesService: UtilitiesService,
    private webRayoService: WebRayoService,
    private camera: Camera, 
    private connectivity: ConnectivityService,
    private route: ActivatedRoute) {
    
    if(this.route.snapshot.data["establecimiento"]){
      this.esEdicion = true;
      this.evaluacion = this.route.snapshot.data["establecimiento"];
      console.log("route  ", this.evaluacion)
    }

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
    this.connectivity.appIsOnline$.subscribe(online => {
      this.hayInternet = online;
      console.log(online)
      if (online) {
          console.log("App is online")
      } else {
          console.log("App is offline")
      }
    })


    const loading = await this.utilitiesService.loadingAsync();
    loading.present();

    await this.obtenerTipoComercion();
    await this.obtenerListaComunicacion();
    await this.obtenerListaLocalizacion();
    await this.obtenerBaners();
    await this.obtenerCompetencia();
    
    if (this.esEdicion) {
      this.llenarDatos(this.evaluacion);
    }

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
    if(this.pasoFormulario === 1){
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

      if (this.esEdicion) {
        this.pasoFormulario = 3;
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
      this.opcionesParafoto = this.sliderOne.slidesItems.filter(item => item.seleccionado === true);
    }

    let bandera = false;
    if (this.pasoFormulario === 4) {
      if (this.opcionesParafoto.length === 0) {
        if (this.tempImg === '' || this.tempImg === null) {
          bandera = true;
        }
      } else {
        this.opcionesParafoto.forEach(element => {
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
      
      debugger;
      if(this.tercerOpcionPasoCinco && this.fotoIdentificastePublicidad === ''){
        console.log('falta foto');
        this.utilitiesService.alert('', 'Captura foto de publicidad nueva.');
        return;
      }

      if(this.esEdicion){
        let putEvaluacion = await this.editarEvaluacion();  
        if(!putEvaluacion){
          await this.utilitiesService.alert("", "¡Algo salió mal, intentálo más tarde!");
          return;
        }

      }else{
        
        // revisamos si hay internet y si no hay lo mandamos a stored and foward
        if(!this.hayInternet){
          await this.utilitiesService.alert("", "Por el momento no cuentas con internet, la evaluación se guardará en la memoria del dispositivo.");
          let datosUbicacion: GeocoderResult = JSON.parse(localStorage.getItem("geocoder"));
          let objeto: EvaluacionesRequest = {
            evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
            evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
            evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio,
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
            lista_competencias: this.ordenarCompetencias(),
            evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
          }
          await this.guardarEnStoredFoward(objeto)
          return;
        }

        let envioEvaluacion = await this.enviarEvaluacion();
        if(!envioEvaluacion){
          await this.utilitiesService.alert("", "¡Algo salió mal, intentálo más tarde!");
          return;
        }
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
      return respuesta.response;
    }
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cerrarFormularios() {
    this.navCtrl.navigateRoot('home');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async camara(opcion?:number): Promise<string> {
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
    });
    return fotoBase64;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async cambiarValores(){
    const valor = this.datosGenerales.value.tipoComercio;
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
      loading.dismiss();
      return this.subListaTipoComercio = respuesta.response;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public limpiarInput(tipo: number){
    //1 para limpiar input de razon social, 2 para limpiar outlet
    if (tipo === 1 && this.compartieronRazonSocial == false) {
      this.razonSocial.setValue(null);
      return;
    } else if(tipo != 1 && this.estasEnOutlet == false){
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
      this.fotoIdentificastePublicidad = await this.camara(5);
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async enviarEvaluacion(){
    let datosUbicacion: GeocoderResult = JSON.parse(localStorage.getItem("geocoder"));    
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    let objeto: EvaluacionesRequest = {
      evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
      evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
      evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio,
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
      lista_competencias: this.ordenarCompetencias(),
      evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
    }
    const url = 'Operaciones/Evaluacion';
    const respuesta: any = await this.webRayoService.postAsync(url, objeto);
    if ( respuesta == null || respuesta.success === false ) {
      loading.dismiss();
      return false;
    } else
      loading.dismiss();
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
  // limpiar fotos
  public limpiarFotos(imgBase64: string){
    let stringBase64: string = "data:image/jpeg;base64," 
    let seEncuentraStringBase64 = imgBase64.indexOf(stringBase64);
    if (seEncuentraStringBase64 !== -1){
      imgBase64 = imgBase64.replace(stringBase64, "")
    }

    let stringBase62Jpg = "data:image/jpg;base64,";
    let seEncuentraStringBase64Jpj = imgBase64.indexOf(stringBase62Jpg);
    if (seEncuentraStringBase64Jpj !== -1){
      imgBase64 = imgBase64.replace(stringBase62Jpg, "")
    }

    return imgBase64;
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

    // agregamos las competencias que vienen de catalogos
    for (let i = 0; i < listaPreeliminar.length; i++) {
      let competencia: Competencias = {
        ecompentencia_comentario: "",
        ecompentencia_catalogo_competencia: listaPreeliminar[i].crelacion_id_hijo,
        ecompentencia_catalogo_competencia_material: listaPreeliminar[i].crelacion_id_padre,
        ecompentencia_foto: "",
        ecompentencia_evaluacion_id: 0
      }
      listaCompetencias.push(competencia);
    }

    if (this.tercerOpcionPasoCinco) {
      // limpiamos la foto de idetificaste nueva publicidad
      this.fotoDefault = '';
      if(this.fotoIdentificastePublicidad != ''){
      let stringBase64: string = "data:image/jpeg;base64," 
      let seEncuentraStringBase64 = this.fotoIdentificastePublicidad.indexOf(this.fotoIdentificastePublicidad);
        if (seEncuentraStringBase64 !== -1){
          this.fotoDefault = this.fotoIdentificastePublicidad.replace(stringBase64, "")
        }
      }
      
      // agregamos las competencias que vienen por default
      let competenciaCatalogo: Competencias = {
        ecompentencia_evaluacion_id: 0,
        ecompentencia_comentario: this.comentarios,
          ecompentencia_catalogo_competencia: 0,
          ecompentencia_catalogo_competencia_material: 0,
          ecompentencia_foto: this.fotoIdentificastePublicidad != '' ? this.fotoDefault : ''
      }

      listaCompetencias.push(competenciaCatalogo);
    }
   
    return listaCompetencias;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async llenarDatos(evaluacion){
    if(evaluacion.evaluacion_nombre_outlet != null && evaluacion.evaluacion_nombre_outlet != '')
      this.estasEnOutlet = true;

    if(evaluacion.evaluacion_razon_social != null && evaluacion.evaluacion_razon_social != '')
      this.compartieronRazonSocial = true;

    if (this.listaTipoComercio.find(item => item.cagenerico_clave == evaluacion.evaluacion_ca_tipo_comercio) != null) {
      this.tipoComercio.setValue(evaluacion.evaluacion_ca_tipo_comercio);
      await this.buscarSubtipoComercio(evaluacion.evaluacion_ca_tipo_comercio)
    }
    // paso 1:
    this.nombreEstablecimiento.setValue(evaluacion.evaluacion_nombre_establecimiento);  
    this.razonSocial.setValue(evaluacion.evaluacion_razon_social == null? null: evaluacion.evaluacion_razon_social);
    this.subTipoComercio.setValue(evaluacion.evaluacion_ca_tipo_sub_comercio);
    this.nombreOutlet.setValue(evaluacion.evaluacion_nombre_outlet == null? null: evaluacion.evaluacion_nombre_outlet);

    // paso 3:
    this.comunicacion.setValue(evaluacion.evaluacion_ca_id_comunicacion)
    this.localizacionItem.setValue(evaluacion.evaluacion_localizacion_id)

    if (evaluacion.list_fotografias) {

      this.sliderOne.slidesItems.forEach(slide => {
        evaluacion.list_fotografias.forEach(evaluacion => {
            if (evaluacion.efotografia_catalogo_id_evidencia == slide.cagenerico_clave) {
              slide.seleccionado = true;
            }
          });
      });
    }

    // paso 4:
    // aquí se hace match para la foto de fachada
    evaluacion.list_fotografias.forEach(foto => {
      if(foto.efotografia_catalogo_id_evidencia == 0){
        this.tempImg = "data:image/jpeg;base64," + foto.fotografia_base64
      }

      this.sliderOne.slidesItems.forEach(sliders => {
        if (sliders.cagenerico_clave == foto.efotografia_catalogo_id_evidencia) {
          sliders.fotoBase64 = "data:image/jpeg;base64," + foto.fotografia_base64
        }
      });
    });

    // paso 5: 
    // primero se va a hacer lo de comentarios
    let arregloCompetenciasSeleccionadas = [];

    for (let i = 0; i < evaluacion.lista_competencias.length; i++) {
      // la seccion que viene por default
      if(evaluacion.lista_competencias[i].ecompentencia_ca_clave_generico == 0){
        // activamos el toogle
        this.tercerOpcionPasoCinco = true;
        if(evaluacion.lista_competencias[i].ecompentencia_comentario != null && evaluacion.lista_competencias[i].ecompentencia_comentario != ''){
          this.comentarios = evaluacion.lista_competencias[i].ecompentencia_comentario;
        }

        //se va a poner la foto
        if (evaluacion.lista_competencias[i].fotografia_base64 != null && evaluacion.lista_competencias[i].fotografia_base64 != '') {
          this.fotoIdentificastePublicidad = "data:image/jpeg;base64," + evaluacion.lista_competencias[i].fotografia_base64;
        }
      }

      // las opciones que vienen de los catalogos
      if(evaluacion.lista_competencias[i].ecompentencia_ca_clave_generico != 0){
        arregloCompetenciasSeleccionadas.push(evaluacion.lista_competencias[i].ecompentencia_ca_clave_generico)
      }
      
    }

    // con esto colocamos lo de las competencias
    for (let i = 0; i < this.lstaCompetencia.length; i++) {
      for (let j = 0; j < this.lstaCompetencia[i].arregloHijos.length; j++) {
        for (let k = 0; k < arregloCompetenciasSeleccionadas.length; k++) {
          if(this.lstaCompetencia[i].arregloHijos[j].crelacion_id_hijo == arregloCompetenciasSeleccionadas[k]){
            this.lstaCompetencia[i].prendido = true;
            this.lstaCompetencia[i].arregloHijos[j].estatus = true;
          }
        }
      } 
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irPasoAtras(){
    if (!this.esEdicion) {
      this.pasoFormulario = this.pasoFormulario - 1;
    }else{
      if (this.pasoFormulario == 3) {
        this.pasoFormulario = 1;
        return;
      }
      this.pasoFormulario = this.pasoFormulario - 1
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async editarEvaluacion(){
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();

    let objeto: any = {
      evaluacion_id: this.evaluacion.evaluacion_id,
      evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
      evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
      evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio.cagenerico_clave,
      evaluacion_ca_tipo_sub_comercio: this.datosGenerales.value.subTipoComercio,
      evaluacion_outlet: this.estasEnOutlet == false? 0: 1,
      evaluacion_nombre_outlet: this.estasEnOutlet ?  this.datosGenerales.value.nombreOutlet: null,
      evaluacion_numero: this.datosUbicacion.value.numeroEstablecimiento,
      evaluacion_renovacion: 0,
      evaluacion_ca_id_comunicacion: this.seleccioneMaterial.value.comunicacion,
      evaluacion_localizacion_id: this.seleccioneMaterial.value.localizacionItem,
      list_fotografias: this.ordenarListaFotos(),
      lista_competencias: this.ordenarCompetencias(),
      evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
    }
    objeto.list_fotografias.forEach(foto => {
      foto.efotografia_bandera_modificacion = 1
    });

    for (let i = 0; i < this.evaluacion.list_fotografias.length; i++) {
      for (let j = 0; j < objeto.list_fotografias.length; j++) {
        if(this.evaluacion.list_fotografias[i].efotografia_catalogo_id_evidencia == objeto.list_fotografias[j].efotografia_catalogo_id_evidencia){
          objeto.list_fotografias[j].efotografia_fotografia = this.evaluacion.list_fotografias[i].efotografia_fotografia
          objeto.list_fotografias[j].efotografia_id = this.evaluacion.list_fotografias[i].efotografia_id
        }

      }
    }

    // evaluacion.lista_competencias.ecompentencia_id

    for (let i = 0; i < this.evaluacion.lista_competencias.length; i++) {

      for (let j = 0; j < objeto.lista_competencias.length; j++) {
        
        if(objeto.lista_competencias[j].ecompentencia_catalogo_competencia == 0 && objeto.lista_competencias[j].ecompentencia_foto != ''){
          objeto.lista_competencias[j].img_modificada = 1
          objeto.lista_competencias[j].imagBase64 = this.limpiarFotos(this.fotoIdentificastePublicidad)
          objeto.lista_competencias[j].ecompentencia_foto = this.evaluacion.lista_competencias[i].ecompentencia_foto
          // ecompentencia_foto
          console.log("objeto edcion", this.evaluacion.lista_competencias[i].ecompentencia_foto)
          console.log("objeto a enviar", objeto.lista_competencias[j])
        }else{
          objeto.lista_competencias[j].img_modificada = 0
        }

        if (this.evaluacion.lista_competencias[i].ecompentencia_ca_clave_generico == objeto.lista_competencias[j].ecompentencia_catalogo_competencia) {
          objeto.lista_competencias[j].ecompentencia_id = this.evaluacion.lista_competencias[i].ecompentencia_id
          objeto.lista_competencias[j].ecompentencia_evaluacion_id = this.evaluacion.lista_competencias[i].ecompentencia_evaluacion_id
        }
      }
    }
    
      // "mensaje": "string",
      // "imagBase64": "string"
    console.log(objeto)
    // return;
    
    const url = 'Operaciones/Evaluacion/Put';
    const respuesta: any = await this.webRayoService.putAsync(url, objeto);
    if ( respuesta == null || respuesta.success === false ) {
      loading.dismiss();
      return false;
    } else
      loading.dismiss();
      return true;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async guardarEnStoredFoward(evaluacion:Object){
    let evaluacionesGuardadasLocal = JSON.parse(localStorage.getItem("evaluaciones_store_foward"));

    if (evaluacionesGuardadasLocal == null) {
      // si no hay evaluaciones esto se hace
      localStorage.setItem('evaluaciones_store_foward', JSON.stringify(evaluacion));
    }else{
      // si hay evaluaciones
      evaluacionesGuardadasLocal.push(evaluacion);
    }
    
  }
  
}
