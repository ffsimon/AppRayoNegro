import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { resolve } from 'url';
import { MOSTRAR_RESPUESTA_SERVICIOS } from '../constants';

@Injectable()

export class WebService {

   //-------------------------------------------------------------------------------------------------------------------
   constructor(public http: HttpClient) {
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición post genérica.
  public postAsync(url: string, objeto: any, headers?: HttpHeaders): Promise<any> {
      if (headers == null) {
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
          });
      }

      let options = { headers: headers };
      let json = JSON.stringify(objeto);

      return new Promise(resolve => {
          if (MOSTRAR_RESPUESTA_SERVICIOS) {
              console.log("%cINICIO - - - \nrespuesta servicio POST: " + url, "background-color: #5296C2;");
              console.log("%cobjeto enviado: ", "background-color: #5296C2");
              console.log(objeto);
          }
          let subs = this.http.post(url, json, options).subscribe(data => {
              subs.unsubscribe();
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.log("%crespuesta recibida: ", "background-color: #5296C2");
                  console.log(data);
                  console.log("%cFIN - - - ", "background-color: #5296C2");
              }
              return resolve(data);
          }, err => {
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.error(err);
                  console.log("%cFIN - - - ", "background-color: red;");
              }
              subs.unsubscribe();
              return resolve(<any>{
                  currentException: err.message.toString(),
                  mensaje: null,
                  respuesta: null,
                  status: false,
                  success: false
              });
          });
      });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición get genérica.
  public getAsync(url: string, headers?: HttpHeaders): Promise<any> {
      if (headers == null) {
          headers = new HttpHeaders({
              'responseType': 'text',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
          });
      }
      let options = { headers: headers };

      return new Promise(resolve => {
          if (MOSTRAR_RESPUESTA_SERVICIOS) {
              console.log("%cINICIO - - - \nrespuesta servicio GET: " + url, "background-color: #BADBB9");
          }
          let subs = this.http.get(url, options).subscribe(data => {
              subs.unsubscribe();
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.log(data);
                  console.log("%cFIN - - - ", "background-color: #BADBB9");
              }
              return resolve(data);
          }, err => {
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.error(err);
                  console.log("%cFIN - - - ", "background-color: red;");
              }
              subs.unsubscribe();
              return resolve(<any>{
                  success: false,
                  // message: err.message.toString(),
                  message: err.message,
                  content: null
              });
          });
      });
  }

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición get genérica.
  public getAsyncDireccion(url: string, headers): Promise<any> {
    
    if (headers == null) {
        headers = new HttpHeaders({
        });
    }

    let options = { headers: headers };
    return new Promise(resolve => {
        let subs = this.http.get(url, options).subscribe(data => {
            subs.unsubscribe();
            return resolve(data);
        }, err => {
            subs.unsubscribe();
            return resolve(<any>{
                success: false,
                // message: err.message.toString(),
                message: err.message,
                content: null
            });
        });
    });
}

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición put genérica.
  public putAsync(url: string, objeto: any, headers?: HttpHeaders): Promise<any> {
      if (headers == null) {
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
          });
      }
      let options = { headers: headers };
      let json = JSON.stringify(objeto);

      return new Promise(resolve => {
          if (MOSTRAR_RESPUESTA_SERVICIOS) {
              console.log("%cINICIO - - - \nrespuesta servicio PUT: " + url, "background-color: #A985D1;");
              console.log("%cobjeto enviado: ", "background-color: #A985D1");
              console.log(objeto);
          }
          let subs = this.http.put(url, json, options).subscribe(data => {
              subs.unsubscribe();
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.log("%crespuesta recibida: ", "background-color: #A985D1");
                  console.log(data);
                  console.log("%cFIN - - - ", "background-color: #A985D1");
              }
              return resolve(data);
          }, err => {
              if (MOSTRAR_RESPUESTA_SERVICIOS) {
                  console.error(err);
                  console.log("%cFIN - - - ", "background-color: red;");
              }
              subs.unsubscribe();
              return resolve(<any>{
                  currentException: err.message.toString(),
                  mensaje: null,
                  respuesta: null,
                  status: false,
                  success: false
              });
          });
      });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Hace una petición delete genérica.
  public deleteAsync(url: string, objeto: any, headers?: HttpHeaders): Promise<any> {
      if (headers == null) {
          headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'responseType': 'json',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
          });
      }
      let json = JSON.stringify(objeto);
      let options = { headers: headers, body: json };
      return new Promise(resolve => {
          let subs = this.http.request("delete", url, options).subscribe(data => {
              subs.unsubscribe();
              return resolve(data);
          }, err => {
              // subs.unsubscribe();
              return resolve(<any>{
                  currentException: err.message.toString(),
                  mensaje: null,
                  respuesta: null,
                  status: false,
                  success: false
              });
          });
      });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public fromObjectToGETString(obj: any) {
      let link = "?";
      Object.keys(obj).forEach(key => link = link + key + "=" + obj[key] + "&")
      return link.slice(0, -1);
  }
}
