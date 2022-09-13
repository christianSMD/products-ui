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
    console.log("Reset Password");
    this.nav.hide();
    this.sideNav.hide();
    this.treeNav.hide();
    this.userForm = this.formBuilder.group({
      email : ['john@example.com', Validators.required],
    })
  }

  submitEmail(): void {
    if(this.userForm.valid) {
      this.api.POST('reset-password', this.userForm.value).subscribe({
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

  backToLogin() {
    this.router.navigate(['/login']);
  }

}
