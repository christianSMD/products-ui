import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/interfaces/product';
import { MatTableDataSource } from '@angular/material/table';
import { Category } from 'src/app/interfaces/category';
import { Type } from 'src/app/interfaces/type';
import { MatListOption } from '@angular/material/list'
import { Observable } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { InfoService } from 'src/app/services/info/info.service';

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit {

  newProductForm !: FormGroup;
  newProductCategoriesForm !: FormGroup;
  newProductFormAttributes !: FormGroup;
  newProductFormPackaging !: FormGroup;
  productsList: Product[] = [];
  categoriesList: Category[] = [];
  selectedCategories: any[] = [];
  typesList: Type[] = [];
  displayedColumns: string[] = ['id', 'sku', 'name', 'brand', 'description'];
  dataSource: MatTableDataSource<Product>;
  panelOpenState = false;
  panelOpenStateVariations = false;
  categoriesLoader = false;
  typesLoader = false;
  parent = false;
  frontImage = false;
  //These will be returned after product has been successfully added
  newProductId = 0;
  newProductSKU = '';
  newProductName = '';
  // Variable to store shortLink from api response
  shortLink: string = "";
  loading: boolean = false; // Flag variable
  files: any[] = []; // Variable to store fill
  images : string[] = [];
  //For uploading
  messages: string[] = [];
  imageInfos?: Observable<any>;
  uploadProgress = 0;
  uploadProgressBar = 'width:0%;height:20px';
  focusType: string = '47';
  newProductCategories: Category[] = [];
  attributesFields: any[] = [];
  saveAttrBtnText = "Save and Continue";
  attrCount: number;
  disableSaveAttrBtn = false;
  activeTabIndex = 0;
  nextBtn = false;
  prevBtn = false;
  doneBtn = false;
  savedFiles: any[] = [];
  storageUrl: string;
  skuPattern = "^[a-zA-Z0-9_-]{4,12}$";
  
  constructor(public navbar: NavbarService, private api: ApiService, private formBuilder : FormBuilder, private _snackBar: MatSnackBar, public info: InfoService) {}

  ngOnInit(): void {
    this.info.auth();
    this.attrCount = 0;
    this.storageUrl = this.api.getStorageUrl();
    this.navbar.show();
    this.getAllTypes();
    this.getAllCategories();

    window.addEventListener("beforeunload", function (e) {
      const confirmationMessage = "\o/";
      e.returnValue = '';
      return confirmationMessage;
    });

    this.newProductForm = this.formBuilder.group({
      sku : ['', [Validators.required, Validators.pattern(this.skuPattern)]],
      name : ['', Validators.required],
      brand_type_id : ['', Validators.required],
      description : ['', Validators.required],
      short_description : ['', Validators.required],
      parent_id : [0, Validators.required],
      is_eol : [0, Validators.required],
      is_in_development : [0, Validators.required],
      is_active: [0, Validators.required]
    });

    this.newProductFormPackaging = this.formBuilder.group({
      weight : ['', Validators.required],
      length : ['', Validators.required],
      width : ['', Validators.required],
      height : ['', Validators.required],
      packaging_type_id : ['', Validators.required],
      product_id : [this.newProductId, Validators.required],
    });

    this.newProductFormAttributes = this.formBuilder.group({
      attributes: this.formBuilder.array([])
    });
  }

  get attributes() {
    return this.newProductFormAttributes.get('attributes') as FormArray
  }

  get sku() {
    return this.newProductForm.get('sku');
  }

  setParent(): void {
    this.parent = true;
    console.log(this.parent);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllCategories() {
    this.categoriesLoader = true;
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.categoriesLoader = false;
        this.categoriesList = res;
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getAllTypes() {
    this.categoriesLoader = true;
    this.api.GET('types').subscribe({
      next:(res)=>{
        console.log('Types: ');
        console.log(res);
        this.typesLoader = false;
        this.typesList = res;
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  saveProduct() {
    this.api.POST('products', this.newProductForm.value).subscribe({
      next:(res)=>{
        this.newProductId = res.id;
        this.newProductSKU = res.sku;
        this.newProductName = res.name;
        this.newProductFormPackaging.patchValue({
          product_id: res.id,
        });
        this.openSnackBar(res.name + ' Added 😃', 'Okay');
        this.nextTab();
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  saveCategories() {
    const vals = this.selectedCategories;
    if (vals.length > 0) {
      for(let i=0; i < vals.length; i++) {
        this.api.POST('product-categories', {
          product_id: this.newProductId,
          category_id: vals[i]
        }).subscribe({
          next:(res)=>{
            this.prevBtn = true;
            this.getProductCategories();
            this.openSnackBar('Category Added 😃', 'Okay');
          }, error:(res)=>{
            this.openSnackBar('😢 ' + res.message, 'Okay');
          }
        })
      }
      this.nextTab();
    }
    this.openSnackBar('Please choose categories', 'Okay');
  }

  /**
   * @description Add or remove categorie's attributes
   * @param action - Can be 'New' or 'Update' 
   */
   saveAttributes(action: string): void {
    this.disableSaveAttrBtn = true;
    this.saveAttrBtnText = "Saving...";
    let formObj = this.newProductFormAttributes.getRawValue();
    console.log('Raw attr: ', formObj);
    this.api.POST(`products/update-attributes/${this.newProductId}`, formObj).subscribe({
      next:(res)=> {
        console.log(res);
        this.saveAttrBtnText = "Attributes Saved";
        this.openSnackBar('Attributes Saved', 'Okay');
        this.nextBtn = true;
        this.nextTab();
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  savePackaging() {
    this.api.POST('packaging', this.newProductFormPackaging.value).subscribe({
      next:(res)=>{
        this.openSnackBar('Packaging Saved 😃', 'Okay');
        this.nextTab();
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  returnTypeName(id: any) {
    id=id-1;
    return this.typesList[id].name;
  }


  // On file Select
  onChange(event: any) {
    this.files = event.target.files;
    console.log(this.files);
    
    for(let x = 0; x < this.files.length; x ++) {
      if(this.files[x].size > 2000000) {
        const msg = "🚫 " + this.files[x].name + " is too large!";
        this.messages.push(msg);
      }
    }
  }

  onUpload(fileTypeId: string) {
    this.loading = !this.loading;
    console.log('Files being uploaded: ', this.files.length);
    if (this.files.length > 0) {
      for(let x = 0; x < this.files.length; x ++) {
        console.log('Uploading file ' + this.files[x].name);
        this.api.upload('uploading-file-api', {
          file: this.files[x],
          name: this.files[x].name,
          product_id: this.newProductId,
          product_sku: this.newProductSKU,
          type_id: fileTypeId
        }).subscribe(
          (event: any) => {
            if (typeof (event) === 'object') {
              this.shortLink = event.link;
              this.loading = false; 
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressBar = `width:${this.uploadProgress}%;height:10px`;
            } else if (event instanceof HttpResponse) {
              const msg = this.files[x].name + ' ploaded the file successfully.';
              this.messages.push(msg);
            } 
            this.getFiles();
          }, (err: any) => {
            this.uploadProgress = 0;
            const msg = '' + this.files[x].name + ' could not upload the file: ';
            this.messages.push(msg);
          }
        );
      }
    } else {
      this.openSnackBar('Please select files', 'Okay')
      this.loading = false;
    }
    
  }

  setFocusType(event: any) {
    this.focusType = event.target.value;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  /**
   * @todo Get categories asigned to product.
   * @todo Loop each category for attributes.
   */
  getProductCategories(): void {
    this.api.GET(`product-categories/search/${this.newProductId}`).subscribe({
      next:(res)=>{
        console.log('res: ', res);
        for (let x = 0; x < res.length; x++) {
          let attributes = JSON.parse(res[x].attributes);
          console.log("for " + res[x].name, attributes);
          console.log(res[x].name + " has " + attributes.length);

          for (let y = 0; y < attributes.length; y++) {
            const i = this.attributes.value.findIndex((object: any) => object.attrName === attributes[y].attrName);
            if (i === -1) {
              const attrs = this.formBuilder.group({
                attrName: [attributes[y].attrName, Validators.required],
                attrValue: ['0', Validators.required]
              })
              this.attributes.push(attrs);
              this.attrCount = this.attrCount + 1;
            }
            
          }
        }
        console.log("this.attributes", this.attributes);
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  removeNewAttribute(i: number) {
    this.attributes.removeAt(i);
    this.attrCount = this.attrCount - 1;
  }

  nextTab(): void {
    const tabCount = 6;
    this.activeTabIndex = (this.activeTabIndex + 1) % tabCount;
    this.doneBtn = (this.activeTabIndex > 4) ? true : false;
    console.log('Tab: ', this.activeTabIndex);
    if (this.activeTabIndex == 2) {
      this.nextBtn = false;
    }
  }

  previousTab(): void {
    const tabCount = 6;
    this.activeTabIndex = (this.activeTabIndex - 1) % tabCount;
  }

  done(): void {
    location.reload();
  }

  getFiles(): void {
    this.api.GET(`product-files/${this.newProductId}`).subscribe({
      next:(res)=>{
        this.savedFiles = res;
        console.log("Unortered files", this.savedFiles);
        this.getProductImageOrder();
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  /**
   * @todo Get Image order list
   * @todo Display images as per list order.
   */
   getProductImageOrder(): void {
    this.api.GET(`image-order/search/${this.newProductId}`).subscribe({
      next:(res)=>{
        console.log("Order length", res.length);
        if(res.length > 0) {
          const imgOrder = JSON.parse(res[0].order_list);
          let orderedImages: any[] = [];
          for (let x = 0; x < imgOrder.length; x++) {
            const id = imgOrder[x];
            const obj = this.savedFiles.find(x => x.id == id);
            orderedImages.push(obj);    
          }
          this.savedFiles = orderedImages;
        }
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.savedFiles, event.previousIndex, event.currentIndex);
    let arr = [];
    for (let index = 0; index < this.savedFiles.length; index++) {
      arr.push(this.savedFiles[index].id);
    }
    const data = JSON.stringify(arr);
    this.api.POST(`image-order/`, { product_id: this.newProductId, order_list: data }).subscribe({
      next:(res)=>{
        console.log(res);
      }, error:(res)=>{
        console.log(res);
      }
    });

  }

  updateFileType(fileId: number, fileTypeId: number) {

    console.log('fileType: ' + fileTypeId);
    console.log('fileId: ' + fileId);
    this.api.POST(`product-files/update-fileType/${fileId}`, { type_id: fileTypeId }).subscribe({
      next:(res)=>{
        console.log(res);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  filePath(p: string) {
    return p.substring(7);
  }

  checkSku(e: any) {
    
  }

  checkedItem (v: any) {
    const i = this.selectedCategories.indexOf(v);
    if(i < 0) {
      this.selectedCategories.push(v);
    } else {
      this.selectedCategories.splice(i, 1);
    }
    console.log(this.selectedCategories);
  }

}
