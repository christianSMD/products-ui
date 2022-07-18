import { Component } from '@angular/core';
import { SidenavService } from './services/sidenav/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor (private sideNav: SidenavService) {}

  title = 'products-system';
  sideBtnIcn = 'arrow_right_alt';

  sideberBtn() {
    this.sideBtnIcn = this.sideNav.toggleBtn(this.sideBtnIcn);
  }
}
