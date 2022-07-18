import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  showFiller = false;
  listBrands: string[] = ['Amplify', 'Bounce', 'Connex Connect', 'Connex devices', 'Travelwize', 'Volkano', 'VX Gaming', 'Travelwize', 'Volkano', 'VX Gaming', 'Travelwize', 'Volkano', 'VX Gaming', 'VX Gaming', 'Travelwize', 'Volkano', 'VX Gaming', 'VX Gaming', 'Travelwize', 'Volkano', 'VX Gaming'];
  searchForm !: FormGroup;
  constructor(
    public sideNav: SidenavService, 
    private router: Router,
    private formBuilder : FormBuilder
  ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      query : ['']
    })
  }

  selectBrand(brand: String): void {
    this.router.navigate(['products/list', brand.toLowerCase()]);
  }

}
