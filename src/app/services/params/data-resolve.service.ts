import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class DataResolveService {

  constructor(private dataService: DataService) { }

  public resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get("id");
    return this.dataService.getData(id);
  }
}
