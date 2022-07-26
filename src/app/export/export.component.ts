import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
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
import { NavbarService } from '../services/navbar/navbar.service';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { TreeService } from '../services/tree/tree.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent extends CdkTableExporterModule implements OnInit{

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  typesList: Type[] = [];
  images: any[] = [];
  
  //displayedColumns: string[] = ['type', 'sku', 'name', 'published', 'featured', 'visibility', 'catalog', 'shortDescription', 'description',	'tax',	'inStock',	'weight','height', 'width', 'height', 'price', 'reviews',	'categories',	'tags',	'images',	'parent', 'Attribute 1 name', 'attribute_1'];
  //displayedColumns: string[] = ['type', 'sku', 'name', 'published', 'featured', 'visibility', 'catalog', 'shortDescription', 'description',	'weight','height', 'width', 'height', 'categories',	'images'];
  displayedColumns: string[] = ['id', 'sku', 'name', 'brand', 'description', 'images','view'];

  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  loggedIn = false;

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
    private info: InfoService
  ) {
    super();
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }

  ngOnInit(): void {
    if(this.loggedIn) {
      this.topNav.show();
      this.sideNav.show();
      this.treeNav.hide();
      this.getAllProducts();
      this.getAllTypes();
      this.getImages();
    }
    this.info.auth();
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

  getImages() {
    this.productsLoader = true;
    this.api.GET('images').subscribe({
      next:(res)=>{
        console.log(res);
        this.images = res;
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  productImages(id: number) {
    console.log('PIs', this.images.filter(x => x.product_id == id));
    return this.images.filter(x => x.product_id == id);
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
