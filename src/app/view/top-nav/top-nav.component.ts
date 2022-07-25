import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})

export class TopNavComponent implements OnInit {

  @ViewChild('sidenav') public sidenav: MatSidenav;

  title: string;
  userEmail: string;

  constructor(
    public nav: NavbarService, 
    private info: InfoService,
    private router: Router,
    private api: ApiService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.title = this.info.getTitle();
    this.userEmail = <string>this.info.getUserEmail();
  }

  logout() {
    this.openSnackBar('Logging out...', '');
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


}
