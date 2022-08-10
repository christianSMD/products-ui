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

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: ['./products-home.component.scss']
})
export class ProductsHomeComponent extends CdkTableExporterModule implements OnInit{

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  typesList: Type[] = [];
  packagingList: any[] = [];
  displayedColumns: string[] = ['id', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  loggedIn = false;
  addProductRole = false;
  addCategoryRole = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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

    this.info.isRefreshed();

    if(this.loggedIn) {
      this.topNav.show();
      this.sideNav.show();
      this.treeNav.hide();
      this.getAllProducts();
      this.getAllTypes();
      this.addProductRole = this.info.role(61);
      this.addCategoryRole = this.info.role(60);
    } else {
      if (localStorage.getItem('logged_in_user_email')) {
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
    this.productsLoader = true;
    this.api.GET('products').subscribe({
      next:(res)=>{
        console.log(res);
        this.productsLoader = false;
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

}
