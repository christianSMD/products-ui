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

  showFiller = false;
  listBrands: string[] = [];
  searchForm !: FormGroup;
  brandsLoader = false;
  loggedIn: boolean;

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
    this.permission(60);
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

  permission(type_id: number) {
    console.log('permissions for:', type_id);
    console.log('permission:', this.info.role(type_id));
  }


  selectBrand(brand: String): void {
    this.router.navigate(['products/brand', brand.toLowerCase()]);
  }

}
