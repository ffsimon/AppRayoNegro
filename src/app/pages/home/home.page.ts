import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NavController, Platform } from '@ionic/angular';
import { ChartOptions, ChartType } from 'chart.js';
import { EvaluacionesRequest } from 'src/app/models/evaluacion_request_model';
import { objetivos_usuario } from 'src/app/models/objetivos';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';


export enum ConnectionStatus {
  Online,
  Offline
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  

  // public status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);
  public primerDia: Date = null;
  public ultimoDia: Date = null;
  clickedImage: string = '';
  public numeroEvaluacionesGuardadasLocal: any = null;
  public evaluacionesStoredFoward: Array<EvaluacionesRequest> = null;
  public espejoEvaluacionesStoredFoward: Array<EvaluacionesRequest> = null;
  public seDieronDeAltaTodasLasEvaluaciones: boolean = true;
  public isConnected = false;
  public datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)'
    ],
    borderWidth: 1
  }]
  public barChartOptions: (ChartOptions & { annotation: any }) = {
    scales: {
      xAxes: [{
        gridLines: {
          display: false,
        }
      }],
      yAxes: [{
        gridLines: {
          display: false
        },
        ticks: {
          display: false
        }
      }]
    },
    annotation: {
      annotations: [
      ],
    }
  };
  public barChartLabels: any[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public usuarioSesion: usuario_sesion_model; 
  public mesActual: string = '';
  public barChartColors: Array<any> = [
    {
      backgroundColor: '#1C2226',
      borderColor: '#41719C',
      borderWidth: 2
    }];
  public barChartData= [];
  public verObjetivos: boolean = true;
  public objetivos: objetivos_usuario = null;
  public trabajadas : any;
  public realizadas: any;
  public objetivoTrabajadas: any;
  public objetivoRealizadas: any;
  public evaluacionPorDia: number = 0;
  public diaString: string = '';
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private navCtrl: NavController,  
    private utilitiesService: UtilitiesService, 
    private webRayoService: WebRayoService, 
    private network: Network, 
    public camera: Camera, 
    public platform: Platform) { 

    this.usuarioSesion = JSON.parse(localStorage.getItem('usuario_sesion'));
    this.mesActual = this.utilitiesService.obtenerMesStringActual();
    this.numeroEvaluacionesGuardadasLocal = JSON.parse(localStorage.getItem('evaluaciones_store_foward'));

    if(this.numeroEvaluacionesGuardadasLocal == null){
      this.numeroEvaluacionesGuardadasLocal = 0;
    } else {
        this.numeroEvaluacionesGuardadasLocal = this.numeroEvaluacionesGuardadasLocal.length;
        this.evaluacionesStoredFoward = JSON.parse(localStorage.getItem('evaluaciones_store_foward'));
    }
    console.log(this.numeroEvaluacionesGuardadasLocal);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public refrescarPantalla(){
    if(this.numeroEvaluacionesGuardadasLocal == null){
      this.numeroEvaluacionesGuardadasLocal = 0;
    } else{
        this.numeroEvaluacionesGuardadasLocal = this.numeroEvaluacionesGuardadasLocal.length;
        this.evaluacionesStoredFoward = JSON.parse(localStorage.getItem('evaluaciones_store_foward'));
      }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
    this.obtenemosDia();
    this.obtenerSemana();
    await this.obtenerObjetivos();
    let valoresGraficas = [];
    let valoresLabels = [];

    if(this.objetivos != null){
      for (let i = 0; i < this.objetivos.list_objetivos.length; i++) {
        if(this.objetivos.list_objetivos[i].tipo_objetivo == 1){
          this.trabajadas = this.objetivos.list_objetivos[i];
          
        } 
        if(this.objetivos.list_objetivos[i].tipo_objetivo == 2){
          this.realizadas = this.objetivos.list_objetivos[i];
        } 
        if(this.objetivos.list_objetivos[i].tipo_objetivo == 3){
          this.objetivoTrabajadas = this.objetivos.list_objetivos[i];
        } 
        if(this.objetivos.list_objetivos[i].tipo_objetivo == 4){
          this.objetivoRealizadas = this.objetivos.list_objetivos[i];
        }   
      }
  
       // asignamos los valores de las graficas 
       for (let i = 0; i < this.objetivos.informacion_graficas.length; i++) {
         valoresGraficas.push(this.objetivos.informacion_graficas[i].evaluaciones);
         valoresLabels.push(this.objetivos.informacion_graficas[i].dia)
       }
       this.barChartData = [{ data: valoresGraficas}]
       this.barChartLabels = valoresLabels;
    }

  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irEvaluaciones() {
    this.navCtrl.navigateRoot('evaluaciones');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irNuevaEvaluacion() {
    this.navCtrl.navigateRoot('alta-establecimiento');
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async obtenerObjetivos(){
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();

    let objeto = {
      objetivos_usuario_id: this.usuarioSesion.user_id
    }
    const url = 'Operaciones/ObjetivosUsuario/Get';
    const respuesta: any = await this.webRayoService.postAsync(url, objeto);
    console.log(respuesta)
    if ( respuesta == null || respuesta.success === false ) {
      this.objetivos = null;
      loading.dismiss();
      return;
    } else{
      this.objetivos = respuesta.response[0];

      for (let i = 0; i < respuesta.response[0].informacion_graficas.length; i++) {
      console.log(respuesta.response[0].informacion_graficas[i])
        if (this.diaString == respuesta.response[0].informacion_graficas[i].dia) {
          this.evaluacionPorDia = respuesta.response[0].informacion_graficas[i].evaluaciones;
        }
      }

      this.evaluacionPorDia
      loading.dismiss();
      return;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async guardarStoredFoward(){

    if(this.numeroEvaluacionesGuardadasLocal == null || this.numeroEvaluacionesGuardadasLocal == 0){
      await this.utilitiesService.alert('', 'Por el momento no hay evaluaciones guardadas en el tel??fono.');
      return;
    }


    await this.testNetworkConnection();
    if(!this.isConnected){
      await this.utilitiesService.alert('', 'Int??ntalo cuando cuentes con internet');
      return;
    }

    // vamos a dar de alta los registros guardados en memoria
   let respuesta = await this.utilitiesService.presentAlertConfirm('A continuaci??n se dar(??n) ' + this.numeroEvaluacionesGuardadasLocal + 
   ' evaluacion(es) de alta, ??Deseas continuar?');

    if(respuesta == false)
      return;

    // ahora si a dar de alta las evaluaciones
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    // vamos a ver hacer el recorrido de las evaluaciones
    const evaluacionesGuardadas: Array<EvaluacionesRequest> = [];
    const evalaucionesNoGuardadas: Array<EvaluacionesRequest> = [];

   
    if (this.evaluacionesStoredFoward.length > 0) {
      this.evaluacionesStoredFoward.forEach(async element => {
        const url = 'Operaciones/Evaluacion';
        const respuestaPost: any = await this.webRayoService.postAsync(url, element);
        if ( respuestaPost == null || respuestaPost.success === false ) {
          evalaucionesNoGuardadas.push(element);
        } else{
          evaluacionesGuardadas.push(element);
        }
      });
    }

    loading.dismiss();

    localStorage.removeItem('evaluaciones_store_foward');
    if (evalaucionesNoGuardadas.length === 0) {
      localStorage.setItem('evaluaciones_store_foward', null);
    } else {
      localStorage.setItem('evaluaciones_store_foward', JSON.stringify(evalaucionesNoGuardadas));
    }

    this.numeroEvaluacionesGuardadasLocal = evalaucionesNoGuardadas.length;
    console.log('Numero de evaluaciones por sincronizar', evalaucionesNoGuardadas.length);

    if (evalaucionesNoGuardadas.length === 0) {
      await this.utilitiesService.alert('', 'Se dieron de alta todas las evaluaciones guardadas en local.');
    } else {
      await this.utilitiesService.alert('', 'Al menos una evaluaci??n no se dio de alta.');
    }
    // this.refrescarPantalla();
  }


  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  
  public obtenerSemana() {

    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
    var last = first + 5; // last day is the first day + 6
    this.primerDia = new Date(curr.setDate(first));
    this.ultimoDia = new Date(curr.setDate(last));

    console.log(this.primerDia)
    console.log(this.ultimoDia)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  captureImage() {
      
      let options2: CameraOptions = {
        quality: 30,
        correctOrientation: true,
        allowEdit: false,
        targetWidth: 400,
        targetHeight: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
     }

     let galleryOptions: CameraOptions = {
      quality: 30,
      correctOrientation: true,
      allowEdit: false,
      targetWidth: 400,
      targetHeight: 600,
      sourceType: this.camera.PictureSourceType.CAMERA,
      // sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
     }

     const options: CameraOptions = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 400
    }

      console.log (JSON.stringify (options));

      this.camera.getPicture(options).then(async (imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64 (DATA_URL):
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.clickedImage = base64Image;
      }, (err) => {
        console.log(err);
        this.utilitiesService.alert(err, err)
      });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  
  public async testNetworkConnection() {
    const loading = await this.utilitiesService.loadingAsync();
    loading.present();
    let resultado = await this.webRayoService.getCoordenadas("https://jsonplaceholder.typicode.com/todos/1");
    if(resultado.success === false){
      this.isConnected = false;
    }else{
      this.isConnected = true;
    }
    loading.dismiss();
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  
  public obtenemosDia(){
    let fecha = new Date().getDay();
    switch (fecha) {
      case 0:
        this.diaString = 'D'
        break;
      case 1:
        this.diaString = 'L'
      break;
      case 2:
        this.diaString = 'M'
        break;
      case 3:
        this.diaString = 'Mi'
      break;
      case 4:
        this.diaString = 'J'
        break;
      case 5:
        this.diaString = 'V'
      break;
      case 6:
        this.diaString = 'S'
        break;
      
    }
  }
}