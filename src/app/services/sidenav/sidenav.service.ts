import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

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
  }

  show() { 
    this.visible = true; 
  }

  toggle() { 
    this.sidenav.toggle();
  }

  toggleBtn(b: String) {
    if(b == 'arrow_right_alt') {
      return 'close';
    } else {
      return 'arrow_right_alt';
    }
  }

  doSomethingElseUseful() { }
}
