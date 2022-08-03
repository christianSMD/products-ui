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
import { NavbarService } from '../../services/navbar/navbar.service';
import { SidenavService } from '../../services/sidenav/sidenav.service';
import { TreeService } from '../../services/tree/tree.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent extends CdkTableExporterModule implements OnInit{

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  productCategoryList: any[] = [];
  typesList: Type[] = [];
  images: any[] = [];
  
  displayedColumns: string[] = [
    'type',
    'sku', 
    'name', 
    'published', 
    'featured', 
    'visibility', 
    'shortDescription', 
    'description',	
    'tax',	
    'inStock',
    'weight',
    'width', 
    'height', 
    'price', 
    'reviews',	
    'categories',	
    'tags',	
    'images',	
    'parent', 
    'attr1Name', 
    'attr1Value', 
    'attr2Name', 
    'attr2Value', 
    'attr3Name', 
    'attr3Value',
    'attr4Name', 
    'attr4Value',
    'attr5Name', 
    'attr5Value',
    'attr6Name', 
    'attr6Value',
    'attr7Name', 
    'attr7Value',
    'attr8Name', 
    'attr8Value',
    'attr9Name', 
    'attr9Value',
    'attr10Name', 
    'attr10Value',
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

  getAllCategories(): void {
    this.api.GET('categories').subscribe({
      next:(res)=>{
        console.log('Categories' , res);
        this.categoriesList = res;
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
        console.log('Failed to communicate with the server: ' + res.message);
      }
    });
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
