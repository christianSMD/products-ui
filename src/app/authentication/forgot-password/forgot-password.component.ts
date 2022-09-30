import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  userForm !: FormGroup;
  submitted: boolean = false;
  resettingPassword: boolean = false;
  submitNewPasswordBtn: boolean= false;
  newPassword: string;
  verifyNewPassword: string;
  token: any;
  userId: any;
  
  constructor(
    private formBuilder : FormBuilder, 
    private router: Router,
    private api: ApiService,
    public nav: NavbarService,
    public sideNav: SidenavService,
    public treeNav: TreeService,
    public info: InfoService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    let url_string = window.location.href; 
    let url = new URL(url_string);
    let userId = url.searchParams.get("id");
    let userToken = url.searchParams.get("token");
    this.userId = userId;
    this.token = userToken;

    if (userId) {
      this.resettingPassword = true;
    }

    this.nav.hide();
    this.sideNav.hide();
    this.treeNav.hide();
    this.userForm = this.formBuilder.group({
      email : ['', Validators.required],
    })
  }

  submitEmail(): void {
    if(this.userForm.valid) {
      this.api.POST('reset_password_without_token', this.userForm.value).subscribe({
        next:(res)=>{
          console.log('res',res);
          if (res.user.is_active == 1) {
            this.router.navigate(['/']);
          } else {
            //this.openSnackBar('⛔ Your account has not been approved yet, or has been deactivated. Please contact your administrator.' , 'Okay');
          }
        },
        error:(res)=>{
          console.log(res);
        }
      });
    } else {
      console.log("Form input invalid.");
    }
    this.submitted = true;
  }

  verify() {
    if (this.newPassword == this.verifyNewPassword) {
      this.submitNewPasswordBtn = true;
    } else {
      this.submitNewPasswordBtn = false;
    }
  }

  submitPassword(): void {
    this.api.POST(`reset-password-verify/${this.userId}/${this.token}`, {
      password: this.newPassword
    }).subscribe({
      next:(res)=>{
        console.log('res',res);
        if (res > 0) {
          this.router.navigate(['/']);
        } else {
          this.openSnackBar('⛔ Your account has not been approved yet, or has been deactivated. Please contact your administrator.' , 'Okay');
        }
      },
      error:(res)=>{
        console.log(res);
      }
    });
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

}
