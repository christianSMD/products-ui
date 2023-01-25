import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { Type } from 'src/app/interfaces/type';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {

  typesLoader = false;
  types: any[] = [];
  displayedColumns: string [] = ['brand', 'products', 'manager'];
  dataSource: MatTableDataSource<Type>;
  newType: string = "";
  groups: string[] = [];
  brandManagerId: any;
  brandManager: string = "";
  users: User[] = [];
  loadBrandManager: boolean = true;
  roles: any[] = [];
  productsList: Product[] = [];
  adminRole: boolean = false;
  brandManagerRole: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    private router: Router,
    private info: InfoService,
    private _liveAnnouncer: LiveAnnouncer,
    public treeNav: TreeService,
    public productService: ProductsService
  ) { }

  ngOnInit(): void {
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllTypes();
    this.getUsers();
    this.getRoles();
    this.brandManagerRole = this.info.role(87);
    this.adminRole = this.info.role(90);
  }

  getAllTypes(): void {
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.typesLoader = false;
        this.types = res;
        const dataSource = this.types.filter((x: Type) => x.grouping == "Brand");
        this.dataSource = new MatTableDataSource(dataSource);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        let temp = this.types.map((x: any) => x.grouping);
        this.groups = Array.from(new Set(temp));
        temp = [];
      }, error:(res)=>{
        this.typesLoader = false;
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  table(e: any): void {
    let group = e.tab.textLabel;
    let dataSource = this.types.filter((x: Type) => x.grouping == group);
    if (group=="") {
      dataSource = this.types;
    }
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort): void {
    console.log(sortState);
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  addNewType(group: string) {
    // Check if new type does not already exist
    const newType = this.newType;
    const typeExists = this.types.find((x: Type) => x.name.toLowerCase() == newType.toLowerCase());
    if(!typeExists) {
      // Add this.type to grouping
      this.api.POST('types', {
        name: this.newType,
        grouping: group
      }).subscribe({
        next:(res) => {
          console.log(res);
          this.getAllTypes();
          const e = {
            'index': 0,
            'tab': {
              'textLabel': this.newType
            }
          };
          this.table(e);
          this.openSnackBar(`${this.newType} has been added.`, 'OKay');
        }, error:(res) => {
          this.typesLoader = false;
          this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
        }
      });
    } else {
      this.openSnackBar(`${this.newType} already added.`, 'OKay');
    }
  }

  getUsers() {
    try {
      this.api.GET('users').subscribe({
        next:(res)=>{
          this.users = res;
          this.loadBrandManager = false;
        }, error:(res)=>{
          this.loadBrandManager = false;
          this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        }
      });
    } catch (error) {
      this.loadBrandManager = false;
    }
    
  }

  selectUser(e: any, brand_id: number) {
    const userId = e.value;
    this.api.POST(`roles`, {
      user_id: userId,
      type_id: 86,
      product_id: 0,
      brand_id: brand_id
    }).subscribe({
      next:(res)=> {
        this.openSnackBar('Brand Manager updated', 'Okay');
        this.info.activity(`Updated Brand Manager`, 0);
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  changeName(e: any, brand_type_id: number) {
    const newName = e.target.value;
    const brandId = brand_type_id

    this.api.POST(`types/update/${brandId}`, {
      name: newName
    }).subscribe({
      next:(res)=> {
        console.log(res);
        this.openSnackBar("Brand name changes to " + newName, 'Okay');
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  getRoles() {
    this.api.GET('roles').subscribe({
      next:(res)=>{
        this.roles = res;
      }, error:(res)=>{
      }
    });
  }

  getManager(brand_type_id: number) {
   const brandRole =  this.roles.find((r: any) => r.brand_id == brand_type_id);
   if (brandRole) {
    const user = this.users.find((u: any) => u.id == brandRole.user_id);
    return user?.name;
   }
    return "";
  }

  countBrandProducts (brand_type_id: number) {
    this.productsList = this.productService.getProducts();
    const products = this.productsList.filter((p: any)=> p.brand_type_id == brand_type_id)
    return products.length;
  }

  selectBrand(brand: String): void {
    this.router.navigate(['/brand', brand.toLowerCase()]);
  }

}
