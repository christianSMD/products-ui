import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { Chart, registerables } from 'chart.js';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: ['./products-home.component.scss']
})
export class ProductsHomeComponent extends CdkTableExporterModule implements OnInit, AfterViewInit {

  productsList: Product[] = [];
  categoriesList: Category[] = [];
  primaryCategoriesList: Category[] = [];
  typesList: Type[] = [];
  packagingList: any[] = [];
  displayedColumns: string[] = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view', 'add'];
  //displayedColumns: string[] = ['id', 'thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view'];
  dataSource: MatTableDataSource<Product>;
  productsLoader = false;
  entireProductsLoader = false;
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
  productManagerProducts: Product[] = [];
  productManagerRole: boolean = false;
  loggedInUser: any;
  addingToMyProducts: boolean = false;
  users: User[] = [];
  user: User;
  usersLoader = true;
  displayMode = 'home';
  selectedUser: string;
  selectedUserAllProducts: number;
  selectedUserVerifiedProducts: number;
  selectedUserEolProducts: number;
  selectedUserInDevelopmentProducts: number;
  selectedUserActiveProducts: number;
  brands: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @BlockUI() blockUI: NgBlockUI;
  @ViewChild('myChart1') myChart1!: ElementRef;
  @ViewChild('myChart2') myChart2!: ElementRef;
  

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
    public formBuilder : FormBuilder,
    public lookup: LookupService,
    public products: ProductsService
  ) {
    super();
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }


  ngAfterViewInit() {
    this.charts('home', 0);
  }

 
  ngOnInit(): void {
    this.loggedInUser = this.info.getUserId();

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
        this.productManagerRole = this.info.role(86);
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
          this.productManagerRole = this.info.role(86);
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
      this.info.setLoadingInfo('Preparing...', 'info');
      this.addProductRole = this.info.role(61);
      this.addCategoryRole = this.info.role(60);
      this.productManagerRole = this.info.role(86);
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
    this.info.setLoadingInfo('Loading products...', 'info');
    if (this.viewAllProductsRole) {
      url = 'products';
    }
    this.productsLoader = true;
    this.api.GET(url).subscribe({
      next:(res)=>{
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productsLoader = false;
        this.blockUI.stop();
        this.info.setLoadingInfo('Products loaded', 'success');
        this.entireProducts();
        this.getUsers();
      }, error:(res)=>{
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'success');
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  /**
   * @todo Gets all the products from the API
   * @todo Populates the Products Service with dataa from the API
   */
  entireProducts() {
    this.info.setLoadingInfo('Loading more products...', 'info');
    this.entireProductsLoader = true;
    let url: string = 'products-verified';
    if (this.viewAllProductsRole) {
      let url: string = 'products-all';
    }
    this.api.GET(url).subscribe({
      next:(res)=>{
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.products.setProducts(res);
        this.entireProductsLoader = false;
        this.info.setLoadingInfo('Products loaded', 'success');
      }, error:(res)=>{
        this.info.setLoadingInfo(res, 'danger');
        this.entireProductsLoader = false;
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
    this.typesList = this.lookup.getTypes();
    this.info.setLoadingInfo('Loading types...', 'info');
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.lookup.setTypes(res);
        this.typesList = this.lookup.getTypes();
        this.brands = this.typesList.filter((x: any) => x.grouping == "Brand")
        this.info.setLoadingInfo('Types loaded', 'success');
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server', 'Okay');
        this.info.setLoadingInfo('Failed to communicate with the server: ' + res.message, 'info');
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
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'is_active', 'is_in_development', 'is_eol', 'updated_at', 'created_at', 'view', 'add'];
    } else {
      this.resetTableView();
    }
  }

  resetTableView () {
    this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view', 'add'];
  }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
  }

  filterStatuses(e: any): void { 
    let results: Product[] = [];
    this.allProducts = (this.activeProducts || this.developmentProducts || this.eolProducts) ? false : true;
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
    this.info.setLoadingInfo('Loading categories...', 'info');
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.products.setCategories(res);
        this.categoriesList = this.products.getCategories();
        this.primaryCategoriesList = res.filter((c: Category) => c.parent == '0');
        this.info.setLoadingInfo('Categories loaded', 'success');
      }, error:(res)=>{
        this.info.setLoadingInfo(res, 'info');
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
      this.displayedColumns = ['pamphlet', 'thumbnail', 'sku', 'name', 'brand', 'description', 'view', 'add'];
    } else {
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view', 'add'];
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  addToMyProducts(id: number): void {
    this.addingToMyProducts = true;
    this.api.POST(`products/update/${id}`, {
      product_manager: this.info.getUserId()
    }).subscribe({
      next:(res)=>{
        this.entireProducts();
        this.openSnackBar("Added to 'My Products'", 'Okay');
        this.addingToMyProducts = false;
      }, error:(res)=>{
        this.addingToMyProducts = false;
        this.info.errorHandler(res);
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  getUsers(): void {
    this.info.setLoadingInfo('Loading users, please wait...', 'info');
    this.usersLoader = true;
    this.api.GET('users').subscribe({
      next:(res)=>{
        this.usersLoader = false;
        this.users = res;
        console.log(this.users);
        this.info.setLoadingInfo('', 'info');
      }, error:(res)=>{
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'info');
      }
    });
  }

  filterByUser(e: any) {
    const u = this.users.find((x: any) => x.id == e.value);
    this.selectedUser = `${u?.name}'s products:`;
    this.displayMode = 'user';
    const userId = e.value;
    this.info.setLoadingInfo('Loading user products...', 'info');
    this.productsLoader = true;
    this.api.GET(`product-manager/products/${userId}`).subscribe({
      next:(res)=>{
        this.productsList = res;
        this.dataSource = new MatTableDataSource(this.productsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.productsLoader = false;
        this.blockUI.stop();
        this.info.setLoadingInfo('Products loaded successfully', 'info');
        this.charts('user', userId);
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'danger');
      }
    });
  }

  addToPamphlet (productId: string, sku: string, e: any) {
    // Moved to New Product
  }


  saveProduct() {
    // Moved to New Product
  }


  charts (mode: string, id: number) {
    try {
      const endpoint = (mode == 'home') ? 'home' : `home-user/${id}`;
      this.displayMode = (mode == 'home') ? 'home' : 'user';
      this.info.setLoadingInfo('Loading stats...', 'info');

      this.api.GET(endpoint).subscribe({
        next:(res: any)=>{

          // User mode
          this.selectedUserAllProducts = res.all;
          this.selectedUserVerifiedProducts = res.verified;
          this.selectedUserActiveProducts = res.active;
          this.selectedUserInDevelopmentProducts = res.dev;
          this.selectedUserEolProducts = res.eol;

          // Home mode
          Chart.register(...registerables); // Register the necessary components

          try {
            const canvas = (this.myChart1.nativeElement as HTMLCanvasElement).getContext('2d');

            if (!canvas) {
              console.error('Could not retrieve 2D context for canvas');
              return;
            }

            const myChart = new Chart(canvas, {
              type: 'bar',
              data: {
                labels: ['Verified', 'Active', 'Eol', 'Development', 'All'],
                datasets: [{
                  label: 'Verified Products',
                  data: [res.verified, res.active,  res.eol,  res.dev, res.all],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: true,
                    text: 'Products'
                  }
                }
              },
            });

            this.info.setLoadingInfo('', 'success');
          } catch (error) {
          
          }
          
        }, error:(res)=>{
          this.info.setLoadingInfo(res, 'info');
        }
      });

      const d: number = 7;
      this.api.GET(`home/${d}`).subscribe({
        
        next:(res: any)=>{
          
          if(this.displayMode == 'home') {
            this.api.GET(`home-verification/${d}`).subscribe({
            
              next:(e: any)=>{
  
                Chart.register(...registerables); // Register the necessary components
                const canvas2 = (this.myChart2.nativeElement as HTMLCanvasElement).getContext('2d');
  
                if (!canvas2) {
                  console.error('Could not retrieve 2D context for canvas');
                  return;
                }
                
                const myChart2 = new Chart(canvas2, {
                  type: 'line',
                  data: {
                    labels: [res[22]?.date, res[21]?.date, res[20]?.date, res[19]?.date, res[18]?.date, res[17]?.date, res[16]?.date, res[15]?.date, res[14]?.date, res[13]?.date, res[12]?.date, res[11]?.date, res[10]?.date, res[9]?.date, res[8]?.date, res[7]?.date, res[6]?.date, res[5]?.date, res[4]?.date, res[3]?.date, res[2]?.date, res[1]?.date, res[0]?.date],
                    datasets: [
                      {
                        label: 'Updated',
                        data: [res[22]?.total_updates, res[21]?.total_updates, res[20]?.total_updates, res[19]?.total_updates, res[18]?.total_updates, res[17]?.total_updates, res[16]?.total_updates, res[15]?.total_updates, res[14]?.total_updates, res[13]?.total_updates, res[12]?.total_updates, res[11]?.total_updates, res[10]?.total_updates, res[9]?.total_updates, res[8]?.total_updates, res[7]?.total_updates, res[6]?.total_updates, res[5]?.total_updates, res[4]?.total_updates, res[3]?.total_updates, res[2]?.total_updates, res[1]?.total_updates, res[0]?.total_updates],
                        borderWidth: 1,
                        fill: false
                      },
                      {
                        label: 'Verified',
                        data: [e[22]?.total_updates, e[21]?.total_updates, e[20]?.total_updates, e[19]?.total_updates, e[18]?.total_updates, e[17]?.total_updates, e[16]?.total_updates, e[15]?.total_updates, e[14]?.total_updates, e[13]?.total_updates, e[12]?.total_updates, e[11]?.total_updates, e[10]?.total_updates, e[9]?.total_updates, e[8]?.total_updates, e[7]?.total_updates, e[6]?.total_updates, e[5]?.total_updates, e[4]?.total_updates, e[3]?.total_updates, e[2]?.total_updates, e[1]?.total_updates, e[0]?.total_updates],
                        borderWidth: 1,
                        fill: true
                      }
                    ]
                  },
                  options: {
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      title: {
                        display: true,
                        text: 'Product Activity'
                      }
                    }
                  },
                });
  
  
              }, error:(res)=>{
                this.info.setLoadingInfo(res, 'info');
              }
          
            });
  
          }
          this.info.setLoadingInfo('', 'success');
        }, error:(res)=>{
          this.info.setLoadingInfo(res, 'info');
        }
      });
    } catch (error) {
      console.info("chart error handled")
    }
  }

}
