import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;

  title: string;
  userEmail: string;
  userName: string;
  sideBtnIcn = 'arrow_right_alt';
  showIcons = false;

  constructor(
    public nav: NavbarService, 
    private info: InfoService,
    private router: Router,
    private api: ApiService,
    private _snackBar: MatSnackBar,
    private sideNav: SidenavService
  ) { }

  ngOnInit(): void {
    this.title = this.info.getTitle();
    this.userEmail = <string>this.info.getUserEmail();
    this.userName = <string>this.info.getUserName();
  }

  logout() {
    this.openSnackBar('Logging out...', '');
    this.info.isUserLoggedIn.next(false);
    localStorage.clear();
    this.api.POST(`logout`, this.userEmail).subscribe({
      next:(res)=> {
        this.openSnackBar('Logged out', 'Okay');
        this.router.navigate(['/login']);
        
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  returnEmail() {
    this.userEmail =<string>this.info.getUserEmail();
  }
  

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  openProfile(): void {
    const link = '/profile/' + this.info.getUserId();
    this.router.navigate([link]);
  }


}
