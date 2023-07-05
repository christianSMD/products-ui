import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/interfaces/product';
import { MatTableDataSource } from '@angular/material/table';
import { Category } from 'src/app/interfaces/category';
import { Type } from 'src/app/interfaces/type';
import { MatListOption } from '@angular/material/list'
import { map, Observable, startWith } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { InfoService } from 'src/app/services/info/info.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';

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
  skuPattern = "^[a-zA-Z0-9_()-]{4,20}$";
  invalidSku = true
  newProductType: any; // New Product or new Linked/Bundle products
  autocompleteControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  newPamphlet: any[] = [];
  newPamphletSKUs: any[] = [];
  SKUsLoader: boolean = true

  similarProduct: any;
  
  constructor(
    public navbar: NavbarService,
    private api: ApiService,
    private formBuilder : FormBuilder,
    private _snackBar: MatSnackBar,
    public info: InfoService,
    private route: ActivatedRoute,
    private router: Router,
    private lookup: LookupService,
    private products: ProductsService
  ) {}

  ngOnInit(): void {
    this.info.auth();
    this.attrCount = 0;
    this.storageUrl = this.api.getStorageUrl();
    this.navbar.show();
    this.getAllTypes();
    this.getAllCategories();
    this.entireProducts();

    // Auto complete SKUs
    this.filteredOptions = this.autocompleteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    
    this.route.paramMap.subscribe(paramMap => {
      this.newProductType = paramMap.get('type');
    });

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
      is_active: [0, Validators.required],
      type: [this.newProductType]
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

  entireProducts() {
    this.productsList = this.products.getProducts();
    this.options = this.productsList.map((x: Product) => x.sku);
  }

  /**
   * 
   * @param value Input from the searchbox
   * @todo This functions filters SKUs from an array of over 20k products
   * @todo The filter will only trigger when the input string has more than 4 chars
   * @returns Filtered array
   */
  private _filter(value: string): string[] {
    let x: string[]= [];
    if(value.length > 4){
      const filterValue = value.toLowerCase();
      x = this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
    return x;
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
    this.categoriesList = this.products.getCategories();
  }

  getAllTypes() {
    this.typesList = this.lookup.getTypes();
    //this.lookup.checkTypes(this.typesList);
  }

  saveProduct() {
    this.api.POST('products', this.newProductForm.value).subscribe({
      next:(res) => {
        this.newProductId = res.id;
        this.newProductSKU = res.sku;
        this.newProductName = res.name;
        this.newProductFormPackaging.patchValue({
          product_id: res.id,
        });
        this.info.activity(`${this.info.getUserName()} added a new product`, this.newProductId);
        this.openSnackBar(res.name + ' Added 😃', 'Okay');
        //this.nextTab();
        this.router.navigate([res.sku]);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  saveBundleProduct(relationship: string) {
    console.log(this.newProductForm.value);
    //Still need to add items on the images object
    this.api.POST('products-pamphlet', this.newProductForm.value).subscribe({
      next:(res) => {
        this.info.activity('Created new pamphlet', 0);
        this.openSnackBar(res.name + ' Created 😃', 'Okay');
        // Now add linked products
        for (let index = 0; index < this.newPamphlet.length; index++) {
          this.api.POST('link-products', {
            parent_id: res.id,
            child_id: this.newPamphlet[index],
            relationship: relationship
          }).subscribe({
            next:(res) => {
              console.log(res);
            }, error:(res)=>{
              this.openSnackBar('😢 ' + res.message, 'Okay');
            }
          });
        }
        this.router.navigate([res.sku]);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  addToBundle (e: any) {
    // get id for sku
    const product = this.productsList.find((p: any) => p.sku == e.option.value);
    //const id = product?.product_id;
    const id = product?.id;
    console.log('Product: ', product);
    this.newPamphlet.push(id);
    this.newPamphletSKUs.push(e.option.value);
    this.autocompleteControl.reset();
  }

  removeFromBundle (sku: string) {
    const product = this.productsList.find((p: any) => p.sku == sku);
    const id = product?.id;
    const x = this.newPamphlet.indexOf(id);
    const y = this.newPamphletSKUs.indexOf(sku);
    if (x > -1) { 
      this.newPamphlet.splice(x, 1);
    }
    if (y > -1) { 
      this.newPamphletSKUs.splice(y, 1);
    }
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
      if(this.files[x].size > 9000000) {
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
              this.info.activity(`Added ${this.files.length} files`, this.newProductId);
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
        for (let x = 0; x < res.length; x++) {
          let attributes = JSON.parse(res[x].attributes);
          this.getParents(res[x].parent);
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
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  getParents(catId: number): void {
    this.api.GET(`categories/get-parents/${catId}`).subscribe({
      next:(res)=>{
        console.log('From parents', res);
        for (let x = 0; x < res.length; x++) {
          let attributes = JSON.parse(res[x].attributes);
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
    this.api.POST(`image-order`, { product_id: this.newProductId, order_list: data }).subscribe({
      next:(res)=>{
        console.log(res);
        this.info.activity('Rearranged images', this.newProductId);
      }, error:(res)=>{
        console.log(res);
      }
    });

  }

  updateFileType(fileId: number, fileTypeId: number) {
    this.api.POST(`product-files/update-fileType/${fileId}`, { type_id: fileTypeId }).subscribe({
      next:(res)=>{
        console.log(res);
        this.info.activity('Updated file type', this.newProductId);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  filePath(p: string) {
    return p.substring(7);
  }

  checkSku(x: any) {
    let status  = this.newProductForm.get('sku')?.status;
    this.invalidSku = (status?.toLocaleLowerCase() == 'invalid') ? true : false;
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

  checkProductName(e: any) {
    this.similarProduct = this.products.searchProductByName(e.target.value);
  }
}
