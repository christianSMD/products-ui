import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { File } from 'src/app/interfaces/file';
import { Type } from 'src/app/interfaces/type';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Category } from 'src/app/interfaces/category';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { InfoService } from 'src/app/services/info/info.service';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { HttpClient } from '@angular/common/http';
import jsPDF from "jspdf";
import { Product } from 'src/app/interfaces/product';
import { map, Observable, startWith } from 'rxjs';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';
import pptxgen from "pptxgenjs";
import { User } from 'src/app/interfaces/user';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { CategoriesComponent } from '../categories/categories.component';
import { DomSanitizer } from '@angular/platform-browser';

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
  mediaFiles: any[] = [];
  imageServerFiles: any[] = [];
  documentFiles: any[] = [];
  imageServerDocumentFiles: any[] = []; // Instruction Manuals already uploaded on the image server
  mediaFilesForLinkedProducts: any[] = [];
  linkedImagesLoader: boolean = false;
  filePermissions: any[] = [];
  parent: string;
  productForm !: FormGroup;
  productFormAttributes !: FormGroup;
  productFormAttributesBulk !: FormGroup;
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
  packagingCount: number = 0;
  packagingLoading: boolean = false;
  attrCount: number = 0;
  productCategories: Category[] = [];
  attributesFields: any[] = [];
  saveAttrBtnText = "Save Changes";
  disableSaveAttrBtn = false;
  productAttributes: any[] = [];
  ft = '';
  detailProgress: number = 0;
  progressMode: ProgressSpinnerMode = 'determinate';
  storageUrl: string;
  editRole: boolean = false;
  uploadRole: boolean = false;
  viewAllProductsRole: boolean = false;
  verified: boolean = false;
  isVerified: boolean = false;
  categoriesList: Category[] = [];
  primaryCategoriesList: Category[] = [];
  selectedCategories: any[] = [];
  categoriesLoader = false;
  catFromProductTbl: any[] = [];
  attrKey: string;
  requiredField = false;
  regionsForm: FormGroup;
  productRegionList: any[] = [];
  pdsAttributes: any[] = [];
  loadingPdsAttributes: boolean = true;
  expiry_date: string;
  today = new Date();
  onImageServer = true;

  //Linked products
  isBundle: boolean = false;
  linkedProducts: any = [];
  linkedProductsIDs: any = [];
  linkedProductSKUs: any = [];
  bundleLoader: boolean = true;
  autocompleteControl = new FormControl('');
  autocompleteControl1 = new FormControl('');
  productsList: Product[] = [];
  newPamphlet: any[] = [];
  newPamphletSKUs: any[] = [];
  SKUsLoader: boolean = true
  options: string[] = []; // SKUs
  filteredOptions: Observable<string[]>;
  filteredSeries: Observable<string[]>;
  newProductForm !: FormGroup;

  // Design
  shoutoutsForm: FormGroup;
  featuresAndBenefitsForm: FormGroup;
  extendedFabsForm: FormGroup;
  packageContentsForm: FormGroup;
  designLoader: boolean = false;
  
  parentChildCategories: any[] = [];
  audits: any[] = [];
  series: any[] = [];
  newSeries: string;
  productSeries: any;
  productBrand: any;
  productManager: string = "";
  productManagerId: any = 0;
  brandManager: string = "";
  users: User[] = [];
  loadpProductManager: boolean = true;
  adminRole: boolean = false;
  productManagerRole: boolean = false;
  newSeriesType: string = "";
  focusImg: string;
  descedantsCategories: Category[] = [];
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  tierLabels: any = [];
  tierLength: number;
  canVerify: boolean = false;
  isEcommerceFile: boolean = false;
  modifyingCategories: boolean = false;
  switchImageMain = 0;
  inTheBox: any[] = [];
  featuresAndBenefits: any[] = [];
  shoutOuts: any[] = [];
  extendedFabs: any[] = [];
  productBarcode: string;
  imagesAreSorted: boolean = false;
  packagingLoader: boolean = false;
  showInfoBar: boolean = true;
  mainTabsCls: string = "col-md-11 col-lg-9";
  infoBarCls: string = "col-md-1 col-lg-3";
  loadingInfo: string = "Preparing...";
  selectedFiles: any[] = [];
  historyTable: boolean = false;

  socialLinks: any[] = [];
  socialLink: string;
  videos: any[] = [];
  productQr: string;
  findCategory: string;
  checkboxLoader: boolean;
  canManageThisProduct = false;

  @ViewChild('pdfContent') content:ElementRef;  

  constructor(public navbar: NavbarService,
    public treeNav: TreeService,
    private api: ApiService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute, 
    private router: Router,
    private formBuilder : FormBuilder,
    private info: InfoService,
    public dialog: MatDialog,
    private lookup: LookupService,
    private http: HttpClient,
    private products: ProductsService,
    private _sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.canVerify = false;
    this.info.auth();
    this.info.setLoadingInfo('Preparing...', 'info');
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
    this.getAllTypes();
    localStorage.setItem('route', this.router.url);
    this.detailProgress = 0;
    this.editRole = this.info.role(56);
    this.uploadRole = this.info.role(57);
    this.productManagerRole = this.info.role(88); // Or product developer
    this.adminRole = this.info.role(90);
    this.viewAllProductsRole = this.info.role(68);
    this.storageUrl = this.api.getStorageUrl();
    this.navbar.show();
    this.treeNav.hide();
    this.route.params.subscribe((params: Params) => {
      this.sku = params['sku'];
      this.productSku = this.sku;
    });
    this.getDetails(this.sku);
    this.getAllCategories();
    this.entireProducts(); // Need to investigate this

    this.productQr = "https://products.smdtechnologies.com/" + this.sku;

    this.productForm = this.formBuilder.group({
      id: [''],
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
      requires_icasa: [0, Validators.required],
      family_grouping : ['']
    });

    this.productFormPackaging = this.formBuilder.group({
      weight : [''],
      length : [''],
      width  : [''],
      height : [''],
      packaging_type_id : ['', Validators.required],
      product_id: [this.id],
      barcode: [''],
    });

    this.productFormAttributesBulk = this.formBuilder.group({
      attrKey : [''],
      attrValue : [''],
    });
    
    this.productFormAttributes = this.formBuilder.group({
      attributes: this.formBuilder.array([])
    });

    this.regionsForm = this.formBuilder.group({
      regions: this.formBuilder.array([])
    });

    this.shoutoutsForm = this.formBuilder.group({
      shoutouts: this.formBuilder.array([])
    });

    this.featuresAndBenefitsForm = this.formBuilder.group({
      features: this.formBuilder.array([])
    });

    this.extendedFabsForm = this.formBuilder.group({
      fabs: this.formBuilder.array([])
    });

    this.packageContentsForm = this.formBuilder.group({
      contents: this.formBuilder.array([])
    });

    if(this.sku == 'products' || this.sku == 'product') {
      this.router.navigate(['/']);
    }

    if(this.sku == 'users' || this.sku == 'user') {
      this.router.navigate(['/users/manage']);
    }

    // Auto complete SKUs
    this.filteredOptions = this.autocompleteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    // Auto complete Series
    this.filteredSeries = this.autocompleteControl1.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSeries(value || '')),
    );

    if (this.productManagerRole) {
      this.editRole = true;
    }
  }

  get attributes() {
    return this.productFormAttributes.get('attributes') as FormArray
  }

  get regions() {
    return this.regionsForm.get('regions') as FormArray
  }

  get shoutouts() {
    return this.shoutoutsForm.get('shoutouts') as FormArray
  }

  get features() {
    return this.featuresAndBenefitsForm.get('features') as FormArray
  }

  get fabs() {
    return this.extendedFabsForm.get('fabs') as FormArray
  }

  get contents() {
    return this.packageContentsForm.get('contents') as FormArray
  }

  getAllTypes(): void {
    this.typesList = this.lookup.getTypes();
  }

  getDetails(sku: string): void {
    this.productsLoader = true;
    this.info.setLoadingInfo('Loading product details...', 'info');
    this.api.GET(`products/${sku}`).subscribe({
      next:(res)=>{
        this.productsLoader = false;
        if (res.length > 0) {
          this.detailProgress++;
          this.product = res[0];
          this.productName = this.product.name;
          this.id = this.product.id;
          const seriesType = this.typesList.find((x: Type) => x.id == this.product.family_grouping);
          this.productSeries = seriesType?.name;
          const productBrand = this.typesList.find((x: Type) => x.id == this.product.brand_type_id);
          this.productBrand  = productBrand?.name;
          this.productManagerId = this.product.product_manager;
          if(res[0].verified == 1) {
            this.info.setLoadingInfo('Product verified', 'info');
            this.isVerified = true;
          }
          if (res[0].type != 'Simple') {
            this.isBundle = true;
            this.getLinkedProducts();
          }
          this.canManage(this.id);
          this.getUsers();
          this.audit(this.id);
          this.getProductAttributes(this.id);
          this.getPackaging(this.id);
          this.getPdsAttributes(sku);
          this.getProductRegions(this.id);
          this.getDesigns(this.id);
          this.media();
          this.documents();
          this.getSocialLinks(this.id);
          this.getProductCategories(this.id);
          this.imageserver(sku);
          this.productForm = this.formBuilder.group({
            id: [{value: this.product.id, disabled: true}],
            sku : [{value: this.product.sku, disabled: true}, Validators.required],
            name : [this.product.name, Validators.required],
            brand_type_id : [this.product.brand_type_id, Validators.required],
            description : [this.product.description, Validators.required],
            short_description : [this.product.short_description, Validators.required],
            is_in_development: [this.product.is_in_development],
            is_active: [this.product.is_active],
            is_eol: [this.product.is_eol],
            verified: [this.product.verified],
            requires_icasa: [this.product.requires_icasa],
            family_grouping: [this.product.family_grouping],
          });

          this.newProductForm = this.formBuilder.group({
            sku : ['', [Validators.required]]
          });

          // Attributes from productsTable
          let obj: any[] = [];
          obj = JSON.parse(this.product.attributes);
          if (obj !== null) {
            for (let index = 0; index < obj.length; index++) {
              const keys = Object.keys(obj[index]);
              const key = keys[0];
              const val = obj[index][key];
              this.info.setLoadingInfo('Loading attributes: ' + obj[index][key] + '...', 'success');
              const attrs = this.formBuilder.group({
                attrName: [key, Validators.required],
                attrValue: [val, Validators.required]
              })
              this.attributes.push(attrs);
            }
          }
          this.info.setLoadingInfo('Product loaded', 'success');
        }
      }, error:(res)=>{
        this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'success');
        this.productsLoader = false;
      }
    });
  }

  getAllCategories() {
    this.info.setLoadingInfo('Loading categories...', 'info');
    this.api.GET('categories').subscribe({
      next:(res)=>{
        this.products.setCategories(res);
        this.categoriesList = this.products.getCategories();
        this.primaryCategoriesList = res.filter((c: Category) => c.parent == '0');
        this.info.setLoadingInfo('Categories loaded', 'success');
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  /**
   * @todo Get categories asigned to product.
   * @todo Loop each category for attributes.
   */
   getProductCategories(id: string): void {
    this.info.setLoadingInfo('Loading product categories...', 'info');
    this.api.GET(`product-categories/search/${id}`).subscribe({
      next:(res)=>{
        this.productCategories = res;   
        this.info.setLoadingInfo('', 'success');   
        this.progressPercentage();
      }, error:(res)=> {
        console.log(res);
      }
    });
  }

  getPackaging(id: string): void {
    this.packagingCount = 0;
    this.packagingLoading = true;
    this.info.setLoadingInfo('Loading packaging details...', 'info');
    this.api.GET(`packaging/search/${id}`).subscribe({
      next:(res)=>{
        if (res.length > 0) {
          this.detailProgress++;
          this.packaging = res;
          this.packagingCount = this.packaging.length;
          this.productBarcode = res[0].barcode;
          this.info.setLoadingInfo(`Loading packaging: ${res[0].barcode}`, 'info');
          this.productFormPackaging = this.formBuilder.group({ 
            weight : [res[0].weight],  
            length : [res[0].length],
            width : [res[0].width],
            height : [res[0].height],
            packaging_type_id : [res[0].packaging_type_id],
            product_id: [this.id],
            barcode : [res[0].barcode]
          });
        }
        this.packagingLoading = false;
        this.info.setLoadingInfo('', 'success');
      }, error:(res)=>{
        this.info.errorHandler(res);
        this.info.setLoadingInfo('Could not load packaging...', 'warn');
        this.typesLoader = false;
        this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
      }
    });
  }

  getProductAttributes(id: string) {
    this.info.setLoadingInfo('Fetching attributes...', 'info');
    this.api.GET(`attributes/search-by-id/${id}`).subscribe({
      next:(res)=>{
        this.productAttributes = res;
        this.info.setLoadingInfo('Attributes loaded', 'success');
        console.log(res);
      }, error:(res)=>{
        console.log(res);
        this.info.setLoadingInfo('Could not load attributes', 'warn');
      }
    });
  }

  onChange(event: any): void {
    this.files = event.target.files;
    for(let x = 0; x < this.files.length; x ++) {
      if(this.files[x].size > 20000000) {
        const msg = "🚫 " + this.files[x].name + " is too large!";
        this.messages.push(msg);
      }
    }
  }

  onUpload(fileTypeId: string, type: String): void {
    this.loading = !this.loading;
    this.info.setLoadingInfo('Uploading media files...', 'info');
    if (this.files.length > 0) {
      for(let x = 0; x < this.files.length; x ++) {
        this.api.upload('upload-media', {
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
              this.info.setLoadingInfo(`${this.uploadProgress}% complete...`, 'info');
            } else if (event instanceof HttpResponse) {
              const msg = this.files[x].name + ' ploaded the file successfully.';
              this.info.activity('Media file uploaded', this.product.id);
              this.messages.push(msg);
              this.info.setLoadingInfo(msg, 'info');
            } 
            this.media();
          }, (err: any) => {
            this.info.errorHandler(err);
            this.uploadProgress = 0;
            const msg = '' + this.files[x].name + ' could not upload the file: ';
            this.messages.push(msg);
            this.info.setLoadingInfo(msg, 'warning');
          }
        );
      } 
    } else {
      this.openSnackBar('Please select files', 'Okay')
      this.info.setLoadingInfo('Uploadig complete.', 'info');
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
          expiry_date: this.expiry_date
        }).subscribe(
          (event: any) => {
            if (typeof (event) === 'object') {
              this.loading = false; 
            }
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressBar = `width:${this.uploadProgress}%;height:10px`;
              this.info.setLoadingInfo(`${this.uploadProgress}% complete...`, 'info');
            } else if (event instanceof HttpResponse) {
              const msg = this.files[x].name + ' ploaded the file successfully.';
              this.info.activity(`${this.files[x].name} uploaded`, this.product.id);
              this.messages.push(msg);
              this.info.setLoadingInfo(msg, 'info');
            } 
            this.documents();
          }, (err: any) => {
            this.info.errorHandler(err);
            this.uploadProgress = 0;
            const msg = '' + this.files[x].name + ' could not upload the file: ';
            this.messages.push(msg);
            this.info.setLoadingInfo(msg, 'warning');
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
  
  media(): void {
    this.info.setLoadingInfo('Loading media...', 'info');
    this.api.GET(`product-media-files/${this.id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          this.detailProgress++;
          this.mediaFiles = res;
          //this.getProductImageOrder();
        }
        this.info.setLoadingInfo('Media refreshed', 'success');
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
  }

  imageserver(productSku: string) {
    this.api.IMAGESERVERHIRES(productSku).subscribe({  
      next:(res)=>{   
        if(res.length > 0) {
          for (let index = 0; index < res.length; index++) {
            const filename: string = res[index].filename;
            // If file is an image:
            if (filename.endsWith(".png") || filename.endsWith(".jpg")) {
              this.imageServerFiles.push(filename);
            } else {
              // Push to documents
              this.imageServerDocumentFiles.push(filename);
            }
          }
        }
      }, error:(res)=> {
        console.log(res);
      }
    });   
  }

  documents(): void {
    this.info.setLoadingInfo('Loading documents...', 'info');
    this.api.GET(`product-document-files/${this.id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          this.detailProgress++;
          this.documentFiles = res;
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
  //  getProductImageOrder(): void {
  //   this.info.setLoadingInfo('Arranging images...', 'info');
  //   this.api.GET(`image-order/search/${this.id}`).subscribe({
  //     next:(res)=>{
  //       if (res.length > 0) {
  //         const imgOrder = JSON.parse(res[0].order_list);
  //         let orderedImages: any[] = [];
  //         for (let x = 0; x < imgOrder.length; x++) {
  //           const id = imgOrder[x];
  //           const obj = this.mediaFiles.find(x => x.id == id);
  //           orderedImages.push(obj);    
  //         }
  //         this.imagesAreSorted = true;
  //         this.mediaFiles = orderedImages;
  //       } else {
  //         this.imagesAreSorted = false;
  //       }
  //       this.mediaFiles = this.mediaFiles;
  //       this.info.setLoadingInfo('', 'success');
  //     }, error:(res)=> {
  //       this.info.errorHandler(res);
  //     }
  //   });
  // }

  /**
   * @todo Get Image order list
   * @todo Display Prodict regions.
   */
   getProductRegions(id: string): void {
    this.info.setLoadingInfo('Loading regions...', 'info');
    this.api.GET(`product-regions/${id}`).subscribe({
      next:(res)=>{
        this.productRegionList = res;
        if (res !== null) {
          for (let index = 0; index < res.length; index++) {
            const regs = this.formBuilder.group({
              regionField: [ res[index].region_id, Validators.required],
            })
            this.regions.push(regs);
          }
          this.info.setLoadingInfo('Regions loaded', 'success');
        }
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
  }

  updateFileType(fileId: number, fileTypeId: number): void {
    this.api.POST(`product-files/update-fileType/${fileId}`, { type_id: fileTypeId }).subscribe({
      next:(res)=>{
        console.log(res);
        this.info.activity('Updated file type', this.product.id);
        this.media();
        this.documents();
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
        this.progressPercentage();
        this.getDetails(this.sku);
        this.addNonExistingType();
        this.info.activity(`${this.info.getUserName()} Updated product general details`, this.product.id);
        this.openSnackBar('Product Updated 😃', 'Okay');
      }, error:(res)=>{
        this.info.errorHandler(res);
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  updatePackaging(): void {
    this.info.setLoadingInfo('Updating packaging...', 'info');
    this.packagingLoader = true;
    this.productFormPackaging.patchValue({
      product_id: this.id,
    });
    this.api.POST(`packaging`, this.productFormPackaging.value).subscribe({
      next:(res)=>{
        this.packagingLoader = false;
        this.info.activity(`${this.info.getUserName()} Updated product packaging details`, this.product.id);
        this.openSnackBar('Packaging Saved 😃', 'Okay');
        this.info.setLoadingInfo('Packaging updated...', 'success');
        this.getPackaging(this.id);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  deletePackaging(id: number): void {
    if(confirm("This packaging information will be removed")) {
      this.packagingLoader = true;
      this.info.setLoadingInfo('Deleting packaging info', 'info');
      this.api.GET(`packaging/delete/${id}`).subscribe({
        next:(res)=>{
          this.packagingLoader = false;
          this.info.activity(`${this.info.getUserName()} removed some packaing information`, this.product.id);
          this.openSnackBar('Packaging information deleted', 'Okay');
          this.getPackaging(this.id);
          this.info.setLoadingInfo('Packaging item removed', 'success');
        }, error:(res)=> {
          this.info.errorHandler(res);
        }
      });
    }
    
  }

  savePackagingChanges(id: number): void {
    this.packagingLoader = true;
    const length = document.getElementById("length" + id) as HTMLInputElement | null;
    const height = document.getElementById("height" + id) as HTMLInputElement | null;
    const width = document.getElementById("width" + id) as HTMLInputElement | null;
    const weight = document.getElementById("weight" + id) as HTMLInputElement | null;
    const barcode = document.getElementById("barcode" + id) as HTMLInputElement | null;
    this.info.setLoadingInfo('Updating packaging changes...', 'info');
    this.api.POST(`packaging/update-by-id/${id}`, {
      length: length?.value,
      height: height?.value,
      width: width?.value,
      weight: weight?.value,
      barcode: barcode?.value
    }).subscribe({
      next:(res)=>{
        this.packagingLoader = false;
        this.info.activity(`${this.info.getUserName()} Updated product packaging details`, this.product.id);
        this.openSnackBar('Packaging Saved 😃', 'Okay');
        this.info.setLoadingInfo('Packaging info saved...', 'success');
        this.getPackaging(this.id);
      }, error:(res)=>{
        this.openSnackBar('😢 ' + res.message, 'Okay');
        this.info.setLoadingInfo('Failed to save packaging changes...', 'danger');
      }
    });
  }

  updateRegion() {
    this.info.setLoadingInfo('Updating regions...', 'info');
    for (let index = 0; index < this.regionsForm.value.regions.length; index++) {
      this.api.POST(`products-regions`, { 
        product_id: this.id,
        region_id: this.regionsForm.value.regions[index].designField 
      }).subscribe({
        next:(res)=>{
          this.getProductRegions(this.id,);
          this.openSnackBar('Region Updated 😃', 'Okay');
          this.info.setLoadingInfo('Regions updated...', 'success');
        }, error:(res)=>{
          this.info.errorHandler(res);
          this.info.setLoadingInfo('Failed to update regions...', 'danger');
        }
      });
    }
  }

  updateSocials(channel: string) {
    this.openSnackBar(`Adding ${channel} link...`, '');
    if(this.socialLink.includes(channel)) {
      this.api.POST(`social`, { 
        product_id: this.id,
        link: this.socialLink
      }).subscribe({
        next:(res)=>{
          this.getSocialLinks(this.id);
          this.openSnackBar(`${channel} link added 😃`, 'Okay');
          this.info.setLoadingInfo(`${channel} link added 😃`, 'success');
          this.info.activity(`${this.info.getUserName()} added ${channel} link`, this.product.id);
          this.socialLink = "";
        }, error:(res)=>{
          this.info.errorHandler(res);
          this.openSnackBar(`Adding ${channel} failed!`, 'Okay');
          this.info.setLoadingInfo(`Adding ${channel} failed!`, 'danger');
        }
      });

    } else {
      this.openSnackBar(`Please make sure this is a valid ${channel} link`, 'Okay');
    }
    
  }

  getSocialLinks(id: string) {
    this.info.setLoadingInfo('Loading external links...', 'info');
      this.api.GET(`social/${id}`).subscribe({
        next:(res)=>{
          this.socialLinks = res;
          for (let x = 0; x < this.socialLinks.length; x++) {
            this.videos.push(this._sanitizer.bypassSecurityTrustResourceUrl(res[x].link));
          }
        }, error:(res)=> {
          this.info.errorHandler(res);
        }
      });
  }

  deleteSocial(id: number, link: string) {
    if(confirm("This link will be deleted")){
      this.openSnackBar(`Deleting link... `, '');
      this.api.GET(`delete-social/${id}`).subscribe({
        next:(res)=>{
          this.getSocialLinks(this.id);
          this.openSnackBar(`Link deleted`, 'Okay');
          this.info.setLoadingInfo(`${link} DELETED 😃`, 'info');
          this.info.activity(`${this.info.getUserName()} deleted a link`, this.product.id);
        }, error:(res)=> {
          this.info.errorHandler(res);
          this.openSnackBar(`Failed to delete link: ${link}`, 'Okay');
          this.info.setLoadingInfo(`Failed to delete`, 'warning');
        }
      });
    }
  }

  filePath(p: string) {
    return p.substring(7);
  }

  returnTypeName(id: any) {
    try {
      id=id-1;
      return this.typesList[id].name;
    } catch (error) {
      return null;
    }
    
  }

  returnTypeGroup(id: any) {
    try {
      id=id-1;
      return this.typesList[id].grouping;
    } catch (error) {
      return null;
    }
    
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.mediaFiles, event.previousIndex, event.currentIndex);
    let arr = [];
    for (let index = 0; index < this.mediaFiles.length; index++) {
      arr.push(this.mediaFiles[index].id);
    }
    const data = JSON.stringify(arr);
    this.api.POST(`image-order`, { product_id: this.id, order_list: data }).subscribe({
      next:(res)=>{
        //console.log(res);
      }, error:(res)=>{
        this.info.errorHandler(res);
      }
    });
  }

  /**
   * @description Add or remove categorie's attributes
   * @param action - Can be 'New' or 'Update' 
   */
  updateAttributesBulk() {
    this.info.setLoadingInfo('Updating attributes...', 'info');
    this.info.setLoadingInfo('Fetching attributes...', 'info');
    this.api.POST(`attributes`, [{
      product_id: this.id,
      key : "",
      value: this.productFormAttributesBulk.value.attrValue,
    }]).subscribe({
      next:(res)=> {
        this.saveAttrBtnText = "Save Changes";
        this.getProductAttributes(this.product.id);
        this.openSnackBar('Attributes Saved', 'Okay');
        this.info.activity(`${this.info.getUserName()} Updated product attributes`, this.product.id);
        this.info.setLoadingInfo('Attributes saved...', 'success');
      }, error:(res)=> {
        this.info.errorHandler(res);
        this.saveAttrBtnText = "Failed, try again.";
        this.openSnackBar(res.message, 'Okay');
        this.info.setLoadingInfo('Failed to update attributes...', 'danger');
      }
    });
  }

  updateAttributes(): void {
    this.info.setLoadingInfo('Updating attributes...', 'info');
    this.info.setLoadingInfo('Fetching attributes...', 'info');
    let temp: any[] = this.productFormAttributes.value.attributes;

    for (let index = 0; index < temp.length; index++) {
      if (temp[index].attrValue !== 0) {
        this.api.POST(`attributes`, [{
          product_id: this.id,
          key : temp[index].attrName,
          value: temp[index].attrValue,
        }]).subscribe({
          next:(res)=> {
            this.saveAttrBtnText = "Save Changes";
            this.getProductAttributes(this.product.id);
            this.openSnackBar('Attributes Saved', 'Okay');
            this.info.activity(`${this.info.getUserName()} Updated product attributes`, this.product.id);
          }, error:(res)=> {
            this.info.errorHandler(res);
            this.saveAttrBtnText = "Failed, try again.";
            this.openSnackBar(res.message, 'Okay');
            this.info.setLoadingInfo('Failed to update attributes...', 'danger');
          }
        });
      }
    }

    // this.disableSaveAttrBtn = true;
    // this.saveAttrBtnText = "Saving...";
    // let formObj = this.productFormAttributes.getRawValue();
    // let finalObj: any[] = [];
    // let finalArray: any[] = [];
    // for (let index = 0; index < formObj.attributes.length; index++) {
    //   this.attrKey = finalObj[formObj.attributes[index].attrName];
    //   finalObj[formObj.attributes[index].attrName] = formObj.attributes[index].attrValue;
    //   this.api.POST(`products/update-attributes/${this.id}`, [{
    //     key : formObj.attributes[index].attrValue
    //   }]).subscribe({
    //     next:(res)=> {
    //       this.saveAttrBtnText = "Save Changes";
    //       this.openSnackBar('Attributes Saved', 'Okay');
    //       this.info.activity('Updated product attributes', this.product.id);
    //     }, error:(res)=> {
    //       this.info.errorHandler(res);
    //       this.saveAttrBtnText = "Failed, try again.";
    //       this.openSnackBar(res.message, 'Okay');
    //     }
    //   });
    // }
  }

  deleteFile(id: number): void {
    this.info.setLoadingInfo('About to delete file...', 'warn');
    if(confirm("This image / file will be deleted")) {
      this.openSnackBar(`Deleting file...`, '');
      this.info.setLoadingInfo('Deleting file...', 'warn');
      this.api.GET(`delete-file/${id}`).subscribe({
        next:(res)=>{
          if(res.length > 0) {
            //console.log("delete: ", res);
          }
          this.media();
          this.openSnackBar(`File deleted...`, 'Okay');
          this.info.setLoadingInfo('File deleted', 'success');
          
        }, error:(res)=> {
          this.info.errorHandler(res);
          this.info.setLoadingInfo('Failed to delete file!', 'danger');
        }
      });
    } else {
      this.info.setLoadingInfo('', 'info');
    }
    
  }

  hideFile(id: number): void {
    this.api.GET(`hide-file/${id}`).subscribe({
      next:(res)=>{
        if(res.length > 0) {
          //This is for hiding the file or image from the view on the ui
        }
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
  }

  progressPercentage() { 
    const verified = (this.product.verified) ? 1 : 0;
    const status = (this.product.is_in_development > 0 || this.product.is_eol > 0 || this.product.is_active > 0) ? 1 : 0;
    const categories = (this.productCategories.length > 0) ? 1 : 0;
    const attributes = (this.attributes.length > 0 || this.productAttributes.length > 0) ? 1 : 0;
    const packaging = (this.packagingCount > 0) ? 1 : 0;
    const documents = (this.documentFiles.length > 0) ? 1 : 0;
    const media = (this.mediaFiles.length > 0 || this.imageServerFiles.length > 0) ? 1 : 0;
    //const media = (this.mediaFiles.length > 0) ? 1 : 0;
    const brand = (this.productForm.value.brand_type_id) ? 1 : 0;
    const total = categories + attributes + packaging + documents + media + brand + status + verified;
    const p = (total / 8) * 100;
    if(categories > 0){ //if(media > 0 && categories > 0){
      this.canVerify = true;
    }
    return Math.round(p);
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

  // If using checkboxes
  checkedItem (v: any, p: number, e: any) {
    this.openSnackBar('Updating categories, please wait...', '');
    console.log('category: ', v);
    console.log('parent: ', p);
    this.checkboxLoader = true;
    const temp = this.selectedCategories;
    this.selectedCategories = [];

    for (let index = 1; index < temp.length; index++) {
      this.isChecked(temp[index]);
    }

    const i = this.selectedCategories.indexOf(v);
    if(i < 0) {
      this.selectedCategories.push(v);

      const grandParent = this.categoriesList.find((x:any) => x.id == p);
      if(grandParent) {
        this.selectedCategories.push(grandParent?.id);
      }

      const greatParent = this.categoriesList.find((x:any) => x.id == grandParent?.parent);
      if(greatParent) {
        this.selectedCategories.push(greatParent?.id);
      }

      const greatGrandParent = this.categoriesList.find((x:any) => x.id == greatParent?.parent);
      if(greatGrandParent) {
        this.selectedCategories.push(greatGrandParent?.id);
      }

      const greatGrandParent1 = this.categoriesList.find((x:any) => x.id == greatGrandParent?.parent);
      if(greatGrandParent1) {
        this.selectedCategories.push(greatGrandParent1?.id);
      }

      const greatGrandParent2 = this.categoriesList.find((x:any) => x.id == greatGrandParent1?.parent);
      if(greatGrandParent2) {
        this.selectedCategories.push(greatGrandParent2?.id);
      }

      const greatGrandParent3 = this.categoriesList.find((x:any) => x.id == greatGrandParent2?.parent);
      if(greatGrandParent3) {
        this.selectedCategories.push(greatGrandParent3?.id);
      }

      this.saveCategories();
      this.selectedCategories = [];
    } else {
      this.selectedCategories.splice(i, 1);
      //this.saveCategories();
      this.selectedCategories = [];
    }
    console.log(this.selectedCategories);
  }

  // if using dropdown
  chosenItem (e: any, t: number) {
    const v = e.value;
    console.log(v);

    switch (t) {
      case 1:
        this.tier1 = v;
        break;
      case 2:
        this.tier2 = v;
        break;
      case 3:
        this.tier3 = v;
        break;
      case 4:
        this.tier4 = v;
        break;
      default:
        break;
    }
    
    const cat = this.categoriesList.find((n: any) => n.id == v);
    this.tierLabels.push(cat?.name);
    this.descedantsCategories = this.categoriesList.filter((c: any) => c.parent == v);
    this.tierLength = this.descedantsCategories.length;
    this.selectedCategories.push(v);
    console.log(this.descedantsCategories);
  }

  saveCategories() {
    this.removePrevCatsFromDb();
    this.checkboxLoader = true;
    this.info.setLoadingInfo('Saving categories...', 'info');
    this.openSnackBar('Updating categories, almost done...', '');
    const vals = this.selectedCategories.filter((x: any) => x != null);
    if (vals.length > 0) {
      for(let i=0; i < 1; i++) {
        this.api.POST('product-categories-bulk', {
          product_id: this.id,
          categories: vals
        }).subscribe({
          next:(res)=>{
            this.getProductCategories(this.id);
            this.openSnackBar(`Categories updated.`, '');
            this.clearTempTiers();
            this.info.setLoadingInfo('Categories updated...', 'success');
            this.checkboxLoader = false;
            this.progressPercentage();
          }, error:(res)=>{
            this.getProductCategories(this.id);
            this.info.errorHandler(res);
            this.openSnackBar('😢 ' + res.message, 'Okay');
            this.checkboxLoader = false;
            this.info.setLoadingInfo('Failed to update categories...', 'danger');
          }
        });
      }
    }
    //this.openSnackBar('Please choose categories', 'Okay');
  }

  removePrevCatsFromDb() {
    this.checkboxLoader = true;
    this.info.setLoadingInfo('Removing categories...', 'info');
    this.openSnackBar('Removing old categories, please wait...', '');
    this.api.POST('product-categories/clean', {
      product_id: this.id,
    }).subscribe({
      next:(res)=>{
        console.log(res);
        this.getProductCategories(this.id);
        this.info.setLoadingInfo('Categories removed...', 'warn');
        this.openSnackBar('Old categories removed...', '');
        this.checkboxLoader = false;
        this.progressPercentage();
      }, error:(res)=>{
        this.info.errorHandler(res);
        this.info.setLoadingInfo('Could not remove categories...', 'danger');
        this.checkboxLoader = false;
      }
    });
  }

  setPermission(permissions: string[]) {
    return true;
  }

  getPdsAttributes(sku: string): void {
    this.info.setLoadingInfo('Fetching attributes from PDS...', 'info');
    this.api.GET(`pds-attributes/${sku}`).subscribe({
      next:(res)=>{
        this.pdsAttributes = res;
        this.loadingPdsAttributes = false;
        this.info.setLoadingInfo('PDS attributes loaded', 'success');
      }, error:(res)=> {
        this.info.errorHandler(res);
        this.loadingPdsAttributes = false;
        this.info.setLoadingInfo('', 'danger');
      }
    });
  }

  deleteProductAttribute(id: number, key: string, product_id: string) {

    let text = `Delete ${key}?`;
    if (confirm(text) == true) {
      this.info.setLoadingInfo('Deleting attributes', 'info');
      this.api.GET(`attributes/delete/${id}`).subscribe({
        next:(res)=>{
          this.getProductAttributes(product_id);
          this.info.activity(`${this.info.getUserName()} deleted attribute: ${key}.`, parseInt(product_id));
          this.info.setLoadingInfo('Attribute(s) removed', 'success');
          this.progressPercentage();
        }, error:(res)=> {
          this.info.errorHandler(res);
          this.info.setLoadingInfo('Failed to delete ttribute(s)', 'danger');
        }
      });
    } 

    
  }

  downloadURI(uri: any, id: number, name: string, file: File) {
    let path = file.path; 
    this.api.download('download-file-api', uri, this.product.id, this.product.sku, file.type_id, path.replace("public/", "storage/"), id).subscribe((res: BlobPart) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `${this.product.sku}${file.type_id}.jpg`);
    }, (err: any) => {
      console.log(err);
    });
  }

  downloadImageServer(uri: any, id: number, name: string, file: File) { 
    let path = file.path; 
    this.api.download('download-file-api', uri, this.product.id, this.product.sku, file.type_id, uri, id).subscribe((res: BlobPart) => {
      const blob = new Blob([res], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `imageserver${this.product.sku}.jpg`);
    }, (err: any) => {
      this.info.errorHandler(err);
    });
  }

  getLinkedProducts() {
    this.bundleLoader = true;
    this.linkedImagesLoader = true;
    this.info.setLoadingInfo('Getting linked products', 'info');
    this.api.GET(`linked-products/${this.id}`).subscribe({
      next:(res)=>{
        this.linkedProducts = res;
        this.linkedProductSKUs = [];
        this.linkedProductsIDs = [];
        this.mediaFilesForLinkedProducts = [];
        for (let index = 0; index < res.length; index++) {
          let child = this.productsList.find((x: any)=>x.id == res[index].child_id);
          this.linkedProductSKUs.push(child?.sku);
          this.linkedProductsIDs.push(child?.id);
          //this.imageserver(child!.sku); 
          this.info.setLoadingInfo('Getting linked products media', 'info');   
          this.api.GET(`product-media-files/${child?.id}`).subscribe({
            next:(res)=>{
              if(res.length > 0) {
                this.mediaFilesForLinkedProducts.push(res);
              }
            }, error:(res)=> {
              this.info.errorHandler(res);
            }
          });
        } 
        this.bundleLoader = false; 
        this.info.setLoadingInfo('', 'success');      
      }, error:(res)=> {
        this.info.errorHandler(res);
        this.bundleLoader = false;
      }
    });
  }

  addDesign(type: number): void {

    const df = this.formBuilder.group({
      designField: [],
    })

    switch (type) {
      case 80:
        this.shoutouts.push(df);
        break;
      case 81:
        this.features.push(df);
        break;
      case 82:
        this.fabs.push(df);
        break;
      case 83:
        this.contents.push(df);
        break;
      default:
        break;
    }    
  }
  
  removeDesign(i: number, type: number): void {
    this.designLoader = true;
    let deleteId: number = 0;
    switch (type) {
      case 80:   
        deleteId = this.shoutoutsForm.value.shoutouts[i].designId;
        this.shoutouts.removeAt(i);
        this.shoutoutsForm.markAsDirty();
        break;
      case 81:
        deleteId = this.featuresAndBenefitsForm.value.features[i].designId;
        this.features.removeAt(i);
        this.featuresAndBenefitsForm.markAsDirty();
        break;
      case 82:
        deleteId = this.extendedFabsForm.value.fabs[i].designId;
        this.fabs.removeAt(i);
        this.extendedFabsForm.markAsDirty();
        break;
      case 83:
        deleteId = this.packageContentsForm.value.contents[i].designId;
        this.contents.removeAt(i);
        this.packageContentsForm.markAsDirty();
        break;
      default:
        break;
    } 

    this.api.GET(`delete-design/${deleteId}`).subscribe({
      next:(res)=>{
        this.openSnackBar('Item removed', 'Okay');
        this.designLoader = false;
        this.progressPercentage();
        //this.getDesigns(this.id)
        //this.info.activity(`${this.info.getUserName()} deleted design item`, parseInt(product_id));
      }, error:(res)=> {
        this.info.errorHandler(res);
        this.openSnackBar('🔴 Item could not be removed', 'Okay');
      }
    });
  }

  design(type: number) {
    switch (type) {
      case 80:
        this.saveDesign(this.shoutoutsForm.value.shoutouts, type);
        break;
      case 81:
        this.saveDesign(this.featuresAndBenefitsForm.value.features, type);
        break;
      case 82:
        this.saveDesign(this.extendedFabsForm.value.fabs, type);
        break;
      case 83:
        this.saveDesign(this.packageContentsForm.value.contents, type);
        break;
      default:
        break;
    } 
  }

  saveDesign (formObj: any, typeId: number) {
    this.designLoader = true;
    this.info.setLoadingInfo('Saving changes', 'info');
    this.openSnackBar('Saving changes...', '');
    for (let index = 0; index < formObj.length; index++) {
      const checkValue = formObj[index].designField;
      const valueFound = formObj.find((x: any) => x.designField == checkValue);
      const insertId = valueFound.designId;
      if (insertId == undefined) {
        this.api.POST(`design`, { 
          product_id: this.id,
          design_type_id: typeId,
          value: checkValue
        }).subscribe({
          next:(res)=>{
            this.designLoader = false;
            this.info.setLoadingInfo('Changes saved', 'success');
            this.openSnackBar('Changes saved', 'Okay');
            this.info.errorHandler(res);
            this.progressPercentage();
          }, error:(e) => {
            this.designLoader = false;
            this.info.setLoadingInfo('FABs, Extended FABs or Shoutouts changes failed to update.', 'danger');
            this.openSnackBar('Changes were not saved, something wrong with input data.', 'Okay');
          }
        });
      }
    }
  }

  getDesigns(id: string) {
    this.info.setLoadingInfo('Fetching design data', 'info');
    this.designLoader = true;
    this.api.GET(`design/${id}`).subscribe({
      next:(res)=>{
        this.designLoader = false;
        this.info.setLoadingInfo('', 'success');
        if (res !== null) {
          for (let index = 0; index < res.length; index++) {
            const designs = this.formBuilder.group({
              designField: [res[index].value, Validators.required],
              designId: [res[index].id]
            })
            switch (res[index].design_type_id) {
              case 80:
                this.shoutouts.push(designs);
                this.shoutOuts.push(res[index]);
                break;
              case 81:
                this.features.push(designs);
                this.featuresAndBenefits.push(res[index]);
                break;
              case 82:
                this.fabs.push(designs);
                this.extendedFabs.push(res[index]);
                break;
              case 83:
                this.contents.push(designs);
                this.inTheBox.push(res[index]);
                break;
              default:
                break;
            }

            this.info.setLoadingInfo(`Fetching design data: ${res[index].value}`, 'info');
          }
        }
        this.progressPercentage();
      }, error:(res)=>{
        this.info.errorHandler(res);
        //this.designLoader = false;
      }
    });
  }

  addToBundle (e: any) {
    const product = this.productsList.find((p: any) => p.sku == e.option.value);
    const id = product?.id;
    this.autocompleteControl.reset();
    this.api.POST('link-products', {
      parent_id: this.id,
      child_id: id,
      relationship: "Pamphlet"
    }).subscribe({
      next:(res) => {
        this.getLinkedProducts();
        const id = parseInt(this.id);
        this.info.activity('Added new SKU to linked products', id);
        this.openSnackBar('Product added ' , 'Okay');
        this.progressPercentage();
      }, error:(res)=>{
        this.info.errorHandler(res);
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  /**
   * @todo get products from the service, or pull from the server if not available on the service.
   * 
   */
  entireProducts() {
    this.productsList = this.products.getProducts();  
    if (this.productsList.length < 1) {
      this.api.GET('products').subscribe({
        next:(res)=>{
          this.productsList = res;
          this.products.setProducts(res);
          this.options = this.productsList.map((x: Product) => x.sku);
        }, error:(res)=>{
          this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        }
      });
    }
    this.options = this.productsList.map((x: Product) => x.sku);
    const s = this.typesList.filter((x: Type) => x.grouping == "Series");
    this.series = s.map((x: Type) => x.name);
  }

  /**
   * 
   * @param value Input from the searchbox
   * @todo This functions filters SKUs from an array of over 20k products
   * @todo The filter will only trigger when the input string has more than 4 chars
   * @returns Filtered array
   */
   private _filter(value: string): string[] {
    let x: string[] = [];
    if(value.length > 4){
      const filterValue = value.toLowerCase();
      x = this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
    return x;
  }

  private _filterSeries(value: string): string[] {
    let x: string[] = [];
    if(value.length > 4){
      const filterValue = value.toLowerCase();
      x = this.series.filter(option => option.toLowerCase().includes(filterValue));
    }
    return x;
  }

  removeFromBundle (sku: string) {
    let child = this.productsList.find((p: any) => p.sku == sku);
    const relationship = this.linkedProducts.find((r: any) => r.child_id == child?.id && r.parent_id == this.id)
    this.api.GET(`linked-products/delete/${relationship.id}`).subscribe({
      next:(res)=>{
        this.linkedProductSKUs = [];
        this.getLinkedProducts();
        this.info.activity('Removed product from linked products', 0);
        this.openSnackBar('Product removed ' , 'Okay')
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
  }

  addSeries(e: any){
    this.newSeries = e.option.value;
    this.productForm.dirty;
    const lookupType  = this.typesList.find((x: Type) => x.name == this.newSeries);
    this.productForm.patchValue({
      family_grouping: lookupType?.id
    });
    this.updateProduct();
  }

  addNonExistingType () {
    this.info.setLoadingInfo('Updating series...', 'info');
    const typeExists = this.typesList.find((x: Type) => x.name.toLowerCase() == this.newSeriesType.toLowerCase());
    if(!typeExists) {
      this.api.POST('types', {
        name: this.newSeriesType,
        grouping: "Series"
      }).subscribe({
        next:(res) => {
          this.productForm.patchValue({
            family_grouping: res.id
          });
          //this.updateProduct();
          this.openSnackBar('Series saved', '');
        }, error:(res) => {
          this.typesLoader = false;
          this.openSnackBar('Failed to communicate with the server: ' + res.message, 'Okay');
        }
      });
    } else {
      this.openSnackBar(`${this.newSeriesType} already added.`, 'OKay');
    }
  }

  ngOnChanges() {

  }

  audit(id: string) {
    this.info.setLoadingInfo('Getting audits', 'info');
    this.api.GET(`activity/${this.id}`).subscribe({
      next:(res)=>{
        this.audits = res;
        this.info.setLoadingInfo('', 'success');
      }, error:(res)=> {
        this.info.errorHandler(res);
        this.info.setLoadingInfo('Audits did not load properrly', 'warn');
      }
    });
  }

  presentation(): void {
    this.api.presentation(this.product.id, this.linkedProductsIDs, this.productSeries, this.productBrand, this.productsList);
    this.openSnackBar('Generating Presentation...', '');
  }

  getUsers() {
    try {
      this.api.GET('users').subscribe({
        next:(res)=>{
          this.users = res;
          this.api.GET(`roles`).subscribe({
            next:(res)=>{
              const roles = res;
              const role = roles.find((r: any) => r.type_id == 86 && r.product_id == this.id);
              if(role) {
                const manager = this.users.find((u: any) => u.id == role.user_id);
                this.productManager = manager?.name + " " + manager?.surname;
                //this.productManagerId = manager?.id;
                this.loadpProductManager = false;
                //If Product manager is logged in, then allow editRole
                this.editRole = true;
              }
            }, error:(res)=>{
              console.log(res);
            }
          })
          
          this.loadpProductManager = false;
        }, error:(res)=>{
          this.loadpProductManager = false;
          this.openSnackBar('Failed to connect to the server: ' + res.message, 'Okay');
        }
      });
    } catch (error) {
      this.loadpProductManager = false;
    }
    
  }

  selectManager(e: any) {
    console.log(e);
    const userId = e.value;
    this.api.POST(`products/update/${this.id}`, {
      product_manager: userId,
    }).subscribe({
      next:(res)=>{
        this.progressPercentage();
        this.getDetails(this.sku);
        this.openSnackBar('Product Manager updated', 'Okay');
        this.info.activity(`Updated Product Manager`, 0);
      }, error:(res)=>{
        this.info.errorHandler(res);
        this.openSnackBar('😢 ' + res.message, 'Okay');
      }
    });
  }

  changeFocus(p: string) {
    this.focusImg = p;
  }

  public autoInfo() {
    this.openSnackBar("This will update automatically", 'Okay');
  }

  ecommerceImage(e: any, id: number) {
    if(e == 1) {
      this.isEcommerceFile = false; // change to false
    } else {
      this.isEcommerceFile = true;
    }

    this.api.POST(`images/ecommerce/${id}`, {
      ecommerce: this.isEcommerceFile
    }).subscribe({
      next:(res)=> {
        console.log(res);
        this.openSnackBar('Changes saved', 'Okay');
        this.info.activity(`E-commerce image`, 0);
      }, error:(res)=> {
        this.openSnackBar(res.message, 'Okay');
      }
    });
  }

  modifyCats() {
    this.clearTempTiers();
    this.descedantsCategories = [];
    this.modifyingCategories = !this.modifyingCategories;
  }

  clearCats() {
    this.clearTempTiers();
    this.descedantsCategories = [];
    this.removePrevCatsFromDb();
  }

  clearTempTiers () {
    this.tier1 = 0;
    this.tier2 = 0;
    this.tier3 = 0;
    this.tier4 = 0;
    this.tierLabels = [];
    this.selectedCategories = [];
  }

  test() {
    this.api.test(`test-private`).subscribe({
      next:(res)=>{
        console.log(res);
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
  }

  switchImage(i: number) {
    this.switchImageMain = i;
  }

  beautifyAttr(attr: string) {

    if (attr && attr.length > 0) {
      const l = attr[0];
      let pretty: string;

      if(l.match(/^[A-Za-z0-9]*$/)){
        pretty = attr;
      } else {
        pretty = attr.replaceAll(l,"<br>•");
      }

      return pretty;

    } else {
      return attr;
    }
  }

  toggleInfoBar () {
    this.showInfoBar = !this.showInfoBar;

    if (this.showInfoBar) {
      this.mainTabsCls = "col-md-1 col-lg-9";
    } else {
      this.mainTabsCls = "col-md-12 col-lg-12";
    }
    
  }

  addToSelectedFiles(f: number) {
    
    const i = this.selectedFiles.indexOf(f);

    if(i> -1) {
      this.selectedFiles.splice(i, 1);
    } else {
      this.selectedFiles.push(f);
    }

    console.log(this.selectedFiles);
  }

  bulkDeleteFiles() {
    if(confirm(`${this.selectedFiles.length} items will be deleted!`)) {
      this.openSnackBar(`Deleting multiple files`, '');
      this.info.setLoadingInfo('Deleting multiple files...', 'warn');

      for (let x = 0; x < this.selectedFiles.length; x++) {
        this.openSnackBar('Please wait...', '');
        this.info.setLoadingInfo(`Deleting file ${x + 1}`, 'warn');
        const id = this.selectedFiles[x];
        this.api.GET(`delete-file/${id}`).subscribe({
          next:(res)=>{
            this.media();
            this.openSnackBar(`${x + 1} files deleted...`, 'Okay');
            this.openSnackBar(`${x + 1} files deleted...`, '');
            this.info.setLoadingInfo(`${x + 1} files deleted...`, 'success');
            this.progressPercentage();
          }, error:(res)=> {
            this.info.errorHandler(res);
            this.info.setLoadingInfo('Failed to delete file!', 'danger');
          }
        }); 
      }
      this.info.setLoadingInfo('Items deleted successfully', 'success');
      this.selectedFiles = [];
    } else {
      this.info.setLoadingInfo('', 'info');
    }
  }

  canManage(productId: string): void {
    this.api.POST('can-manage-product', {
      product: productId,
      user: this.info.getUserId()
    }).subscribe({
      next:(res)=>{
        if(res > 0) {
          // The below line should be uncommented if PDs should update products from the Product Repo
          this.canManageThisProduct = true; 
        }
      }, error:(res)=>{
        console.log(res);
      }
    });
  }

  toggleHistory() {
    this.historyTable = !this.historyTable;
  }

  isChecked(id: number) {
    const cat = this.productCategories.find((x: any) => x.id == id);
    if(cat) {
      return true;
    }
    return false;
  }

  ctrlF() {
    console.log(this.findCategory);
    (window as any).find(this.findCategory);
  }
}
