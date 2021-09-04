import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { FCM } from '@ionic-native/fcm/ngx';
import { NavController, Platform } from '@ionic/angular';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { EvaluacionesRequest } from 'src/app/models/evaluacion_request_model';
import { objetivos_usuario } from 'src/app/models/objetivos';
import { usuario_sesion_model } from 'src/app/models/usuario_sesion';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { WebRayoService } from 'src/app/services/web-rayo.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public numeroEvaluacionesGuardadasLocal: any = null;
  public evaluacionesStoredFoward: Array<EvaluacionesRequest> = null;
  public espejoEvaluacionesStoredFoward: Array<EvaluacionesRequest> = null;
  public seDieronDeAltaTodasLasEvaluaciones: boolean = true;
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
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  constructor(private navCtrl: NavController,  
    private utilitiesService: UtilitiesService, 
    private webRayoService: WebRayoService, 
    private fcm: FCM, private plt: Platform) { 
    this.usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion"));
    this.mesActual = this.utilitiesService.obtenerMesStringActual();
    this.numeroEvaluacionesGuardadasLocal = JSON.parse(localStorage.getItem("evaluaciones_store_foward"));
    

    this.plt.ready()
      .then(() => {
        this.fcm.onNotification().subscribe(data => {
          if (data.wasTapped) {
            console.log("Received in background");
          } else {
            console.log("Received in foreground");
          };
        });

        this.fcm.onTokenRefresh().subscribe(token => {
          // Register your new token in your back-end if you want
          // backend.registerToken(token);
        });
      })

    if(this.numeroEvaluacionesGuardadasLocal == null){
      this.numeroEvaluacionesGuardadasLocal = 0;
    } else{
        this.numeroEvaluacionesGuardadasLocal = this.numeroEvaluacionesGuardadasLocal.length;
        this.evaluacionesStoredFoward = JSON.parse(localStorage.getItem("evaluaciones_store_foward"));
      }   
      
      console.log(this.numeroEvaluacionesGuardadasLocal)
      
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public refrescarPantalla(){
    if(this.numeroEvaluacionesGuardadasLocal == null){
      this.numeroEvaluacionesGuardadasLocal = 0;
    } else{
        this.numeroEvaluacionesGuardadasLocal = this.numeroEvaluacionesGuardadasLocal.length;
        this.evaluacionesStoredFoward = JSON.parse(localStorage.getItem("evaluaciones_store_foward"));
      }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  async ngOnInit() {
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
    this.navCtrl.navigateRoot("evaluaciones");
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public irNuevaEvaluacion() {
    this.navCtrl.navigateRoot("alta-establecimiento");
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
    if ( respuesta == null || respuesta.success === false ) {
      this.objetivos = null;
      loading.dismiss();
      return;
    } else{
      this.objetivos = respuesta.response[0];
      loading.dismiss();
      return;
    }
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async guardarStoredFoward(){
    if(this.numeroEvaluacionesGuardadasLocal == null || this.numeroEvaluacionesGuardadasLocal == 0){
      await this.utilitiesService.alert("", "Por el momento no hay evaluaciones guardadas en el teléfono.");
      return;
    }

    // vamos a dar de alta los registros guardados en memoria
   let respuesta = await this.utilitiesService.presentAlertConfirm("A continuación se dar(án) " + this.numeroEvaluacionesGuardadasLocal + 
   " evaluacion(es) de alta, ¿Deseas continuar?");
  
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
      await this.utilitiesService.alert("", "Se dieron de alta todas las evaluaciones guardadas en local.");
    } else {
      await this.utilitiesService.alert("", "Al menos una evaluación no se dio de alta.");
    }
    // this.refrescarPantalla();
  }

  subscribeToTopic() {
    this.fcm.subscribeToTopic('enappd');
  }
  getToken() {
    this.fcm.getToken().then(token => {
      // Register your new token in your back-end if you want
      // backend.registerToken(token);
    });
  }
  unsubscribeFromTopic() {
    this.fcm.unsubscribeFromTopic('enappd');
  }
  
}

