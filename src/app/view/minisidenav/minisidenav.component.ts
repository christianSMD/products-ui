import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';


@Component({
  selector: 'app-minisidenav',
  templateUrl: './minisidenav.component.html',
  styleUrls: ['./minisidenav.component.scss']
})
export class MinisidenavComponent implements OnInit {

  showFiller = false;
  searchForm !: FormGroup;
  brandsLoader = false;
  loggedIn: boolean;
  authRole: boolean = false;
  rolesRole: boolean = false;
  settingsRole: boolean = false;

  constructor(
    public sideNav: SidenavService, 
    private router: Router,
    private formBuilder : FormBuilder,
    private api: ApiService,
    private info: InfoService
  ) { 
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      query : ['']
    })
    this.authRole = this.info.role(58);
    this.rolesRole = this.info.role(70);
    this.settingsRole = this.info.role(71);

    if(!this.loggedIn) {
      if (localStorage.getItem('logged_in_user_email')) {
        this.loggedIn = true;
      }
    }

  }

}
