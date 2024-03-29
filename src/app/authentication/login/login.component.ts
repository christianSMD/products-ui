import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { ApiService } from '../../services/api/api.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userForm !: UntypedFormGroup;
  hide = true;
  userRoles:any;

  constructor(
    private formBuilder : UntypedFormBuilder, 
    private router: Router,
    private api: ApiService,
    public nav: NavbarService,
    public sideNav: SidenavService,
    public treeNav: TreeService,
    public info: InfoService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('user_token', 'dummytoken');
    this.nav.hide();
    this.sideNav.hide();
    this.treeNav.hide();
    this.userForm = this.formBuilder.group({
      email : ['', Validators.required],
      password : ['', Validators.required],
    })
  }

  login(): void {
    this.openSnackBar('Logging in...', '');
    setTimeout(() => {
      this.openSnackBar('This is taking longer, please wait...', '');
    }, 6000);

    if(this.userForm.valid) {
      this.api.POST('login', this.userForm.value).subscribe({
        next:(res)=>{
          console.log('res',res);
          if (res.user.is_active == 1) {
            this.info.isUserLoggedIn.next(true);
            localStorage.setItem('logged_in_user_email', res.user.email);
            localStorage.setItem('logged_in_user_name', res.user.name);
            localStorage.setItem('logged_in_user_id', res.user.id);
            localStorage.setItem('user_token', res.token);
            localStorage.setItem('refreshed', 'no');
            localStorage.setItem('blockui', 'yes');
            this.info.role(0); // Trigger local storage for permissions
            this.openSnackBar('✔ Preparing...', '');
            this.router.navigate(['/']);
          } else {
            this.openSnackBar('⛔ Your account has not been approved yet, or has been deactivated. Please contact your administrator.' , 'Okay');
          }
          
        },
        error:(res)=>{
          console.log(res);
          this.openSnackBar('⚠' + res.error.message, 'Try Again');
        }
      });
    } else {
      console.log("Form input invalid.");
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  forgotPassword():void {
    this.router.navigate(['/reset-password']);
  }

  particles () {
    
  }

}
