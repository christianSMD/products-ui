import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  public title = "SMD Technologies";

  constructor() { }

  public getTitle () {
    return this.title;
  }

  public getUserName () {
    return localStorage.getItem('psName');
  }

  public getUserEmail () {
    return localStorage.getItem('psEmail');
  }

  public getUserAccessToken () {
    return localStorage.getItem('psToken');
  }
}
