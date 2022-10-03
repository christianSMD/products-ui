import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  userEmail: string = "";
  userName: string = "";
  showFiller = false;
  listBrands: string[] = [];
  searchForm !: FormGroup;
  brandsLoader = true;
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
    this.getAllTypes();
    this.searchForm = this.formBuilder.group({
      query : ['']
    })
    this.userEmail = <string>this.info.getUserEmail();
    this.userName = <string>this.info.getUserName();
    this.authRole = this.info.role(58);
    this.rolesRole = this.info.role(70);
    this.settingsRole = this.info.role(71);

    if(!this.loggedIn) {
      if (localStorage.getItem('logged_in_user_email')) {
        this.loggedIn = true;
      }
    }

  }

  getAllTypes() {
    this.api.GET('types').subscribe({
      next:(res)=>{
        console.log(res);
        this.brandsLoader = false;
        for (let index = 0; index < res.length; index++) {
          if (res[index].grouping == 'Brand') {
            this.listBrands.push(res[index].name);
          }
        }
      }, error:(res)=>{
        this.brandsLoader = false;
      }
    });
  }

  // searchBrand(e: any) {
  //   console.log('original', this.listBrands);
  //   console.log('searching...', this.searchForm.value);
  //   this.listBrands =  this.listBrands.filter(item => item == this.searchForm.value);
  //   console.log('results', this.listBrands);
  // }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
  }

  openProfile(): void {
    const link = '/profile/' + this.info.getUserId();
    this.router.navigate([link]);
  }

  logout() {
    this.info.isUserLoggedIn.next(false);
    localStorage.clear();
    this.api.POST(`logout`, this.userEmail).subscribe({
      next:(res)=> {
        this.router.navigate(['/login']);
        
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

}
