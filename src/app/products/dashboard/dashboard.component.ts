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
//import Chart from 'chart.js';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

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
    private router: Router
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
    this.blockUI.start('Loading products..');
    this.productsLoader = true;
    this.api.GET('products-all').subscribe({
      next:(res)=>{
        this.productsLoader = false;
        this.productsList = res;
        this.allProducts = res.length;
        const active = res.filter(x => x.is_active == 1);
        this.activeProducts = active.length;
        const development = res.filter(x => x.is_in_development == 1);
        this.developmentProducts = development.length;
        const eol = res.filter(x => x.is_eol == 1);
        this.eolProducts = eol.length;
        this.blockUI.stop();
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }
  
  getAllTypes() {
    this.api.GET('types').subscribe({
      next:(res)=>{
        console.log(res);
        const brands = res.filter(x => x.grouping == 'Brand');
        this.brandsCount = brands.length;
        this.brands = brands;
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getAllCategories(): void {
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.categoriesCount = res.length;
      }, error:(res)=>{
        alert(res);
      }
    });
  }

  productsBybrand () {
    this.api.GET('dashboard').subscribe({
      next:(res)=>{
        console.log(res);
        this.productsByBrand = res;
        this.uknownBrandProducts = this.allProducts - this.productsByBrand.length;
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

}
