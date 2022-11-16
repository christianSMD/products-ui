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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  displayedColumns: string[] = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
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
  newProductForm !: FormGroup;

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
    private router: Router,
    private formBuilder : FormBuilder
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
    let url: string = 'products-verified';
    if (this.viewAllProductsRole) {
      url = 'products';
    }
    //this.blockUI.start('Loading products..');
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
        this.entireProducts();
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  entireProducts() {
    let url: string = 'products-all';
    this.api.GET(url).subscribe({
      next:(res)=>{
        console.log(res);
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error:(res)=>{}
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
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
    } else {
      this.resetTableView();
    }
  }

  resetTableView () {
    this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
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

  showPamphletCheckboxes () {
    this.showNewPamphletPanel = !this.showNewPamphletPanel;
    if (this.showNewPamphletPanel) {
      this.displayedColumns = ['pamphlet', 'thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
    } else {
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
    }
  }

  addToPamphlet (productId: string, sku: string, e: any) {
    // get id for sku
    const product = this.productsList.find((p: any) => p.sku == sku);
    const id = product?.id;
    console.log("product id: ", id);
    if (e.checked) {
      this.newPamphlet.push(productId);
      this.newPamphletSKUs.push(sku);
    } else {
      const x = this.newPamphlet.indexOf(productId);
      const y = this.newPamphletSKUs.indexOf(sku);
      if (x > -1) { 
        this.newPamphlet.splice(x, 1);
      }
      if (y > -1) { 
        this.newPamphletSKUs.splice(y, 1);
      }
    }

    console.log("Selected IDs: ", this.newPamphlet);
  }


  saveProduct() {
    console.log(this.newProductForm.value);
    //Still need to add items on the images object
    this.api.POST('products-pamphlet', this.newProductForm.value).subscribe({
      next:(res) => {
        this.info.activity('Created new pamphlet', 0);
        this.openSnackBar(res.name + ' Created 😃', 'Okay');
        // Now add linked products
        for (let index = 0; index < this.newPamphlet.length; index++) {
          this.api.POST('link-products', {
            parent_id: res.id,
            child_id: this.newPamphlet[index]
          }).subscribe({
            next:(res) => {
              console.log(res);
            }, error:(res)=>{
              this.openSnackBar('😢 ' + res.message, 'Okay');
            }
          });
        }
        this.router.navigate([res.sku]);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

}
