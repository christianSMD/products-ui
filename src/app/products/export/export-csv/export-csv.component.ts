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

  displayedColumns: string[] = [
    'sku', 
    'name', 
    'shortDescription', 
    'description',	
    'categories',	
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
      this.getAllProducts();
      this.getAllTypes();
      this.getImages();
      this.getProductCategories();
      this.getAllCategories();
      this.storageUrl = this.api.getStorageUrl();
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
    this.productsList = this.products.getProducts();
    this.dataSource = new MatTableDataSource(this.productsList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAllCategories(): void {
    this.categoriesList = this.products.getCategories();
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
    this.typesList = this.lookup.getTypes();
  }

  getProductCategories () {
    this.api.GET('product-categories').subscribe({
      next:(res)=>{
        console.log('Products categories', res);
        this.productCategoryList = res;
      }, error:(res)=>{
        console.log('Failed to communicate with the server: ' + res.message);
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

  setAttributesName(a: any, i: number) {
    const attr = JSON.parse(a)
    if(attr.attributes[i]) {
      return attr.attributes[i].attrName;
    }
    return '';
  }

  setAttributesValue(a: any, i: number) {
    const attr = JSON.parse(a)
    if(attr.attributes[i]) {
      return attr.attributes[i].attrValue;
    }
    return '';
  }

  setProductCategories(id: number) {;
    let catIds: any[] = [];
    let final: any[] = [];
    let str: string = '';

    for(let x = 0; x < this.productCategoryList.length; x++) {
      if (this.productCategoryList[x].product_id == id) {
        catIds.push(this.productCategoryList[x].category_id);
      }
    }

    for(let x = 0; x < catIds.length; x++) {
      try {
        let result = this.categoriesList.find(item => item.id == catIds[x]);
        final.push(result!.name);
      } catch (error) {
        return '';
      }
    }
    return final;
  }

}
