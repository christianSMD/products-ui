import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Type } from '../interfaces/type';
import { ApiService } from '../services/api/api.service';
import { InfoService } from '../services/info/info.service';
import { NavbarService } from '../services/navbar/navbar.service';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { TreeService } from '../services/tree/tree.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  typesLoader = false;
  types: any[] = [];
  displayedColumns: string [] = ['id', 'name', 'grouping'];
  dataSource: MatTableDataSource<Type>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    public treeNav: TreeService,
    private router: Router,
    private info: InfoService,
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getAllTypes();
  }


  getAllTypes(): void {
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.typesLoader = false;
        this.types = res;
        this.dataSource = new MatTableDataSource(this.types);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error:(res)=>{
        this.typesLoader = false;
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
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

}
