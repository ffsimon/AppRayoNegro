import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonSlides, NavController } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { WebRayoService } from 'src/app/services/web-rayo.service';
import { Competencias, EvaluacionesRequest, Fotografias } from 'src/app/models/evaluacion_request_model';
import { GeocoderGoogleResult, GeocoderResult } from 'src/app/models/geocoder_model';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { ActivatedRoute } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { NetworkService } from '../../services/network.service';
import { debounceTime } from 'rxjs/operators';


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
  public hayInternet: boolean = null;
  public esEdicion: boolean = false;
  public evaluacion = null;
  public colonia: string = "";
  public calle: string = "";
  public municipio: string = "";
  public ciudad: string = "";
  public codigoPostal: string = "";
  public listaMastercardRadio: any[] = [
    { nombre: 'Sticker', valor: 'sticker' },
    { nombre: 'Reloj (open / close)', valor: 'reloj' },
    { nombre: 'Acrilico', valor: 'acrilico' }
  ];
  public Event: any;
  public Image: any;

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

  public datosUbicacionGeocoder: GeocoderResult = null;
  public datosUbicacionLocal: any = null;
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private utilitiesService: UtilitiesService,
    private webRayoService: WebRayoService,
    private camera: Camera,
    private route: ActivatedRoute,
    private network: Network, 
    public networkService: NetworkService) {    

    if(this.route.snapshot.data["establecimiento"]){
      this.esEdicion = true;
      this.evaluacion = this.route.snapshot.data["establecimiento"];
    }
    this.usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion"));
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
    if(this.usuarioSesion.tbl_bandera_offline == 1){
      this.listaTipoComercio = JSON.parse(localStorage.getItem("tipoComercio"));
      this.subListaTipoComunicacion = JSON.parse(localStorage.getItem("subListaTipoComunicacion"));
      this.subListaTipoLocalizacion = JSON.parse(localStorage.getItem("subListaTipoLocalizacion"));
      this.sliderOne = JSON.parse(localStorage.getItem("slidesItems"));
      this.lstaCompetencia = JSON.parse(localStorage.getItem("listaCompetencia"))
    }else{
      await this.obtenerTipoComercion();
      await this.obtenerListaComunicacion();
      await this.obtenerListaLocalizacion();
      await this.obtenerBaners();
      await this.obtenerCompetencia(); 
    }
    
    if (this.esEdicion) {
      this.llenarDatos(this.evaluacion);
    }
    this.networkSubscriber();
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  networkSubscriber(): void {
    this.networkService
        .getNetworkStatus()
        .pipe(debounceTime(300))
        .subscribe((connected: boolean) => {
          this.hayInternet = connected
          console.log(this.hayInternet);
        });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerTipoComercion(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 1,
      cagenerico_ca_tipo_activo: 1
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
  public validarGeocoder = () => {
    const datosUbicacion: GeocoderResult = JSON.parse(localStorage.getItem('geocoder'));
     if (datosUbicacion != null) {
       this.datosUbicacionGeocoder = datosUbicacion;
       return true;
     } else {
       return false;
     }
  };

  public hola(){}

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public validarGeocoderGoogle = () => {
      const datosUbicacion: GeocoderResult = JSON.parse(localStorage.getItem('direccionLocal'));
       if (datosUbicacion != null || datosUbicacion != undefined) {
         this.datosUbicacionLocal = datosUbicacion;
         return true;
       } else {
        this.datosUbicacionLocal = null;
         return false;
       }
  };

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async validacionDatosGenerales() {
    console.log(this.pasoFormulario)
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
     
      const datosUbicacion: GeocoderGoogleResult = JSON.parse(localStorage.getItem("direccionLocal"));

      if(this.datosUbicacion.value.numeroEstablecimiento == null || this.datosUbicacion.value.numeroEstablecimiento === ''){
        this.utilitiesService.alert('', 'Agrega el número del establecimiento.');
          return;
      }

      if(this.datosUbicacionLocal != null){
        // revisemos si tiene un codigo postal en el objeto guardado
        if(datosUbicacion.codigoPostal == null){
          if(this.codigoPostal == null || this.codigoPostal == ''){
            this.utilitiesService.alert('', 'Agrega el código postal.');
              return;
          }
        }

        if(datosUbicacion.calle == null){
          if(this.calle == null|| this.calle == ''){
            this.utilitiesService.alert('', 'Agrega el nombre de la calle.');
              return;
          }
        }

        if(datosUbicacion.municipio == null){
          if(this.municipio == null|| this.municipio == ''){
            this.utilitiesService.alert('', 'Agrega el nombre del municipio.');
              return;
          }
        }

        if(datosUbicacion.colonia == null){
          if(this.colonia == null|| this.colonia == ''){
            this.utilitiesService.alert('', 'Agrega el nombre de la colonia.');
              return;
          }
        }
      }else{
        if(this.colonia == null|| this.colonia == '' || this.municipio == null|| this.municipio == '' || this.calle == null|| this.calle == '' || this.codigoPostal == null || this.codigoPostal == ''){
          this.utilitiesService.alert('', 'Todos los campos son requeridos.');
          return;
        }
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
      if (this.opcionesParafoto.length > 0) {
        this.opcionesParafoto.forEach(element => {
          if (element.fotoBase64 === '') {
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
      if(this.tercerOpcionPasoCinco && this.fotoIdentificastePublicidad === ''){
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
        if(this.usuarioSesion.tbl_bandera_offline == 1){
          await this.utilitiesService.alert("", "Tus evaluaciones se guardaran en la memoria del dispositivo, ya que tienes habilitada la opción 'Guardar offline'.");
          let objeto: EvaluacionesRequest = {
            evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
            evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
            evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio,
            evaluacion_ca_tipo_sub_comercio: this.datosGenerales.value.subTipoComercio,
            evaluacion_outlet: this.estasEnOutlet == false? 0: 1,
            evaluacion_nombre_outlet: this.estasEnOutlet ?  this.datosGenerales.value.nombreOutlet: null,
            evaluacion_numero: this.datosUbicacion.value.numeroEstablecimiento,
            evaluacion_calle: this.calle,
            evaluacion_colonia: this.colonia,
            evaluacion_municipio_alcadia: this.municipio,
            evaluacion_cp: this.codigoPostal,
            evaluacion_latitud: "19.42847",
            evaluacion_longitud: "-99.12766",
            direccion_completa: this.calle + ", " + this.colonia + ", " + this.municipio + ", " + this.codigoPostal,
            evaluacion_renovacion: 0,
            evaluacion_ca_id_comunicacion: this.seleccioneMaterial.value.comunicacion,
            evaluacion_localizacion_id: this.seleccioneMaterial.value.localizacionItem,
            list_fotografias: this.ordenarListaFotos(),
            lista_competencias: this.ordenarCompetencias(),
            evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
          };
          await this.guardarEnStoredFoward(objeto)
          localStorage.removeItem('direccionLocal');
          localStorage.removeItem('coordenadas');
          this.navCtrl.navigateRoot('home');
          return;
        }

        // no hay internet
        if(!this.hayInternet){
          await this.utilitiesService.alert("", "Por el momento no cuentas con internet, la evaluación se guardará en la memoria del dispositivo.");
          const datosUbicacion: GeocoderGoogleResult = JSON.parse(localStorage.getItem("direccionLocal"))
          let stringCalle = '';
          let stringColonia = '';
          let municipio = '';
          let estado = '';
          let codigoPostal = '';
          let latitud = '';
          let longitug = '';
          let direccionCompleta = '';
          
          const coordenadas: string = JSON.parse(localStorage.getItem("coordenadas"))
          if(coordenadas != null){
            var stringCoordenadas = coordenadas;
            var res = stringCoordenadas.split(",");
            latitud = res[0];
            longitug = res[1];
          }
                
          
          if (datosUbicacion != null) {
            stringCalle = datosUbicacion.calle != null && datosUbicacion.colonia != '' ? datosUbicacion.calle : this.calle;
            stringColonia = datosUbicacion.colonia != null && datosUbicacion.colonia != '' ? datosUbicacion.colonia : this.colonia;
            municipio = datosUbicacion.municipio !== '' && datosUbicacion.municipio !== null ? datosUbicacion.municipio : this.municipio;
            codigoPostal = datosUbicacion.codigoPostal != null &&  datosUbicacion.codigoPostal != '' ? datosUbicacion.codigoPostal : this.codigoPostal;
            direccionCompleta = datosUbicacion.direccion_completa != null && datosUbicacion.direccion_completa != null ? datosUbicacion.direccion_completa : '';


            if (datosUbicacion.estado != null && datosUbicacion.estado != '') {
              estado = datosUbicacion.municipio != null || datosUbicacion.municipio !=  '' ?
                `${datosUbicacion.estado}/${datosUbicacion.municipio}` : `${datosUbicacion.estado}/${this.municipio}`;
            } 
          }

          if(datosUbicacion == null){
            direccionCompleta = this.calle + ", " + this.colonia + ", " + this.municipio + ", " + this.codigoPostal;
          }
          let objeto: EvaluacionesRequest = {
            evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
            evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
            evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio,
            evaluacion_ca_tipo_sub_comercio: this.datosGenerales.value.subTipoComercio,
            evaluacion_outlet: this.estasEnOutlet == false? 0: 1,
            evaluacion_nombre_outlet: this.estasEnOutlet ?  this.datosGenerales.value.nombreOutlet: null,
            evaluacion_numero: this.datosUbicacion.value.numeroEstablecimiento,
            evaluacion_calle: this.datosUbicacionLocal != null ? stringCalle : this.calle,
            evaluacion_colonia: this.datosUbicacionLocal != null ? stringColonia : this.colonia,
            evaluacion_municipio_alcadia: this.datosUbicacionLocal != null ? estado : this.municipio,
            evaluacion_cp: this.datosUbicacionLocal != null ?  codigoPostal : this.codigoPostal,
            evaluacion_latitud: datosUbicacion != null ? String(datosUbicacion.latitud): latitud,
            evaluacion_longitud: datosUbicacion != null ? String(datosUbicacion.longitud): longitug,
            direccion_completa: direccionCompleta,
            evaluacion_renovacion: 0,
            evaluacion_ca_id_comunicacion: this.seleccioneMaterial.value.comunicacion,
            evaluacion_localizacion_id: this.seleccioneMaterial.value.localizacionItem,
            list_fotografias: this.ordenarListaFotos(),
            lista_competencias: this.ordenarCompetencias(),
            evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
          };

          await this.guardarEnStoredFoward(objeto)
          localStorage.removeItem('direccionLocal');
          localStorage.removeItem('coordenadas');
          this.navCtrl.navigateRoot('home');
          return;
        }else{

          // hay internet
          debugger
          let envioEvaluacion = await this.enviarEvaluacion();
          if(!envioEvaluacion){
            await this.utilitiesService.alert("¡Algo salió mal!", "Se guardará en el dispositivo.");
          
            let objeto = await this.enviarEvaluacion(true);
            await this.guardarEnStoredFoward(objeto)
            localStorage.removeItem('direccionLocal');
            localStorage.removeItem('coordenadas');
            this.navCtrl.navigateRoot('home');
            return;
          }else{
            localStorage.removeItem('coordenadas');
            this.utilitiesService.alert('¡Éxito!', 'Se ha guardado exitosamente el establecimiento.');
            this.navCtrl.navigateRoot('home');
          }
        
        }
      }
    }

    this.pasoFormulario = this.pasoFormulario + 1;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerListaComunicacion(){
    const params = this.webRayoService.fromObjectToGETString({
      cagenerico_ca_tipo_id: 4,
      cagenerico_ca_tipo_activo: 1
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
      cagenerico_ca_tipo_id: 5,
      cagenerico_ca_tipo_activo: 1
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
      cagenerico_ca_tipo_id: 2,
      cagenerico_ca_tipo_activo: 1
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
      cagenerico_ca_tipo_id: 6,
      cagenerico_ca_tipo_activo: 1
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
      crelacion_id_padre: idPadre,
      crelacion_activo: 1
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
    
    const modeloProhibido: string = localStorage.getItem("esModeloProhibido");

    let fotoBase64 = '';
    const options: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: modeloProhibido == 'si' ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA, 
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

    // validamos el offline
    if(this.usuarioSesion.tbl_bandera_offline == 1){
      this.subListaTipoComercio = [];
      let listaSubtipoComercio = JSON.parse(localStorage.getItem("subTipoComercio"));
      if(listaSubtipoComercio != null){
        for (let i = 0; i < listaSubtipoComercio.length; i++) {
          if(listaSubtipoComercio[i].crelacion_id_padre == idPadre){
            this.subListaTipoComercio.push(listaSubtipoComercio[i])
          }
        }
      }
      loading.dismiss()
      return this.subListaTipoComercio;
    }
    
    const params = this.webRayoService.fromObjectToGETString({
      crelacion_id_padre: idPadre,
      crelacion_activo: 1
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
  public ayuda(numero:number){
    if(numero == 1){
      this.utilitiesService.alert("","Son aquellos comercios que seleccionaras que te encuentres del menú que son 4. <h5> ALIMENTOS: </h5> Aquí colocaras todos aquellos comercios que se refieran a restaurantes, Taquerías, Torerías, Loncherías, comida rápida, cocinas económicas, cafeterías, etc.<h5>AUTOSERVICIO:</h5> Aquí colocaras todos aquellos comercios que se refieran a Walmart, Comercial Mexicana, Chedraui, Oxxo, 7 Eleven, Circle K o circulo K, Mini Bodega Aurrera Express, Mini Chedraui, Yepas, Copel, etc. <h5>BOUTIQUE:</h5> Estos comercios se refieren a todos aquellos que sean para tiendas de ropa, zapaterías, lencería, Forever 21, Zara, Cuidado con el perro, Lacoste, Tommy Hilfiger, C&A, Sexi Jeans, La Riviera, 3 Hermanos y un lago Etc. <h5>SERVICIOS:</h5> Aquí colocarás todos aquellos comercios que te darán servicios directos, Farmacias, Tlapalerías, Papelerías, Tortillerías, Paleterías,Pastelerias, Doctores, Dentistas, Mercados, etc.")
      // this.utilitiesService.toast("Son aquellos comercios que seleccionaras que te encuentres del menú que son 4. <h5> ALIMENTOS: </h5> Aquí colocaras todos aquellos comercios que se refieran a restaurantes, Taquerías, Torerías, Loncherías, comida rápida, cocinas económicas, cafeterías, etc.<h5>AUTOSERVICIO:</h5> Aquí colocaras todos aquellos comercios que se refieran a Walmart, Comercial Mexicana, Chedraui, Oxxo, 7 Eleven, Circle K o circulo K, Mini Bodega Aurrera Express, Mini Chedraui, Yepas, Copel, etc. <h5>BOUTIQUE:</h5> Estos comercios se refieren a todos aquellos que sean para tiendas de ropa, zapaterías, lencería, Forever 21, Zara, Cuidado con el perro, Lacoste, Tommy Hilfiger, C&A, Sexi Jeans, La Riviera, 3 Hermanos y un lago Etc. <h5>SERVICIOS:</h5> Aquí colocarás todos aquellos comercios que te darán servicios directos, Farmacias, Tlapalerías, Papelerías, Tortillerías, Paleterías,Pastelerias, Doctores, Dentistas, Mercados, etc.")
    }
    if(numero == 2){
      this.utilitiesService.alert("", "<h5>SUBTIPO DE COMERCIO</h5><p style='font-size:10px'><strong>ALIMENTOS</strong>: <br /><br /><strong>CAFETER&Iacute;A:</strong> <br />Todos aquellos comercios que den alimentos, caf&eacute;, chocolate, etc. <br /><strong>COMIDA RAPIDA</strong> <br />Todos aquellos comercios como Mc. Donalds, Bourguer King, Spoletto, Wndys, Panda Express, Etc. <br /><strong>RESTAURANTE:</strong> <br />Aquellos comercios que den servicio de comida para sentarse, La p&eacute;rgola, Wings, Vips, Samborns Etc. <br /><strong>OTROS:</strong> <br />Aquellos comercios como loncher&iacute;as, restaurantes de cocina econ&oacute;micas o comida corrida, restaurantes de hot dogs, hamburguesas de calle. <br /><br /><strong>AUTOSERVICIO:</strong> <br /><br /><strong>CONVENIENCIA:</strong> <br />Son aquellas tiendas como Oxxo, 7 Eleven, Circle K, Ciculo K, Yepas, Bodega Aurrera Express, Mini Chedraui, etc.<br /><strong>FARMACIAS DE CADENA:</strong><br />Son aquellos comercios como Farmacias Guadalajara, Farmacias Benavides, Farmacias del Ahorro, Farmacias Similares. <br /><strong>OTROS:</strong><br />Los comercios que den opciones a compra donde uno mismo se pueda auto despachar.<br /><br /><strong>BOUTIQUE:</strong><br /><br /><strong>MODA:</strong><br />Son aquellas tiendas de marcas de renombre<br /><strong>ZAPATERIA:</strong><br />Son todos esos comercios que venden zapatos de cualquier tipo<br /><strong>OTROS:</strong><br />Tiendas de Mercado tradicional o aquellos locales comerciales que venden diferentes tipos de ropa en general<br /><br /><strong><strong>SERVICIOS:</strong><br /></strong><br /><strong><strong>SALUD:</strong><br /></strong> Ser&aacute;n todos aquellos Doctores, Dentistas, Terapeutas, Acupunturistas, etc <br><strong><strong>BELLEZA:</strong><br /></strong> Son todos los comercios relacionados con tiendas de cosm&eacute;ticos, est&eacute;ticas, peluquer&iacute;as, pod&oacute;logos, masajes, etc. <br /><strong><strong>GASOLINERAS:</strong><br /></strong> Son todas aquellas estaciones de Gasolineras, Gaseras y Di&eacute;sel.<br /><strong>TECNOLOGIA:</strong> <br />Son aquellas tiendas como Steren, Talleres de Tornos, Escuelas de manejo, Escuelas de Mec&aacute;nica Automotriz, Etc.</p>")
      // this.utilitiesService.toast("<h5>SUBTIPO DE COMERCIO</h5><p style='font-size:10px'><strong>ALIMENTOS</strong>: <br /><br /><strong>CAFETER&Iacute;A:</strong> <br />Todos aquellos comercios que den alimentos, caf&eacute;, chocolate, etc. <br /><strong>COMIDA RAPIDA</strong> <br />Todos aquellos comercios como Mc. Donalds, Bourguer King, Spoletto, Wndys, Panda Express, Etc. <br /><strong>RESTAURANTE:</strong> <br />Aquellos comercios que den servicio de comida para sentarse, La p&eacute;rgola, Wings, Vips, Samborns Etc. <br /><strong>OTROS:</strong> <br />Aquellos comercios como loncher&iacute;as, restaurantes de cocina econ&oacute;micas o comida corrida, restaurantes de hot dogs, hamburguesas de calle. <br /><br /><strong>AUTOSERVICIO:</strong> <br /><br /><strong>CONVENIENCIA:</strong> <br />Son aquellas tiendas como Oxxo, 7 Eleven, Circle K, Ciculo K, Yepas, Bodega Aurrera Express, Mini Chedraui, etc.<br /><strong>FARMACIAS DE CADENA:</strong><br />Son aquellos comercios como Farmacias Guadalajara, Farmacias Benavides, Farmacias del Ahorro, Farmacias Similares. <br /><strong>OTROS:</strong><br />Los comercios que den opciones a compra donde uno mismo se pueda auto despachar.<br /><br /><strong>BOUTIQUE:</strong><br /><br /><strong>MODA:</strong><br />Son aquellas tiendas de marcas de renombre<br /><strong>ZAPATERIA:</strong><br />Son todos esos comercios que venden zapatos de cualquier tipo<br /><strong>OTROS:</strong><br />Tiendas de Mercado tradicional o aquellos locales comerciales que venden diferentes tipos de ropa en general<br /><br /><strong><strong>SERVICIOS:</strong><br /></strong><br /><strong><strong>SALUD:</strong><br /></strong> Ser&aacute;n todos aquellos Doctores, Dentistas, Terapeutas, Acupunturistas, etc <br><strong><strong>BELLEZA:</strong><br /></strong> Son todos los comercios relacionados con tiendas de cosm&eacute;ticos, est&eacute;ticas, peluquer&iacute;as, pod&oacute;logos, masajes, etc. <br /><strong><strong>GASOLINERAS:</strong><br /></strong> Son todas aquellas estaciones de Gasolineras, Gaseras y Di&eacute;sel.<br /><strong>TECNOLOGIA:</strong> <br />Son aquellas tiendas como Steren, Talleres de Tornos, Escuelas de manejo, Escuelas de Mec&aacute;nica Automotriz, Etc.</p>")
    }
    if(numero == 3){
      this.utilitiesService.alert("", "<h5>TIPO DE COMUNICACIÓN</h5><div><span><b>CONTACTLESS:</b></span> <br><span>Es la comunicación que va doirigida a saber al cliente que podemos pagar sin contacto.</span> <br><span><b>CROSS BORDER:</b></span><br><span>Es la comunicación que va dirigida a los clientes que llegan de EUA principalmente a comprar en nuestro territorio.</span></div>")
      // this.utilitiesService.toast("<h5>TIPO DE COMUNICACIÓN</h5><div><span><b>CONTACTLESS:</b></span> <br><span>Es la comunicación que va doirigida a saber al cliente que podemos pagar sin contacto.</span> <br><span><b>CROSS BORDER:</b></span><br><span>Es la comunicación que va dirigida a los clientes que llegan de EUA principalmente a comprar en nuestro territorio.</span></div>")
    }
    if(numero == 4){
      this.utilitiesService.alert("", "<h5>SELECCIONA LOCALIZACIÓN</h5><div><span><b>DENTRO DEL NEGOCIO:</b></span> <br><span>Se coloca el material dentro del comercio señalizado</span> <br><span><b>EN TERMINAL DE PAGO:</b></span><br><span>Es cuando dejamos el material en la caja o en donde se localizan las terminales de pago.</span><br><span><b>ENTRADA:</b></span><br><span>Es cuando dejamos el material la puerta de entrada o entrada del comercio.</span><br><span><b>FUERA DE LA TIENDA:</b></span><br><span>Es cuando dejamos el material en alguna pared o colunma antes de la puerta o entrada del comercio.</span><br><span><b>OTROS:</b></span><br><span>Aquí anotaremos algún lugar extraordinario de colocación pero casi no se usa.</span></div>")
      // this.utilitiesService.toast("<h5>SELECCIONA LOCALIZACIÓN</h5><div><span><b>DENTRO DEL NEGOCIO:</b></span> <br><span>Se coloca el material dentro del comercio señalizado</span> <br><span><b>EN TERMINAL DE PAGO:</b></span><br><span>Es cuando dejamos el material en la caja o en donde se localizan las terminales de pago.</span><br><span><b>ENTRADA:</b></span><br><span>Es cuando dejamos el material la puerta de entrada o entrada del comercio.</span><br><span><b>FUERA DE LA TIENDA:</b></span><br><span>Es cuando dejamos el material en alguna pared o colunma antes de la puerta o entrada del comercio.</span><br><span><b>OTROS:</b></span><br><span>Aquí anotaremos algún lugar extraordinario de colocación pero casi no se usa.</span></div>")
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async tomarFoto(opt: number, posicion?: number) {
    if (opt === 1) {
      this.tempImg = await this.camara();
    } else if (opt === 2) {
      this.opcionesParafoto[posicion].fotoBase64 = await this.camara();
    } else if (opt === 3){
      this.fotoIdentificastePublicidad = await this.camara(5);
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async enviarEvaluacion(guardamosEnMemoria?){
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    const datosUbicacion: GeocoderGoogleResult = JSON.parse(localStorage.getItem("direccionLocal"))
    let stringCalle = '';
    let stringColonia = '';
    let municipio = '';
    let estado = '';
    let codigoPostal = '';
    let latitud = '';
    let longitug = '';
    let direccionCompleta = '';
    const coordenadas: string = JSON.parse(localStorage.getItem("coordenadas"))
    if(coordenadas != null){
      var stringCoordenadas = coordenadas;
      var res = stringCoordenadas.split(",");
      latitud = res[0];
      longitug = res[1];
    }

    if (datosUbicacion != null) {
      stringCalle = datosUbicacion.calle != null && datosUbicacion.colonia != '' ? datosUbicacion.calle : this.calle;
      stringColonia = datosUbicacion.colonia != null && datosUbicacion.colonia != '' ? datosUbicacion.colonia : this.colonia;
      municipio = datosUbicacion.municipio !== '' && datosUbicacion.municipio !== null ? datosUbicacion.municipio : this.municipio;
      codigoPostal = datosUbicacion.codigoPostal != null &&  datosUbicacion.codigoPostal != '' ? datosUbicacion.codigoPostal : this.codigoPostal;
      direccionCompleta = datosUbicacion.direccion_completa != null && datosUbicacion.direccion_completa != null ? datosUbicacion.direccion_completa : '';

      if (datosUbicacion.estado != null && datosUbicacion.estado != '') {
        estado = datosUbicacion.municipio != null || datosUbicacion.municipio !=  '' ?
          `${datosUbicacion.estado}/${datosUbicacion.municipio}` : `${datosUbicacion.estado}/${this.municipio}`;
      } 
    }

    if(datosUbicacion == null){
      direccionCompleta = this.calle + ", " + this.colonia + ", " + this.municipio + ", " + this.codigoPostal;
    }

    let objeto: EvaluacionesRequest = {
      evaluacion_nombre_establecimiento: this.datosGenerales.value.nombreEstablecimiento,
      evaluacion_razon_social: this.compartieronRazonSocial ? this.datosGenerales.value.razonSocial : null,
      evaluacion_ca_tipo_comercio: this.datosGenerales.value.tipoComercio,
      evaluacion_ca_tipo_sub_comercio: this.datosGenerales.value.subTipoComercio,
      evaluacion_outlet: this.estasEnOutlet == false? 0: 1,
      evaluacion_nombre_outlet: this.estasEnOutlet ?  this.datosGenerales.value.nombreOutlet: null,
      evaluacion_numero: this.datosUbicacion.value.numeroEstablecimiento,
      evaluacion_calle: this.datosUbicacionLocal != null ? stringCalle : this.calle,
      evaluacion_colonia: this.datosUbicacionLocal != null ? stringColonia : this.colonia,
      evaluacion_municipio_alcadia: this.datosUbicacionLocal != null ? estado : this.municipio,
      evaluacion_cp: this.datosUbicacionLocal != null ?  codigoPostal : this.codigoPostal,
      evaluacion_latitud: datosUbicacion != null ? String(datosUbicacion.latitud): latitud,
      evaluacion_longitud: datosUbicacion != null ? String(datosUbicacion.longitud): longitug,
      direccion_completa: direccionCompleta,
      evaluacion_renovacion: 0,
      evaluacion_ca_id_comunicacion: this.seleccioneMaterial.value.comunicacion,
      evaluacion_localizacion_id: this.seleccioneMaterial.value.localizacionItem,
      list_fotografias: this.ordenarListaFotos(),
      lista_competencias: this.ordenarCompetencias(),
      evaluacion_tbl_usuarios_id: this.usuarioSesion.user_id
    }

    if(guardamosEnMemoria == true){
      loading.dismiss();
      return objeto;
    }
    const url = 'Operaciones/Evaluacion';
    const respuesta: any = await this.webRayoService.postAsync(url, objeto);
    if ( respuesta == null || respuesta.success === false ) {
      loading.dismiss();
      return false;
    } else
      localStorage.removeItem('direccionLocal');
      loading.dismiss();
      return true;
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ordenarListaFotos(){
    // la foto de fachada que va por default que efotografia_catalogo_id_evidencia lleva
    let listafotos: Array<Fotografias> = [];

    // limpiamos la foto por default
    if(this.tempImg !== '' && this.tempImg != null){
      let stringBase64: string = "data:image/jpeg;base64," 
      let seEncuentraStringBase64 = this.tempImg.indexOf(stringBase64);
      if (seEncuentraStringBase64 !== -1){
        this.tempImg = this.tempImg.replace(stringBase64, "")
      }
      // agregamos la foto de fachada que esta por default
      let imagenFachadaDefault: Fotografias = { efotografia_catalogo_id_evidencia: 0, imagBase64: this.tempImg }
      listafotos.push(imagenFachadaDefault)
    }
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
    if(evaluacion.list_fotografias != null){
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
    }


    // paso 5: 
    // primero se va a hacer lo de comentarios
    let arregloCompetenciasSeleccionadas = [];

    if(evaluacion.list_fotografias != null){
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

    if(this.evaluacion.list_fotografias != null){
      for (let i = 0; i < this.evaluacion.list_fotografias.length; i++) {
        for (let j = 0; j < objeto.list_fotografias.length; j++) {
          if(this.evaluacion.list_fotografias[i].efotografia_catalogo_id_evidencia == objeto.list_fotografias[j].efotografia_catalogo_id_evidencia){
            objeto.list_fotografias[j].efotografia_fotografia = this.evaluacion.list_fotografias[i].efotografia_fotografia
            objeto.list_fotografias[j].efotografia_id = this.evaluacion.list_fotografias[i].efotografia_id
          }
  
        }
      }
    }

    if(this.evaluacion.lista_competencias != null){
      for (let i = 0; i < this.evaluacion.lista_competencias.length; i++) {
        for (let j = 0; j < objeto.lista_competencias.length; j++) {
          if(objeto.lista_competencias[j].ecompentencia_catalogo_competencia == 0 && objeto.lista_competencias[j].ecompentencia_foto != ''){
            objeto.lista_competencias[j].img_modificada = 1
            objeto.lista_competencias[j].imagBase64 = this.limpiarFotos(this.fotoIdentificastePublicidad)
            objeto.lista_competencias[j].ecompentencia_foto = this.evaluacion.lista_competencias[i].ecompentencia_foto
          }else{
            objeto.lista_competencias[j].img_modificada = 0
          }
          if (this.evaluacion.lista_competencias[i].ecompentencia_ca_clave_generico == objeto.lista_competencias[j].ecompentencia_catalogo_competencia) {
            objeto.lista_competencias[j].ecompentencia_id = this.evaluacion.lista_competencias[i].ecompentencia_id
            objeto.lista_competencias[j].ecompentencia_evaluacion_id = this.evaluacion.lista_competencias[i].ecompentencia_evaluacion_id
          }
        }
      }
    }


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
    let arrayEvaluaciones = [];
    let evaluacionesGuardadasLocal = JSON.parse(localStorage.getItem("evaluaciones_store_foward"));
 
    if (evaluacionesGuardadasLocal == null) {
      // si no hay evaluaciones esto se hace
      arrayEvaluaciones.push(evaluacion)
      localStorage.setItem('evaluaciones_store_foward', JSON.stringify(arrayEvaluaciones));
    }else{
      // si hay evaluaciones las eliminamos
      localStorage.removeItem("evaluaciones_store_foward");
      evaluacionesGuardadasLocal.push(evaluacion);
      // guardamos todo nuevamente
      localStorage.setItem('evaluaciones_store_foward', JSON.stringify(evaluacionesGuardadasLocal));
    }
    
  }
 
}
