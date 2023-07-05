import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  loggedIn: boolean = false;

  constructor(
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    public info: InfoService, 
    private router: Router
    ) {
      this.info.isUserLoggedIn.subscribe(value => {
        this.loggedIn = value;
      });
    }

  ngOnInit(): void {
    //this.router.navigate(['/products']);
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
  }

}
