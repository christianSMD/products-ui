import { Component, isDevMode } from '@angular/core';
import { InfoService } from './services/info/info.service';
import { SidenavService } from './services/sidenav/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor (private sideNav: SidenavService, private info: InfoService) {}

  title = 'products-system';
  sideBtnIcn = 'menu';
  minimized: boolean = true;
  devMode: boolean;
  width: string =  "109px";

  ngOnInit(): void {
    this.devMode = isDevMode();
    if(!this.info.getUserEmail()){
      this.info.isUserLoggedIn.next(false);
      let sidenav = document.getElementById("sidenav");
    } else {
      this.info.isUserLoggedIn.next(true);
    }

    this.miniSideNavWidth();
  }

  test() {
    this.minimized = !this.minimized;
    this.miniSideNavWidth();
  }

  miniSideNavWidth () {
    var x = window.matchMedia("(max-width: 600px)")
    if(x.matches) {
      this.width = "1px";
    } else {
      this.width = "109px";
    }
  }
}
