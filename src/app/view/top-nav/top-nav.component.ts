import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;

  title: string;
  userName: string;

  constructor(
    public nav: NavbarService, 
    private info: InfoService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.title = this.info.getTitle();
    this.userName = <string>this.info.getUserName();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

}
