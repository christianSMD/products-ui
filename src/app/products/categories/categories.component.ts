import { Component, OnInit, Directive, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from 'src/app/interfaces/category';
declare var swal: any;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})

/**
 * Handles categories.
 * @class
 */
export class CategoriesComponent implements OnInit {

  addCategory !: FormGroup;
  updateCategory !: FormGroup;
  newCategoryId: number = 0;
  newCategoryName: string = "";
  categoriesList: Category[] = [];
  categoryForm: FormGroup;
  attrCount: number;
  attributesFields: any[] = [];
  selectedCatName: string = "";
  selectedCatId = 0;
  selectedCatParentId: string = "";
  selectedCatParentName: string = "";
  currentStep:number = 1;
  disableSaveCatBtn = false;
  disableSaveAttrBtn = true;
  disableAddAttrBtn = true;
  saveCatBtnText = "Save Category";
  saveAttrBtnText = "Save Attributes";
  goToCategoriesBtn = false;
  hasParent = false;

  constructor(public navbar: NavbarService, private api: ApiService, private formBuilder : FormBuilder, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.attrCount = 0;
    this.navbar.show();
    this.getAllCategories();
    this.addCategory = this.formBuilder.group({
      name : ['', Validators.required],
      parent : ['0'],
    });
    this.updateCategory = this.formBuilder.group({
      name : ['', Validators.required],
      parent : [''],
    });
    this.categoryForm = this.formBuilder.group({
      attributes: this.formBuilder.array([])
    })
  }

  /**
   * Returns all categories from the backend
   */
  getAllCategories(): void {
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.categoriesList = res;
      }, error:(res)=>{
        alert(res);
      }
    });
  }

  addNewCategory() {
    if(this.addCategory.valid) {
      this.disableSaveCatBtn = true;
      this.saveCatBtnText = "Saving...";
      this.api.POST('categories', this.addCategory.value).subscribe({
        next:(res)=> {
          console.log(res.id);
          this.newCategoryId = res.id;
          this.newCategoryName = res.name;
          this.disableAddAttrBtn = false;
          this.disableSaveAttrBtn = false;
          this.saveCatBtnText = "Category Saved";
          this.getAllCategories();
          this.openSnackBar(res.name + ' Added', 'Okay');
        }, error:(res)=>{
          console.log('AddNewCategory Error: ' + res.message);
          this.openSnackBar('Failed to save category. Please try again or contact Administrator.', 'Okay');
          this.disableSaveCatBtn = false;
          this.saveCatBtnText = "Failed. Try again";
        }
      });
    } else {
      console.log("Form input invalid.");
    }
  }

  get attributes() {
    return this.categoryForm.get('attributes') as FormArray
  }

  addNewAttribute() {
    const attrs = this.formBuilder.group({
      attrName: [],
      // attrValue: []
    })
    this.attributes.push(attrs);
    this.attrCount = this.attrCount + 1;
  }

  removeNewAttribute(i: number) {
    this.attributes.removeAt(i);
    this.attrCount = this.attrCount - 1;
  }

  /**
   * @description Add or remove categorie's attributes
   * @param action - Can be 'New' or 'Update' 
   */
  updateAttributes(action: string): void {
    this.disableSaveAttrBtn = true;
    this.disableAddAttrBtn = true;
    this.goToCategoriesBtn = true;
    this.saveAttrBtnText = "Saving...";
    //let formObj = this.categoryForm.getRawValue();
    let formObj = this.categoryForm.value.attributes;
    let catId = (action == 'new') ? this.newCategoryId : this.selectedCatId;
    this.api.POST(`categories/update/${catId}`, formObj).subscribe({
      next:(res)=> {
        this.saveAttrBtnText = "Attributes Saved";
        this.openSnackBar(this.attrCount + ' attributes added', 'Okay');
        this.getAllCategories();
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  /**
   * @todo Searches for a specific category from the categoriesList in <ul>
   * @todo Sets selected category's name, id, parent and attributes
   * @param i - Selected category Id from the view
   */
  selectCategory(i: any): void {
    this.clearSelectedCat();
    console.log("Selected: " + JSON.parse(i));
    try {
      let obj = this.categoriesList.find(x => x.id === i);
      console.log("Category : ", obj);
      let fields = obj?.attributes;
      fields = JSON.parse(fields);
      console.log("fields", fields);
      this.attributesFields = fields;
      this.selectedCatId = obj?.id as number; //or use Non-null Assertion Operator like so: obj?.id!
      this.selectedCatName = obj?.name!;
      this.selectedCatParentId = obj?.parent!;

      this.getParent(parseInt(this.selectedCatParentId));
      
      for (let x = 0; x < this.attributesFields.length; x++) {
        const attrs = this.formBuilder.group({
          attrName: [this.attributesFields[x].attrName]
        })
        this.attributes.push(attrs);
      }
    } catch (error) {
      console.log(error);
    }
    
  }

  /**
   * @description For displaying category Name and it parent's Name on the edit details form
   * @param parentId 
   */
  getParent(parentId: number) {
    if (parentId > 0) {
      let obj = this.categoriesList.find(x => x.id === parentId);
      this.selectedCatParentName = obj?.name!;
      this.updateCategory = this.formBuilder.group({
        name : [this.selectedCatName, Validators.required],
        parent : [this.selectedCatParentName],
      });
    } else  {
      this.updateCategory = this.formBuilder.group({
        name : [this.selectedCatName, Validators.required],
        parent : [''],
      });
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  /**
   * @todo Resets category form when switching between tabs (Manage Categories and New Category).
   */
  clearSelectedCat(): void {
    this.getAllCategories();
    this.selectedCatId = 0;
    this.selectedCatName = "";
    this.categoryForm = this.formBuilder.group({
      attributes: this.formBuilder.array([])
    })
  }

  /**
   * @param {any} e - onSelectChange event
   * @description gets Parent ID from the dropdown, See 'selectParentCategory()' function.
   */
  selectParentCategory (e: any): void {
    const id = e.value
    this.selectCategory(id);
    this.hasParent = true;
  }

  /**
   * @todo Reloads page.
   */
  refresh(): void {
    location.reload();
  }

}
