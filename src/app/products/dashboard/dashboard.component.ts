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
  displayedColumns: string[] = ['verified', 'thumbnail', 'sku', 'name', 'brand', 'description', 'updated', 'view'];
  dataSource: MatTableDataSource<Product>;
  verifiedProducts: any[] = [];
  owners: any[] = [];

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
    this.getAllProducts();
    this.getAllTypes();
  }

  getAllProducts() {
    this.productsLoader = true;
    this.api.GET('products').subscribe({
      next:(res)=>{
        this.productsList = res;
        this.productsLoader = false;
        this.verifiedProducts = this.productsList.filter((p: any) => p.verified == 1);
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productsLoader = false;
        this.blockUI.stop();
        this.veriftStats(this.productsList);
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
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

    owners.push(co);
    for (let x = 0; x < products.length; x++) {
      let f = owners.find((o: any) => o.product_manager == co);
      console.log(owners);
    }
  }

}
