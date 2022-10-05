import { Component } from '@angular/core';
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

  ngOnInit(): void {
    console.log('Current user status: ', this.info.isUserLoggedIn);
    if(!this.info.getUserEmail()){
      this.info.isUserLoggedIn.next(false);
      let sidenav = document.getElementById("sidenav");

    } else {
      this.info.isUserLoggedIn.next(true);
    }
  }

  test() {
    this.minimized = !this.minimized;
    console.log(this.minimized); 
  }
}
