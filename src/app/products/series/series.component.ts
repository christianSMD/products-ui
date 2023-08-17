import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';
import { Type } from 'src/app/interfaces/type';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.scss']
})


export class SeriesComponent implements OnInit {

  displayedColumns: string[] = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
  dataSource: MatTableDataSource<Product>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @BlockUI() blockUI: NgBlockUI;
  series: string;
  seriesId: number;
  typesList: Type[] = [];
  loggedIn = false;
  productsList: Product[] = [];
  categoriesList: Category[] = [];
  packagingList: any[] = [];
  productsLoader = false;
  viewAllProductsRole = false;
  storageUrl: string;
  displayDates: boolean = false;
  activeProducts: boolean = false;
  eolProducts: boolean = false;
  developmentProducts: boolean = false;
  allProducts: boolean = true;
  showNewPamphletPanel: boolean = false;


  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    public api: ApiService, 
    public _snackBar: MatSnackBar,
    public _liveAnnouncer: LiveAnnouncer,
    public info: InfoService,
    private route: ActivatedRoute, 
    private router: Router,
    public formBuilder : UntypedFormBuilder,
    public lookup: LookupService,
    public products: ProductsService
  ) {
    this.info.isUserLoggedIn.subscribe(value => {
      this.loggedIn = value;
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.series = params['series'];
      this.typesList = this.lookup.getTypes();
      const lookupType = this.typesList.find((x: Type) => x.name.toUpperCase() == this.series.toUpperCase() );
      console.log('Lookup type: ', lookupType);
      this.loadProducts(lookupType!.id);
    });
  }

  loadProducts(type: number) {
    this.api.GET(`products-by-series/${type}`).subscribe({
      next:(res)=>{
        console.log(res);
        this.table(res);
      }, error:(res)=>{ }
    });
  }

  table(results: Product[]) {
    this.dataSource = new MatTableDataSource(results);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getBrandName(id: string) {
    let i = 0;
    i = parseInt(id) - 1;
    if(this.typesList[i] == undefined || isNaN(i) || i == null) {
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
        this.products.setCategories(res);
        this.categoriesList = this.products.getCategories();
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  showPamphletCheckboxes () {
    this.showNewPamphletPanel = !this.showNewPamphletPanel;
    if (this.showNewPamphletPanel) {
      this.displayedColumns = ['pamphlet', 'thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
    } else {
      this.displayedColumns = ['thumbnail', 'sku', 'name', 'brand', 'description', 'view'];
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  
}
