import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Activity } from '../interfaces/activity';
import { User } from '../interfaces/user';
import { ApiService } from '../services/api/api.service';
import { InfoService } from '../services/info/info.service';
import { NavbarService } from '../services/navbar/navbar.service';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { TreeService } from '../services/tree/tree.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  activities: Activity[] = [];
  displayedColumns: string [] = ['name', 'surname', 'email', 'is_active', 'view'];
  displayedColumns2: string [] = ['user_id', 'activity', 'date','product'];
  dataSource: MatTableDataSource<User>;
  dataSource2: MatTableDataSource<Activity>;
  usersLoader = false;
  addingNewUser= false;
  pageTitle = "Manage Users";
  userForm !: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator2: MatPaginator;
  @ViewChild(MatSort) sort2: MatSort;

  constructor(
    public navbar: NavbarService, 
    public sideNav: SidenavService,
    public topNav: NavbarService,
    private api: ApiService, 
    private _snackBar: MatSnackBar,
    public treeNav: TreeService,
    private router: Router,
    private info: InfoService,
    private _liveAnnouncer: LiveAnnouncer,
    private formBuilder : FormBuilder,
  ) { }

  ngOnInit(): void {
    this.info.auth();
    this.topNav.show();
    this.sideNav.show();
    this.treeNav.hide();
    this.getUsers();
    this.getUserActivities();
    this.userForm = this.formBuilder.group({
      name : ['', Validators.required],
      surname : ['', Validators.required],
      email : ['', [Validators.required, Validators.email]],
      password : [(Math.random() + 1).toString(36).substring(7)],
      nonSmdUser : [0],
    })
  }

  getUsers(): void {
    this.usersLoader = true;
    this.api.GET('users').subscribe({
      next:(res)=>{
        this.usersLoader = false;
        this.users = res;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
      }
    });
  }

  getUserActivities(): void {
    this.api.GET('activity').subscribe({
      next:(res)=>{
        console.log('Activities: ', res);
        this.activities = res;
        this.dataSource2 = new MatTableDataSource(this.activities);
        this.dataSource2.paginator = this.paginator;
        this.dataSource2.sort = this.sort;
      }, error:(res)=>{
        console.log('Failed to connect to the server: ' + res.message, 'Okay');
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

  announceSortChange2(sortState: Sort): void {
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

  applyFilter2(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    if (this.dataSource2.paginator) {
      this.dataSource2.paginator.firstPage();
    }
  }

  openSnackBar(message: string, action: string): void {
    this._snackBar.open(message, action);
  }

  goToProduct(id: number): void {
    console.log(id);
    this.api.GET(`products/search-by-id/${id}`).subscribe({
      next:(res)=>{
        let product: any[] = [];
        product.push(res);
        this.router.navigate([`../${product[0].sku}`]);
      }, error(err) {
        console.log(err);
      },
    });
  }

  userName(id: number) {
    const users = this.users.find(x => x.id == id);
    return users!.name;
  }

  addNewUser() {
    this.addingNewUser =! this.addingNewUser;
  }

  submit () {
    if(this.userForm.valid) {
      this.api.POST('register', this.userForm.value).subscribe({
        next:(res)=>{
          this.api.POST('reset_password_without_token', this.userForm.value).subscribe({
            next:(res)=>{
              this.openSnackBar('User added', 'Okay');
              this.addingNewUser =false;
              this.getUsers();
            },
            error:(res)=>{
              console.log(res);
            }
          });
        },
        error:(res)=>{
          alert(res.message);
        }
      });
    } else {
      alert("Form input invalid.");
    }
  }

}
