import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent implements OnInit, AfterViewInit {

  brandSeries: string[];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  urlParam: string;
  brand: string;
  searchSeiriesForm !: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private route: ActivatedRoute, public topNav: NavbarService, public treeNav: TreeService, private formBuilder : FormBuilder) { }

  ngOnInit(): void {
    this.topNav.show();
    this.treeNav.show();
    
    this.searchSeiriesForm = this.formBuilder.group({
      query : ['']
    })
  }


  ngAfterViewInit(): void {

    this.route.params.subscribe((params: Params) => {
      this.urlParam = params['brand'];
      this.brand = this.urlParam.toUpperCase();
      
      //For Presentation:
      if(this.brand.toLocaleLowerCase() == 'volkano') {
        this.brandSeries = ['Active Clamp', 'Awake', 'Peak', 'Endeavour', 'Dialogue', 'Active Tech', 'Tech Stamina', 'Session', 'Routine', 'Storm'];
      }

      if(this.brand.toLocaleLowerCase()  == 'amplify') {
        this.brandSeries = ['Silo', 'Bongo', 'Dupla', 'Radium', 'Mercury', 'Linked', 'Sport Compete', 'Zodiac', 'Sport Athletic', 'Note X'];
      }

      if(this.brand.toLocaleLowerCase()  == 'bounce') {
        this.brandSeries = ['Onyx', 'Adapt', 'Chase', 'Clef S', 'Cord', 'Boomer', 'Tremor', 'Rumble', 'Circuit', 'Bachata'];
      }

    });

    this.dataSource.paginator = this.paginator;

  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
  {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
  {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
  {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
  {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
  {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
  {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
  {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
  {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
  {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
];