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
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-product-manager',
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.scss']
})
export class ProductManagerComponent extends CdkTableExporterModule implements OnInit {

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  primaryCategoriesList: Category[] = [];
  typesList: Type[] = [];
  packagingList: any[] = [];
  displayedColumns: string[] = ['thumbnail', 'sku', 'name', 'brand', 'description', 'verified', 'view'];
  //displayedColumns: string[] = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
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
  newPamphlet: any[] = [];
  newPamphletSKUs: any[] = [];
  showNewPamphletPanel: boolean = false;
  newProductForm !: UntypedFormGroup;
  productManagerProducts: Product[] = [];
  productsMissingCategories: Product[] = [];
  productManagerRole: boolean = false;
  verifiedProducts: any[] = [];
  productsViewInfo: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    public api: ApiService, 
    public _snackBar: MatSnackBar,
    public _liveAnnouncer: LiveAnnouncer,
    public info: InfoService,
    public router: Router,
    public formBuilder : UntypedFormBuilder,
    public lookup: LookupService,
    public products: ProductsService
  ) {
    super();
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }
 
  ngOnInit(): void {

    this.productManagerRole = this.info.role(88);

    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
    
    this.info.isRefreshed();
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
        this.getAllCategories();
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
          this.getAllCategories();
          this.addProductRole = this.info.role(61);
          this.addCategoryRole = this.info.role(60);
        } else {
          this.router.navigate(['login']);
        }
      }
      console.log('On inint Role: ' + this.viewAllProductsRole);
    }

    this.newProductForm = this.formBuilder.group({
      name : ['', Validators.required],
      brand_type_id : ['', Validators.required],
      description : ['', Validators.required],
      // short_description : ['', Validators.required],
    });

    this.info.auth();
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
    this.info.setLoadingInfo('Loading your products...', 'info');
    this.productsLoader = true;
    this.api.GET(`product-manager/products/${this.info.getUserId()}`).subscribe({
      next:(res)=>{
        this.productsList = res;
        this.verifiedProducts = this.productsList.filter((p: any) => p.verified == 1);
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productsLoader = false;
        this.blockUI.stop();
        this.info.setLoadingInfo('Your products loaded successfully', 'info');
        this.checkProductCategories();
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'danger');
      }
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getAllTypes() {
    this.info.setLoadingInfo('Preparing, please wait...', 'info');
    this.typesList = this.lookup.getTypes();
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.lookup.setTypes(res);
        this.typesList = this.lookup.getTypes();
        this.info.setLoadingInfo('', 'success');
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
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

  permission(role: number) {
    this.info.setLoadingInfo(`checking permissions...`, 'info');
    if(this.info.role(role)) {
      return true;
    }
    return false;
  }

  iconClick(s: string): void {
    this.info.setLoadingInfo(``, 'info');
    this.openSnackBar(s, '😉');
  }

  filePath(p: string) {
    return p.substring(7);
  }

  showDates(e: any) {
    if (this.displayDates) {
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'verified', 'view'];
    } else {
      this.resetTableView();
    }
  }

  resetTableView () {
    this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'verified', 'view'];
  }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
  }

  filterStatuses(e: any): void { 
    let results: Product[] = [];
    this.allProducts = (this.activeProducts ||  this.developmentProducts || this.eolProducts) ? false : true;
    if (this.allProducts) {
      results = this.productsList;
      this.info.setLoadingInfo(`Showing all your products.`, 'info');
    } else {
      if (this.activeProducts && this.eolProducts && this.developmentProducts) {
        this.allProducts = true;
        results = this.productsList;
        this.info.setLoadingInfo(`Showing Active, EOL, and In Development products`, 'info');
      } else {
        if (this.activeProducts && this.developmentProducts) {
          results = this.productsList.filter(x => x.is_in_development == 1 && x.is_active == 1);
          this.info.setLoadingInfo(`Showing Active and In Development products`, 'info');
        } else {
          if (this.activeProducts && this.eolProducts) {
            results = this.productsList.filter(x => x.is_active == 1 && x.is_eol == 1);
            this.info.setLoadingInfo(`Showing Active and EOL products`, 'info');
          } else {
            if (this.developmentProducts && this.eolProducts) {
              results = this.productsList.filter(x => x.is_in_development == 1 && x.is_eol == 1);
              this.info.setLoadingInfo(`Showing EOL and In Development products`, 'info');
            } else {
              if (this.activeProducts) {
                results = this.productsList.filter(x => x.is_active == 1);
                this.info.setLoadingInfo(`Showing Active products`, 'info');
              } else if (this.developmentProducts) {
                results = this.productsList.filter(x => x.is_in_development == 1);
                this.info.setLoadingInfo(`Showing  In Development products`, 'info');
              } else {
                //EOL
                results = this.productsList.filter(x => x.is_eol == 1);
                this.info.setLoadingInfo(`Showing EOL products`, 'info');
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
    this.info.setLoadingInfo('Loading categories', 'info');
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.products.setCategories(res);
        this.categoriesList = this.products.getCategories();
        this.primaryCategoriesList = res.filter((c: Category) => c.parent == '0');
        this.info.setLoadingInfo('Categories loaded', 'success');
      }, error:(res)=>{
        this.info.setLoadingInfo(res, 'warn');
      }
    });
  }

  table(results: Product[]) {
    this.dataSource = new MatTableDataSource(results);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showPamphletCheckboxes () {
    this.showNewPamphletPanel = !this.showNewPamphletPanel;
    if (this.showNewPamphletPanel) {
      this.displayedColumns = ['pamphlet', 'thumbnail', 'sku', 'name', 'brand', 'description', 'verified', 'view'];
    } else {
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'verified', 'view'];
    }
  }

  productsToDisplay(s: string) {
    let products_to_display: Product[] = [];
    if (s == 'active') {
      products_to_display= this.productsList.filter((p: any) => p.is_active == 1);
      this.productsViewInfo = "Showing: Active Products";
    }
    if (s == 'verified') {
      products_to_display = this.productsList.filter((p: any) => p.verified == 1);
      this.productsViewInfo = "Showing: Verified Products";
    }
    if (s == 'unverified') {
      products_to_display = this.productsList.filter((p: any) => p.verified == 0);
      this.productsViewInfo = "Showing: Unverified Products";
    }
    if (s == 'missingCategories') {
      products_to_display = this.productsMissingCategories;
      this.productsViewInfo = "Showing: Verified Products with missing categories";
    }
    
    this.dataSource = new MatTableDataSource(products_to_display);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  checkProductCategories() {
    this.info.setLoadingInfo('Loading product categories...', 'success');
    this.productsLoader = true;
    this.api.GET(`product-manager-catrgories/products/${this.info.getUserId()}`).subscribe({
      next:(res)=>{
        console.log(res);
        this.productsMissingCategories = res;
        this.productsLoader = false;
        this.blockUI.stop();
        this.info.setLoadingInfo('Product categories loaded', 'success');
      }, error:(res)=>{ }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  addToPamphlet (productId: string, sku: string, e: any) {
    // Moved to New Product
  }

  saveProduct() {
    // Moved to New Product
  }

}
