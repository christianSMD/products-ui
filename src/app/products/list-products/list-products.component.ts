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
import { ActivatedRoute, Params } from '@angular/router';
import { InfoService } from 'src/app/services/info/info.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent extends CdkTableExporterModule implements OnInit {

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  typesList: Type[] = [];
  packagingList: any[] = [];
  displayedColumns: string[] = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  loggedIn = false;
  addProductRole = false;
  addCategoryRole = false;
  viewAllProductsRole = false;
  storageUrl: string;
  displayDates: boolean = false;
  activeProducts: boolean = false;
  eolProducts: boolean = false;
  developmentProducts: boolean = false;
  allProducts: boolean = true;
  urlParam: string;
  brand: string;
  typeId: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    private api: ApiService, 
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _liveAnnouncer: LiveAnnouncer,
    public info: InfoService,
    private lookup: LookupService,
    private products: ProductsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllTypes();
    this.getAllCategories();
  }

  ngAfterContentInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.urlParam = params['brand'];
      this.brand = this.urlParam.toUpperCase();
      this.getAllTypes();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllTypes() {
    try {
      this.typesList = this.lookup.getTypes();
      let type: any;
      type = this.typesList.find((t: Type) => t.name.toLocaleLowerCase() == this.brand.toLocaleLowerCase());
    this.getAllProducts(type.id);
    } catch (error) {
      console.log("Handled");
    }
    
  }

  getAllProducts(id: number) {
    const products: any = this.products.getProducts();
    this.productsList = products.filter((x: any) => x.brand_type_id == id);
    this.dataSource = new MatTableDataSource(this.productsList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
    } else {
      this.resetTableView();
    }
  }

  resetTableView () {
    this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  }

  filterStatuses(e: any): void { 
    let results: Product[] = [];
    this.allProducts = (this.activeProducts ||  this.developmentProducts || this.eolProducts) ? false : true;
    if (this.allProducts) {
      results = this.productsList;
    } else {
      if (this.activeProducts && this.eolProducts && this.developmentProducts) {
        this.allProducts = true;
        results = this.productsList;
      } else {
        if (this.activeProducts && this.developmentProducts) {
          results = this.productsList.filter(x => x.is_in_development == 1 && x.is_active == 1);
        } else {
          if (this.activeProducts && this.eolProducts) {
            results = this.productsList.filter(x => x.is_active == 1 && x.is_eol == 1);
          } else {
            if (this.developmentProducts && this.eolProducts) {
              results = this.productsList.filter(x => x.is_in_development == 1 && x.is_eol == 1);
            } else {
              if (this.activeProducts) {
                results = this.productsList.filter(x => x.is_active == 1);
              } else if (this.developmentProducts) {
                results = this.productsList.filter(x => x.is_in_development == 1);
              } else {
                //EOL
                results = this.productsList.filter(x => x.is_eol == 1);
              }
            }
          }
        }
      }
    }
    this.table(results);
  }

  filterByCategory(e: any): void {
    console.log(e);
    this.api.GET(`products-by-category/${e.value}`).subscribe({
      next:(res)=>{
        console.log(res);
        this.table(res);
      }, error:(res)=>{ }
    });
  }

  getAllCategories(): void {
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.categoriesList = res;
      }, error:(res)=>{
        alert(res);
      }
    });
  }

  table(results: Product[]) {
    this.dataSource = new MatTableDataSource(results);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}


