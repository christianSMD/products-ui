import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userForm !: FormGroup;
  hide = true;
  constructor(
    private formBuilder : FormBuilder, 
    private router: Router,
    private api: ApiService,
    public nav: NavbarService,
    public sideNav: SidenavService,
    public treeNav: TreeService
  ) { }

  ngOnInit(): void {
    this.nav.hide();
    this.sideNav.hide();
    this.treeNav.hide();
    
    this.userForm = this.formBuilder.group({
      email : ['john@example.com', Validators.required],
      password : ['', Validators.required],
    })
  }

  login () {
    console.log("Form valid?: ", this.userForm.value);
    if(this.userForm.valid) {
      this.api.POST('login', this.userForm.value).subscribe({
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
