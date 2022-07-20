import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
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

  constructor(
    public sideNav: SidenavService, 
    private router: Router,
    private formBuilder : FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.getAllTypes();
    this.searchForm = this.formBuilder.group({
      query : ['']
    })
  }

  getAllTypes() {
    this.api.GET('types').subscribe({
      next:(res)=>{
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
    this.router.navigate(['products/brand', brand.toLowerCase()]);
  }

}
