import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

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
  regionsCount: number = 0;
  progressMode: ProgressSpinnerMode = 'determinate';
  brands: any[] = [];
  productsByBrand: any[] = [];
  uknownBrandProducts: number = 0;
  displayedColumns: string[] = ['verified', 'thumbnail', 'sku', 'name', 'brand', 'description',  'categories', 'updated', 'view'];
  dataSource: MatTableDataSource<Product>;
  verifiedProducts: any[] = [];
  owners: any[] = [];
  productsViewInfo: string;
  productCategories: Category[] = [];
  productCategoryTree: any[] = [];
  loaderInfo: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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
    private products: ProductsService,
    public _liveAnnouncer: LiveAnnouncer,
  ) { }

  ngOnInit(): void {
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllTypes();
    this.getAllProducts();
  }

  getAllProducts() {
    this.productsLoader = true;
    this.loaderInfo = "Loading products...";
    this.api.GET('products').subscribe({
      next:(res)=>{
        this.productsList = res;
        this.verifiedProducts = this.productsList.filter((p: any) => p.verified == 1);
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productsLoader = false;
        this.loaderInfo = "Loading products complete...";
        this.blockUI.stop();
        this.veriftStats(this.productsList);
        //this.getAllCategories();
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  getAllCategories() {
    this.productsLoader = true;
    this.loaderInfo = "Loading categories";
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.categoriesList = res;
        this.productsLoader = false;
        this.loaderInfo = "Loading categories complete...";
      }, error:(res)=>{
        this.productsLoader = false;
        this.loaderInfo = "Failed to load categories";
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  
  getAllTypes() {
    this.typesList = this.lookup.getTypes();
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

  getBrandName(id: string) {
    try {
      let i = 0;
      i = parseInt(id) - 1;
      if(this.typesList[i] == undefined || isNaN(i) || i == null) {
        return '';
      }
      return this.typesList[i].name;
    } catch (error) {
      this.info.errorHandler(error);
      return "";
    }
    
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  table(results: Product[]) {
    this.dataSource = new MatTableDataSource(results);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  veriftStats(products: Product[]) {

    let co = products[0].product_manager;
    let owners = [];
  }

  productsToDisplay(s: string) {
    let products_to_display: Product[] = [];
    if (s == 'active') {
      products_to_display= this.productsList.filter((p: any) => p.is_active == 1);
      this.productsViewInfo = "Showing: Active Products...";
    }
    if (s == 'verified') {
      products_to_display = this.productsList.filter((p: any) => p.verified == 1);
      this.productsViewInfo = "Showing: Verified Products...";
    }
    if (s == 'unverified') {
      products_to_display = this.productsList.filter((p: any) => p.verified == 0);
      this.productsViewInfo = "Showing: Unverified Products...";
    }
    
    this.dataSource = new MatTableDataSource(products_to_display);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * @todo Get categories asigned to product.
   * @todo Loop each category for attributes.
   */
  displayProductCategories(id: string) {
    this.productsLoader = true;
    this.loaderInfo = "Loading product categories...";
    this.api.GET(`product-categories/search/${id}`).subscribe({
      next:(res)=>{
        this.productCategories = res;
        console.log(res);
        this.productsLoader = false;
        this.loaderInfo = "Loading complete";   
      }, error:(e)=>{
        this.productsLoader = false;
        this.loaderInfo = "Something went wrong when trying to load some product categories.";
      }
    });
    
  }

}
