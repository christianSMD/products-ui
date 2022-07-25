import { Component, OnInit } from '@angular/core';
import { InfoService } from '../services/info/info.service';
import { NavbarService } from '../services/navbar/navbar.service';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { TreeService } from '../services/tree/tree.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    public info: InfoService
    ) { }

  ngOnInit(): void {
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
  }

}
