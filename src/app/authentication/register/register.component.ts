import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  userForm !: UntypedFormGroup;
  hide = true;
  constructor(
    private formBuilder : UntypedFormBuilder,
    private router: Router,
    private api : ApiService,
    public nav: NavbarService,
    public sideNav: SidenavService
  ) { }

  ngOnInit(): void {
    this.nav.hide();
    this.sideNav.hide();
    this.userForm = this.formBuilder.group({
      name : ['', Validators.required],
      surname : ['', Validators.required],
      email : ['', Validators.required],
      password : ['', Validators.required],
      confirmPassword : ['', Validators.required]
    })
  }

  register () {
    if(this.userForm.valid) {
      this.api.POST('register', this.userForm.value).subscribe({
        next:(res)=>{
          console.log(res);
          localStorage.setItem('psToken', res.token);
          localStorage.setItem('psName', res.user.name);
          localStorage.setItem('psEmail', res.user.email);
          this.router.navigate(['/login']);
        },
        error:(res)=>{
          alert(res.message);
        }
      });
    } else {
      alert("Form input invalid.");
    }
  }
}
