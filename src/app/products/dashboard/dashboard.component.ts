import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Product } from 'src/app/interfaces/product';
import { Category } from 'src/app/interfaces/category';
import { Type } from 'src/app/interfaces/type';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  productsList: Product[] = [];
  typesList: Type[] = [];
  categoriesList: Category[] = [];
  productsLoader = false;
  loggedIn = false;
  activeProducts: number = 0;
  eolProducts: number = 0;
  developmentProducts: number = 0;
  allProducts: number = 0;
  categoriesCount: number = 0;
  brandsCount: number = 0;
  regionsCount: number = 0;
  progressMode: ProgressSpinnerMode = 'determinate';
  brands: any[] = [];
  productsByBrand: any[] = [];
  uknownBrandProducts: number = 0;

  @BlockUI() blockUI: NgBlockUI;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    private info: InfoService,
    private router: Router,
    private lookup: LookupService,
    private products: ProductsService
  ) { }

  ngOnInit(): void {
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllProducts();
    this.getAllTypes();
    this.getAllCategories();
    this.productsBybrand();
  }

  getAllProducts() {
    this.productsList = this.products.getProducts();
    this.allProducts = this.productsList.length;
    const active = this.productsList.filter(x => x.is_active == 1);
    this.activeProducts = active.length;
    const development = this.productsList.filter(x => x.is_in_development == 1);
    this.developmentProducts = development.length;
    const eol = this.productsList.filter(x => x.is_eol == 1);
    this.eolProducts = eol.length;
  }
  
  getAllTypes() {
    this.typesList = this.lookup.getTypes();
  }

  getAllCategories(): void {
    this.categoriesList = this.products.getCategories();
  }

  productsBybrand () {
    this.api.GET('dashboard').subscribe({
      next:(res)=>{
        console.log('by brands ', res);
        this.productsByBrand = res;
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

}
