import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { elementAt } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private sidenav: MatSidenav;

  visible: boolean;

  constructor() { this.visible = false; }

  public setSidenav(sidenav: MatSidenav) {
    this.sidenav = sidenav;
  }


  hide() { 
    this.visible = false;
    let sidenav = document.getElementById("sidenav");
    sidenav!.style.display = "none";
  }

  show() { 
    this.visible = true; 
  }

  doSomethingElseUseful() { }
}
