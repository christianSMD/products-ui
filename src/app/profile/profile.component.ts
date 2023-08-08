import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '../interfaces/user';
import { ApiService } from '../services/api/api.service';
import { InfoService } from '../services/info/info.service';
import { NavbarService } from '../services/navbar/navbar.service';
import { TreeService } from '../services/tree/tree.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  id: string;
  newRole: string = '';
  addBtnText: string = "Add Role";
  loader = false;
  deleting = false;
  user: any;
  roles: any[] = [];
  userRoles: any[] = [];
  typesList: any[] = [];
  userForm !: FormGroup;
  rolesForm !: FormGroup
  isActive = false;
  authRole: boolean = false;
  notFound: string = '';
  adminRole: boolean = false;
  myTeams:any[] = [];

  constructor(
    public navbar: NavbarService, 
    public treeNav: TreeService, 
    private api: ApiService, 
    private _snackBar: MatSnackBar, 
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder : FormBuilder,
    private info: InfoService
  ) { }

  ngOnInit(): void {
    this.authRole = this.info.role(58);
    this.adminRole = this.info.role(90);
    this.info.auth();
    this.navbar.show();
    this.treeNav.hide();
    this.getAllTypes();
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      if(!this.authRole && this.id !== this.info.getUserId()) {
        this.openSnackBar("⛔ You don't have persmissions to access this user.", 'Okay');
        this.router.navigate(['/']);
      }
      this.getUserDetails();
    });
  }

  getUserDetails(): void {
    this.loader = true;
    this.api.GET(`users/${this.id}`).subscribe({
      next:(res) => {
        if (res) {
          this.notFound = ""; 
          this.user = res;
          this.userForm = this.formBuilder.group({
            name: [this.user.name, Validators.required],
            surname: [this.user.surname, Validators.required],
            email: [{value: this.user.email, disabled: true}],
            id: [{value: this.user.id, disabled: true}],
            is_active: [this.user.is_active],
            created_at: [{value: this.user.created_at, disabled: true}],
            updated_at: [{value: this.user.updated_at, disabled: true}],
          });
          this.isActive = (this.user.is_active == 1) ? true : false; 
          this.getUserRoles();
          this.getUserTeams();
          this.loader = false;
        } else {
          this.notFound = "🤷‍♂️ User not found.";
        }
      }, error:(res) => {
        console.log(res);
      }
    });
  }

  getUserRoles(): void {
    this.loader = true;
    this.api.GET(`roles/search/${this.id}`).subscribe({
      next:(res)=>{
        this.loader = false;
        this.userRoles = res;
        this.loader = false;
      }, error:(res)=>{
        this.loader = true;
      }
    });
  }

  getUserTeams(): void {
    this.loader = true;
    this.api.GET(`teams/${this.id}`).subscribe({
      next:(res) => {
        this.myTeams = res;
        this.loader = false;
      }, error:(e) => {
        this.loader = true;
      }
    });
  }

  getAllTypes() {
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.typesList = res;
        this.roles = res.filter(item => item.grouping == 'Role' || item.grouping == 'Title');
        console.log('Roles', this.roles);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  checkTheBox(role: string) {
    try {
      const typeId = this.typesList.findIndex((types: any) => types.name == role);
      const roleFound = this.userRoles.findIndex((userRoles: any)=> userRoles.type_id == typeId + 1);
      if (roleFound == -1) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
    
  }

  setRole(e: any, type_id: string):void {
    console.log(e);
    this.newRole = type_id;
    if(e.checked) {
      this.addRole();
    } else {
      this.removeRole(this.id, type_id);
    }
  }

  addRole():void {
    this.api.POST(`roles`, {
      user_id: this.id,
      type_id: this.newRole,
      product_id: 0,
      brand_id: 0
    }).subscribe({
      next:(res)=> {
        console.log(res);
        this.addBtnText = "Add Role";
        this.openSnackBar('Role added', 'Okay');
        this.info.activity(`Added new role to ${this.user.name}`, 0);
        this.getUserRoles();
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  removeRole(userId: string, type_id: string): void {
    this.deleting = true;
    const findRole = this.userRoles.find((r: any) => r.type_id == type_id && r.user_id == userId);
    const roleId = findRole.id;
    this.api.GET(`roles/delete/${roleId}`).subscribe({
      next:(res)=>{
        this.typesList = res;
        this.getUserRoles();
        this.roleName('');
        this.deleting = false;
        this.info.activity(`Removed role from ${this.user.name}`, 0);
        console.log("Removing role: ", res);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  roleName(id: string) {
    let i = 0;
     i = parseInt(id) - 1;
     if(this.typesList[i] == undefined) {
      return '';
    }
     return this.typesList[i].name;
  }

  account(e: any): void {
    this.userForm.patchValue({
      is_active: e.value
    });
  }

  update(): void {
    console.log('updating:', this.id);
    this.api.POST(`users/update/${this.id}`,this.userForm.value).subscribe({
      next:(res)=>{
        console.log(res);
        this.getUserDetails();
        this.info.activity(`Updated ${this.user.name}'s details`, 0);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

}
