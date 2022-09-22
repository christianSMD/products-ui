import { HttpEventType, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { File } from 'src/app/interfaces/file';
import { Type } from 'src/app/interfaces/type';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Category } from 'src/app/interfaces/category';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { InfoService } from 'src/app/services/info/info.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';

@Component({
  selector: 'download-dialog',
  templateUrl: 'download.html',
})
export class DownloadDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DownloadDialog>,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.scss']
})
export class SingleProductComponent implements OnInit {

  typesList: Type[] = [];
  typesLoader = false;
  productsLoader = false;
  id: string;
  sku: string
  productSku: string;
  product: any;
  files: any[] = []
  savedFiles: any[] = [];
  filePermissions: any[] = [];
  parent: string;
  productForm !: FormGroup;
  productFormAttributes !: FormGroup;
  productFormPackaging !: FormGroup;
  productName: string;
  isInDev: number;
  isEol: number;
  isActivr: number;
  focusType: string = '47';
  //For uploading
  messages: string[] = [];
  uploadProgress = 0;
  uploadProgressBar = 'width:0%;height:20px';
  loading: boolean = false;
  packaging: any;
  attrCount: number = 0;
  productCategories: Category[] = [];
  attributesFields: any[] = [];
  saveAttrBtnText = "Save Changes";
  disableSaveAttrBtn = false;
  productAttributes: any[] = [];
  ft = '';
  detailProgress: number = 0;
  progressColor: ThemePalette = 'primary';
  progressMode: ProgressSpinnerMode = 'determinate';
  storageUrl: string;
  editRole: boolean = false;
  uploadRole: boolean = false;
  viewAllProductsRole: boolean = false;
  verified: boolean = false;

  categoriesList: Category[] = [];
  selectedCategories: any[] = [];
  categoriesLoader = false;
  catFromProductTbl: any[] = [];
  attrKey: string;

  requiredField = false;

  shoutoutsForm: FormGroup;
  regionsForm: FormGroup;
  productRegionList: any[] = [];

  pdsAttributes: any[] = [];
  loadingPdsAttributes: boolean = true;

  constructor(public navbar: NavbarService,
    public treeNav: TreeService,
    private api: ApiService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute, 
    private router: Router,
    private formBuilder : FormBuilder,
    private info: InfoService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {

    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });

    this.editRole = this.info.role(56);
    this.uploadRole = this.info.role(57);
    this.viewAllProductsRole = this.info.role(68);
    this.storageUrl = this.api.getStorageUrl();
    this.navbar.show();
    this.treeNav.hide();
    this.route.params.subscribe((params: Params) => {
      this.sku = params['sku'];
      this.productSku = this.sku;
    });
    this.getDetails(this.sku);
    this.getAllTypes();
    this.getAllCategories();

    this.productForm = this.formBuilder.group({
      sku : ['0', Validators.required],
      name : ['0', Validators.required],
      brand_type_id : ['0', Validators.required],
      description : ['0', Validators.required],
      short_description : ['0', Validators.required],
      parent_id : ['0'],
      is_eol : [0, Validators.required],
      is_in_development : [0, Validators.required],
      is_active: [0, Validators.required],
      verified: [0, Validators.required],
      family_grouping : ['']
    });

    this.productFormPackaging = this.formBuilder.group({
      weight : [''],
      length : [''],
      width  : [''],
      height : [''],
      packaging_type_id : ['', Validators.required],
      product_id: ['']
    });
    
    this.productFormAttributes = this.formBuilder.group({
      attributes: this.formBuilder.array([])
    });

    this.shoutoutsForm = this.formBuilder.group({
      shoutouts: this.formBuilder.array([])
    });

    this.regionsForm = this.formBuilder.group({
      regions: this.formBuilder.array([])
    });

    if(this.sku == 'products' || this.sku == 'product') {
      this.router.navigate(['/']);
    }

