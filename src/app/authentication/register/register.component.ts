import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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

  userForm !: FormGroup;
  hide = true;
  constructor(
    private formBuilder : FormBuilder,
    private router: Router,
    private api : ApiService,
    public nav: NavbarService,
    public sideNav: SidenavService
  ) { }

  ngOnInit(): void {
    this.nav.hide();
    this.sideNav.hide();
    this.userForm = this.formBuilder.group({
      name : ['John', Validators.required],
      surname : ['Doe', Validators.required],
      email : ['john@example.com', Validators.required],
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
          this.router.navigate(['/']);
        },
        error:(res)=>{
          alert(res.message);
        }
      });
    } else {
      console.log("Form input invalid.");
    }
  }
}
