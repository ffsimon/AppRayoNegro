import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebService } from './web.service';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class WebRayoService  extends WebService {
  //http://rayonegro-001-site1.dtempurl.com/
  public serviceGateway: string = ("https://servicio.rayonegro-consolacentral.com.mx/");
  public servicioGoogle: string = "https://maps.googleapis.com/"
  public pathOperaciones: string = "operaciones/";

  //-------------------------------------------------------------------------------------------------------------------
  constructor(public http: HttpClient) {
    super(http);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Hace una petición post al servidor pms
    public postAsync(uri: string, objeto: any): Promise<any> {
      let headers = null;
      let token_jwt: string = localStorage.getItem("token_jwt");
      if (token_jwt != null)
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true',
              'Authorization': 'Bearer ' + token_jwt
          });
      return super.postAsync(this.serviceGateway + uri, objeto, headers);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public getCoordenadas(uri: string): Promise<any> {
    let headers = null;
        headers = new HttpHeaders({
        });
        return super.getAsync(uri, headers);
    }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición get al servidor pms
  public getAsync(uri: string): Promise<any> {
      let headers = null;
      let token_jwt: string = localStorage.getItem("token_jwt");
      if (token_jwt != null)
          headers = new HttpHeaders({
              'responseType': 'text',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true',
              'Authorization': 'Bearer ' + token_jwt
          });
      return super.getAsync(this.serviceGateway + uri, headers);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición put al servidor pms
  public putAsync(uri: string, objeto: any): Promise<any> {
      let headers = null;
      let token_jwt: string = localStorage.getItem("token_jwt");
      if (token_jwt != null)
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true',
              'Authorization': 'Bearer ' + token_jwt
          });
      return super.putAsync(this.serviceGateway + uri, objeto, headers);
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición delete al servidor pms
  public deleteAsync(uri: string, objeto: any): Promise<any> {
      let headers = null;
      let token_jwt: string = localStorage.getItem("token_jwt");
      if (token_jwt != null)
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true',
              'Authorization': 'Bearer ' + token_jwt
          });
      return super.deleteAsync(this.serviceGateway + uri, objeto, headers);
  }
}