    if(this.sku == 'users' || this.sku == 'user') {
      this.router.navigate(['/users/manage']);
    }
  }

  get attributes() {
    return this.productFormAttributes.get('attributes') as FormArray
  }

  get shoutouts() {
    return this.shoutoutsForm.get('shoutouts') as FormArray
  }

  get regions() {
    return this.regionsForm.get('regions') as FormArray
  }

  getAllCategories() {
    this.categoriesLoader = true;
    this.api.GET('categories').subscribe({
      next:(res)=>{
        console.log("Categories List: ", res);
        this.categoriesLoader = false;
        this.categoriesList = res;
      }, error:(res)=>{
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getDetails(sku: string): void {
    
    this.productsLoader = true;
    this.api.GET(`products/${sku}`).subscribe({
      next:(res)=>{
        this.productsLoader = false;
        if (res.length > 0) {
          this.detailProgress++;
          this.product = res[0];
          this.productName = this.product.name;
          this.id = this.product.id;

          this.getFiles();
          this.getProductCategories();
          this.getPackaging(this.id);
          this.getPdsAttributes(sku);
          this.getProductRegions(this.id);

          this.productForm = this.formBuilder.group({
            sku : [{value: this.product.sku, disabled: true}, Validators.required],
            name : [this.product.name, Validators.required],
            brand_type_id : [this.product.brand_type_id, Validators.required],
            description : [this.product.description, Validators.required],
            short_description : [this.product.short_description, Validators.required],
            is_in_development: [this.product.is_in_development],
            is_active: [this.product.is_active],
            is_eol: [this.product.is_eol],
            verified: [this.product.verified],
            family_grouping: [this.product.family_grouping],
          });

          const shoutouts = JSON.parse(this.product.shoutout);
          for (let y = 0; y < shoutouts.length; y++) {
            const shouts = this.formBuilder.group({
              shoutoutField: [shoutouts[y], Validators.required],
            })
            this.shoutouts.push(shouts);
          }
          // Attributes from productsTable
          let obj: any[] = [];
          obj = JSON.parse(this.product.attributes);
          if (obj !== null) {
            for (let index = 0; index < obj.length; index++) {
              const keys = Object.keys(obj[index]);
              const key = keys[0];
              const val = obj[index][key];
              const attrs = this.formBuilder.group({
                attrName: [key, Validators.required],
                attrValue: [val, Validators.required]
              })
              this.attributes.push(attrs);
            }
          }
          
        }
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        this.productsLoader = false;
      }
    });
  }

  /**
   * @todo Get categories asigned to product.
   * @todo Loop each category for attributes.
   */
   getProductCategories(): void {
    console.log('Product Categories');
    this.api.GET(`product-categories/search/${this.id}`).subscribe({
      next:(res)=>{
        this.productCategories = res;
        console.log("Product Categories: ", res);
        if (res.length > 0) {
          this.detailProgress++;
          // Loop Categories linked to product
          for (let x = 0; x < res.length; x++) {
            let attributes = JSON.parse(res[x].attributes);
            if(res[x].parent != 0) {
              let parent = this.categoriesList.find(i => i.id == res[x].parent);
              // for (let index = 0; index < parent?.attributes.length; index++) {
              //   attributes.push(parent?.attributes[index]);
              // }
              console.log(attributes);
            } else {
              console.log('here..');
            }
            
            // Loop attributes on each category
            if (attributes !== null) {
              for (let y = 0; y < attributes.length; y++) {
                const i = this.attributes.value.findIndex((object: any) => object.attrName === attributes[y]);
                if (i === -1) {
                  const attrs = this.formBuilder.group({
                    attrName: [attributes[y], Validators.required],
                    attrValue: ['0', Validators.required]
                  })
                  this.attributes.push(attrs);
                  this.attrCount = this.attrCount + 1;
                }
              }
            }
            
          } 
        }
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  getAllTypes(): void {
    this.api.GET('types').subscribe({
      next:(res)=>{
        this.typesLoader = false;
        this.typesList = res;
      }, error:(res)=>{
        this.typesLoader = false;
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getPackaging(id: string): void {
    this.api.GET(`packaging/search/${id}`).subscribe({
      next:(res)=>{
        if (res.length > 0) {
          this.detailProgress++;
          this.packaging = res;
          this.productFormPackaging = this.formBuilder.group({   
            length : [res[0].height],
            width : [res[0].width],
            height : [res[0].height],
            weight : [res[0].weight],
            packaging_type_id : [res[0].packaging_type_id],
            product_id: [this.id]
          });
        }
        
      }, error:(res)=>{
        this.typesLoader = false;
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  onChange(event: any): void {
    this.files = event.target.files;
    for(let x = 0; x < this.files.length; x ++) {
      if(this.files[x].size > 2000000) {
        const msg = "🚫 " + this.files[x].name + " is too large!";
        this.messages.push(msg);
      }
    }
  }

  onUpload(fileTypeId: string, type: String): void {
    this.loading = !this.loading;

    console.log("This is a function that uplaods files")

    if (this.files.length > 0) {
      for(let x = 0; x < this.files.length; x ++) {
        this.api.upload('uploading-file-api', {
          file: this.files[x],
          name: this.files[x].name,
          product_id: this.product.id,
          product_sku: this.product.sku,
          type_id: fileTypeId,
          type: type,
          permissions: this.filePermissions,
        }).subscribe(
          (event: any) => {
            if (typeof (event) === 'object') {
              this.loading = false; 
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressBar = `width:${this.uploadProgress}%;height:10px`;
            } else if (event instanceof HttpResponse) {
              const msg = this.files[x].name + ' ploaded the file successfully.';
              this.info.activity('Added new product', this.product.id);
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

  uploadDocument(fileTypeId: string, type: String): void {
    this.loading = !this.loading;
    if (this.files.length > 0) {
      for(let x = 0; x < this.files.length; x ++) {
        this.api.upload('upload-document', {
          file: this.files[x],
          name: this.files[x].name,
          product_id: this.product.id,
          product_sku: this.product.sku,
          type_id: fileTypeId,
          type: type,
          permissions: this.filePermissions,
        }).subscribe(
          (event: any) => {
            if (typeof (event) === 'object') {
              this.loading = false; 
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressBar = `width:${this.uploadProgress}%;height:10px`;
            } else if (event instanceof HttpResponse) {
              const msg = this.files[x].name + ' ploaded the file successfully.';
              this.info.activity('Added new product', this.product.id);
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

  openSnackBar(message: string, action: string): void {
    this._snackBar.open(message, action, {
      duration: 4000
    });
  }
  
  getFiles(): void {
    console.log('getting files for: ' + this.id);
    this.api.GET(`product-files/${this.id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          this.detailProgress++;
          this.savedFiles = res;
          console.log('Saved files: ', res);
          this.getProductImageOrder();
        }
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
    this.api.GET(`image-order/search/${this.id}`).subscribe({
      next:(res)=>{
        if (res.length > 0) {
          const imgOrder = JSON.parse(res[0].order_list);
          let orderedImages: any[] = [];
          for (let x = 0; x < imgOrder.length; x++) {
            const id = imgOrder[x];
            const obj = this.savedFiles.find(x => x.id == id);
            orderedImages.push(obj);    
          }
          this.savedFiles = orderedImages;
        }
        this.savedFiles = this.savedFiles;
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  /**
   * @todo Get Image order list
   * @todo Display Prodict regions.
   */
   getProductRegions(id: string): void {
    console.log('getting regions');
    this.api.GET(`product-regions/${id}`).subscribe({
      next:(res)=>{
        console.log(res);
        this.productRegionList = res;
        if (res !== null) {
          for (let index = 0; index < res.length; index++) {
            const regs = this.formBuilder.group({
              regionField: [ res[index].region_id, Validators.required],
            })
            this.regions.push(regs);
          }
        }

      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  updateFileType(fileId: number, fileTypeId: number): void {
    this.api.POST(`product-files/update-fileType/${fileId}`, { type_id: fileTypeId }).subscribe({
      next:(res)=>{
        this.info.activity('Updated file type', this.product.id);
        this.getFiles();
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  setFocusType(event: any): void {
    this.focusType = event.target.value;
  }
  
  updateProduct(): void {
    this.api.POST(`products/update/${this.id}`, this.productForm.value).subscribe({
      next:(res)=>{
        this.info.activity('Updated product', this.product.id);
        this.openSnackBar('Product Updated 😃', 'Okay');
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  updatePackaging(): void {
    this.productFormPackaging.patchValue({
      product_id: this.id,
    });
    this.api.POST(`packaging/update/${this.id}`, this.productFormPackaging.value).subscribe({
      next:(res)=>{
        this.info.activity('Updated product packaging details', this.product.id);
        this.openSnackBar('Packaging Saved 😃', 'Okay');
        this.getPackaging(this.id);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  updateShoutout(): void {
    const shoutouts = this.shoutoutsForm.value.shoutouts;
    const l = shoutouts.length;
    let shoutoutArray: string[] = [];
    console.log(shoutouts);
    console.log(l);
    for (let index = 0; index < l; index++) {
      shoutoutArray.push(this.shoutoutsForm.value.shoutouts[index].shoutoutField)
    }
    this.api.POST(`products/update-shoutout/${this.id}`, shoutoutArray).subscribe({
      next:(res)=>{
        console.log(res);
        this.info.activity('Updated product shoutout', this.product.id);
        this.openSnackBar('Product Updated 😃', 'Okay');
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  updateRegion() {
    for (let index = 0; index < this.regionsForm.value.regions.length; index++) {
      this.api.POST(`product-regions`, { 
        product_id: this.id,
        region_id: this.regionsForm.value.regions[index].regionField 
      }).subscribe({
        next:(res)=>{
          console.log(res);
          this.getProductRegions(this.id,);
          this.openSnackBar('Region Updated 😃', 'Okay');
        }, error:(res)=>{
          console.log(res);
        }
      });
    }
  }

  filePath(p: string) {
    return p.substring(7);
  }

  returnTypeName(id: any) {
    id=id-1;
    return this.typesList[id].name;
  }

  returnTypeGroup(id: any) {
    id=id-1;
    return this.typesList[id].grouping;
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.savedFiles, event.previousIndex, event.currentIndex);
    let arr = [];
    for (let index = 0; index < this.savedFiles.length; index++) {
      arr.push(this.savedFiles[index].id);
    }
    const data = JSON.stringify(arr);
    this.api.POST(`image-order/`, { product_id: this.id, order_list: data }).subscribe({
      next:(res)=>{
        console.log(res);
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  /**
   * @description Add or remove categorie's attributes
   * @param action - Can be 'New' or 'Update' 
   */
   updateAttributes(): void {
    this.disableSaveAttrBtn = true;
    this.saveAttrBtnText = "Saving...";
    let formObj = this.productFormAttributes.getRawValue();
    let finalObj: any[] = [];
    let finalArray: any[] = [];
    for (let index = 0; index < formObj.attributes.length; index++) {
      this.attrKey = finalObj[formObj.attributes[index].attrName];
      finalObj[formObj.attributes[index].attrName] = formObj.attributes[index].attrValue;
      this.api.POST(`products/update-attributes/${this.id}`, [{
        key : formObj.attributes[index].attrValue
      }]).subscribe({
        next:(res)=> {
          console.log(res);
          this.saveAttrBtnText = "Save Changes";
          this.openSnackBar('Attributes Saved', 'Okay');
          this.info.activity('Updated product attributes', this.product.id);
        }, error:(res)=> {
          this.saveAttrBtnText = "Failed, try again.";
          this.openSnackBar(res.message, 'Okay');
        }
      });
    }
  }

  deleteFile(id: number): void {
    this.api.GET(`files/delete/${this.id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          console.log("delete: ", res);
        }
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  hideFile(id: number): void {
    this.api.GET(`files/delete/${this.id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          console.log("delete: ", res);
          console.log('This is for hiding the file or image from the view on the ui');
        }
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  progressPercentage() {
    const p = (this.detailProgress / 4) * 100;
    if (p > 100) {
      return 100;
    }
    return p;
  }

  download(f: string, id: number, file: File): void {
    let path = file.path;
    this.api.POST('download-file-api', {
      product_id: this.product.id,
      product_sku: this.product.sku,
      original_type_id: file.type_id,
      original_path: path.replace("public/", "storage/"),
      new_type_id: id
    }).subscribe({
      next:(res)=> {
        this.openDialog(res[0].path, this.storageUrl);
      }, error:(res)=> {
        console.log(res);
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  forceDownload(url: string, fileName: string) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", this.storageUrl + url, true);
    xhr.responseType = "blob";
    xhr.onload = function(){
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
  }

  openDialog(link: string, storage: string): void {
    const dialogRef = this.dialog.open(DownloadDialog, {
      width: '250px',
      data: {
        downloadLink: link.replace("public/", ""),
        storageUrl: storage,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  addNewAttribute(): void {
    const attrs = this.formBuilder.group({
      attrName: [],
      attrValue: []
    })
    this.attributes.push(attrs);
    this.attrCount = this.attrCount + 1;
  }

  removeNewAttribute(i: number): void {
    this.attributes.removeAt(i);
    this.attrCount = this.attrCount - 1;
  }

  addShoutout(): void {
    const shouts = this.formBuilder.group({
      shoutoutField: [],
    })
    console.log('Is shoutouts an array? ', Array.isArray(this.shoutouts))
    this.shoutouts.push(shouts);
  }

  removeShoutout(i: number): void {
    this.shoutouts.removeAt(i);
    this.shoutoutsForm.markAsDirty();
  }

  addRegion(): void {
    const regs = this.formBuilder.group({
      regionField: [],
    })
    this.regions.push(regs);
  }

  removeRegion(i: number): void {
    this.regions.removeAt(i);
    this.regionsForm.markAsDirty();
  }

  checkCategories (c: string) {
    // Check categories on the UI that are available on the Products Categories List this.productCategories
    const obj = this.catFromProductTbl.find(x => x.name == c);
    for (let index = 0; index < this.productCategories.length; index++) {
      if(c == this.productCategories[index].name) {
        return true;
      }
    }
    return false;
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

  saveCategories() {
    const vals = this.selectedCategories;
    if (vals.length > 0) {
      for(let i=0; i < vals.length; i++) {
        this.api.POST('product-categories', {
          product_id: this.id,
          category_id: vals[i]
        }).subscribe({
          next:(res)=>{
            this.getProductCategories();
            this.openSnackBar('Category Added 😃', 'Okay');
          }, error:(res)=>{
            this.openSnackBar('😢 ' + res.message, 'Okay');
          }
        })
      }
    }
    this.openSnackBar('Please choose categories', 'Okay');
  }

  setPermission(permissions: string[]) {
    console.log(permissions);
    return true;
  }

  getPdsAttributes(sku: string): void {
    this.api.GET(`pds-attributes/${sku}`).subscribe({
      next:(res)=>{
        console.log("PDS Attributes", res);
        this.pdsAttributes = res;
        this.loadingPdsAttributes = false;
      }, error:(res)=> {
        console.log(res);
        this.loadingPdsAttributes = false;
      }
    });
  }
}
