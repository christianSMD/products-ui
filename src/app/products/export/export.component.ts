import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from '../../services/navbar/navbar.service';
import { SidenavService } from '../../services/sidenav/sidenav.service';
import { TreeService } from '../../services/tree/tree.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/interfaces/product';
import { Type } from 'src/app/interfaces/type';
import { Category } from 'src/app/interfaces/category';
import { InfoService } from 'src/app/services/info/info.service';
import { Router } from '@angular/router';
import FileSaver from 'file-saver';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  categories: Category[] = [];
  types: Type[] = [];
  brands: any[] = [];
  brand: string;
  brandName: string;
  loggedIn: boolean;
  eol: boolean = false;
  development: boolean = false;
  active: boolean = false;
  

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    public treeNav: TreeService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    private info: InfoService,
    private router: Router,
    private lookup: LookupService,
    private products: ProductsService
  ) {}
 
  ngOnInit(): void {
    this.getAllTypes();
    this.getAllCategories();
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 2000 });
  }

  getAllTypes() {
    this.types = this.lookup.getTypes();
  }

  selectBrand(e: any): void {
    console.log(e);
    this.brandName = e.value;
  }

  getAllCategories(): void {
    //this.categories = this.products.getCategories();
    // this.api.GET('categories').subscribe({
    //   next:(res)=>{
    //     this.categories = res;
    //     for (let index = 0; index < res.length; index++) {
    //       if (res[index].grouping == 'Brand') {
    //         this.brands.push(res[index].name);
    //       }
    //     }
    //     console.log('Brands: ', this.brands);
    //   }, error:(res)=>{
    //     alert(res);
    //   }
    // });
    
  }

  export(): void {
    this.openSnackBar('Exporting... ', 'Okay');
    this.api.downloadCSV('export', this.brand, this. active, this. development, this.eol).subscribe((res: BlobPart) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `${this.brand}.csv`);
      this.openSnackBar('Done! ', 'Okay');
    }, (err: any) => {
      console.log(err);
      this.openSnackBar('😢 ' + err.message, 'Okay');
    });
  }
}
