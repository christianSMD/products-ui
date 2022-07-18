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

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: ['./products-home.component.scss']
})
export class ProductsHomeComponent extends CdkTableExporterModule implements OnInit{

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  typesList: Type[] = [];
  displayedColumns: string[] = ['id', 'sku', 'name', 'brand', 'description', 'view'];
  dataSource: MatTableDataSource<Product>;
  productsLoader = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    super();
  }

  ngOnInit(): void {
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllProducts();
    this.getAllTypes();
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
    this._snackBar.open(message, action);
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

}
