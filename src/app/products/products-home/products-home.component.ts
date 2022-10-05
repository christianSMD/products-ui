import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from '../../services/navbar/navbar.service';
import { SidenavService } from '../../services/sidenav/sidenav.service';
import { TreeService } from '../../services/tree/tree.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/interfaces/product';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Type } from 'src/app/interfaces/type';
import { Category } from 'src/app/interfaces/category';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkTableExporterModule } from 'cdk-table-exporter';
import { InfoService } from 'src/app/services/info/info.service';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: ['./products-home.component.scss']
})
export class ProductsHomeComponent extends CdkTableExporterModule implements OnInit {

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  typesList: Type[] = [];
  packagingList: any[] = [];
  displayedColumns: string[] = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  //displayedColumns: string[] = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  loggedIn = false;
  addProductRole = false;
  addCategoryRole = false;
  viewAllProductsRole = false;
  storageUrl: string;
  displayDates: boolean = false;

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
    private _liveAnnouncer: LiveAnnouncer,
    private info: InfoService,
    private router: Router
  ) {
    super();
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }

  ngOnInit(): void {

    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
    
    this.info.isRefreshed();
    console.log(Date.now());
    if(localStorage.getItem('blockui') == 'yes') {
      this.blockUI.start(`${this.info.greeting()} ${this.info.getUserName()}!`);
    } else {
      if(this.loggedIn) {
        this.viewAllProductsRole = this.info.role(68);
        this.topNav.show();
        this.sideNav.show();
        this.treeNav.hide();
        this.getAllProducts();
        this.getAllTypes();
        this.addProductRole = this.info.role(61);
        this.addCategoryRole = this.info.role(60);
        this.storageUrl = this.api.getStorageUrl();
      } else {
        if (localStorage.getItem('logged_in_user_email')) {
          this.viewAllProductsRole = this.info.role(68);
          this.loggedIn = true;
          this.topNav.show();
          this.sideNav.show();
          this.treeNav.hide();
          this.getAllProducts();
          this.getAllTypes();
          this.addProductRole = this.info.role(61);
          this.addCategoryRole = this.info.role(60);
          
        } else {
          this.router.navigate(['login']);
        }
      }
      console.log('On inint Role: ' + this.viewAllProductsRole);
    }

    this.info.auth();
    console.log('isUserLoggedIn:', this.loggedIn);
  }

  ngAfterContentInit(): void {
    console.log('products-home ngAfterContentInit()');
    if(this.loggedIn) {
      this.addProductRole = this.info.role(61);
      this.addCategoryRole = this.info.role(60);
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    console.log('products-home toggleDestroy()');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllProducts() {
    let url: string = 'products-verified';
    if (this.viewAllProductsRole) {
      url = 'products';
    }
    this.blockUI.start('Loading products..');
    this.productsLoader = true;
    this.api.GET(url).subscribe({
      next:(res)=>{
        console.log('Products: ', res);
        this.productsLoader = false;
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.blockUI.stop();
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getAllTypes() {
    this.api.GET('types').subscribe({
      next:(res)=>{
        console.log(res);
        this.typesList = res;
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getBrandName(id: string) {
    let i = 0;
    i = parseInt(id) - 1;
    if(this.typesList[i] == undefined) {
      return '';
    }
    return this.typesList[i].name;
  }

  permission(role: number) {
    console.log('Role check');
    if(this.info.role(role)) {
      return true;
    }
    return false;
  }

  iconClick(s: string): void {
    this.openSnackBar(s, '😉');
  }

  filePath(p: string) {
    return p.substring(7);
  }

  showDates(e: any) {
    if (this.displayDates) {
      this.displayedColumns = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
    } else {
      this.resetTableView();
    }
  }

  resetTableView () {
    this.displayedColumns = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
  }

}
