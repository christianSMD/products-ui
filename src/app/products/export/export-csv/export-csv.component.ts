import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from '../../../services/navbar/navbar.service';
import { SidenavService } from '../../../services/sidenav/sidenav.service';
import { TreeService } from '../../../services/tree/tree.service';
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
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.scss']
})
export class ExportCSVComponent extends CdkTableExporterModule implements OnInit{

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  productCategoryList: any[] = [];
  typesList: Type[] = [];
  images: any[] = [];
  query: string = "";

  displayedColumns: string[] = [
    'type',
    'sku', 
    'name', 
    'published',
    'isFeatured',
    'visibility',
    'shortDescription', 
    'description',
    'taxStatus',
    'inStock',
    'weight',
    'length',
    'width',
    'height',
    'categories',	
    'images'
  ];

  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  loggedIn = false;
  storageUrl: string;

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
    private lookup: LookupService,
    private products: ProductsService
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
      this.storageUrl = this.api.getStorageUrl();
    }
    this.info.auth();
  }

  getProducts() {
    console.log("getting: " + this.query);
    this.info.setLoadingInfo('Loading products...', 'info');
    this.productsLoader = true;
    this.api.GET(`wordpress-export/${this.query}`).subscribe({
        next:(res)=>{
          this.productsList = res;
          this.dataSource = new MatTableDataSource(this.productsList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.productsLoader = false;
          this.info.setLoadingInfo('Products loaded', 'success');
        }, error:(res)=>{
          this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'success');
          this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        }
      });
  }

  filePath(p: string) {
   
    // var str = "https://products.smdtechnologies.com/" + p;
    // var modifiedStr = str.split(",").join(",https://products.smdtechnologies.com/");
    // var modifiedUrl = modifiedStr.replaceAll("/public/files", "/public/storage/files");
    // return modifiedUrl;
    var modifiedStr = p.split(",").join(",");
    return modifiedStr;
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
    this.typesList = this.lookup.getTypes();
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
