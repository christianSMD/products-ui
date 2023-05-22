import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from 'src/app/interfaces/category';
import { ApiService } from 'src/app/services/api/api.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { TreeService } from 'src/app/services/tree/tree.service';
import { Type } from 'src/app/interfaces/type';
import { InfoService } from 'src/app/services/info/info.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { LookupService } from 'src/app/services/lookup/lookup.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {

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
  productRegionList: any[] = [];
  pdsAttributes: any[] = [];
  loadingPdsAttributes: boolean = true;
  expiry_date: string;
  today = new Date();
  onImageServer = true;


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
  loadpProductManager: boolean = true;
  adminRole: boolean = false;
  productManagerRole: boolean = false;
  newSeriesType: string = "";
  focusImg: string;
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
  

  constructor(public navbar: NavbarService,
    private api: ApiService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute, 
    private router: Router,
    private info: InfoService,
    public dialog: MatDialog,
    private lookup: LookupService,
    private http: HttpClient,
    private products: ProductsService,
    private _sanitizer: DomSanitizer,
    public nav: NavbarService,
    public sideNav: SidenavService,
    public treeNav: TreeService,
  ) { }

  ngOnInit(): void {
    
    this.info.setLoadingInfo('Preparing...', 'info');
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
    this.getAllTypes();
    this.navbar.hide();
    this.treeNav.hide();
    this.sideNav.hide();
    this.route.params.subscribe((params: Params) => {
      this.sku = params['sku'];
      this.productSku = this.sku;
    });
    this.getDetails(this.sku);
    this.getAllCategories();
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
          }

         
          this.getProductAttributes(this.id);
          this.getPackaging(this.id);
          this.getPdsAttributes(sku);
          this.getProductRegions(this.id);
          this.getDesigns(this.id);
          this.media();
          this.documents();
          this.getSocialLinks(this.id);
          this.getProductCategories(this.id);
          //this.imageserver(sku);
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
   * @todo Display Prodict regions.
   */
   getProductRegions(id: string): void {
    this.info.setLoadingInfo('Loading regions...', 'info');
    this.api.GET(`product-regions/${id}`).subscribe({
      next:(res)=>{
        this.productRegionList = res;
        if (res !== null) {
          this.info.setLoadingInfo('Regions loaded', 'success');
        }
      }, error:(res)=> {
        this.info.errorHandler(res);
      }
    });
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

  getDesigns(id: string) {
    this.info.setLoadingInfo('Fetching design data', 'info');
    this.designLoader = true;
    this.api.GET(`design/${id}`).subscribe({
      next:(res)=>{
        this.designLoader = false;
        this.info.setLoadingInfo('', 'success');
        if (res !== null) {
          for (let index = 0; index < res.length; index++) {
            switch (res[index].design_type_id) {
              case 80:
                this.shoutOuts.push(res[index]);
                break;
              case 81:
                this.featuresAndBenefits.push(res[index]);
                break;
              case 82:
                this.extendedFabs.push(res[index]);
                break;
              case 83:
                this.inTheBox.push(res[index]);
                break;
              default:
                break;
            }

            this.info.setLoadingInfo(`Fetching design data: ${res[index].value}`, 'info');
          }
        }

      }, error:(res)=>{
        this.info.errorHandler(res);
        //this.designLoader = false;
      }
    });
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

  switchImage(i: number) {
    this.switchImageMain = i;
  }

  beautifyAttr(attr: string) {
    const l = attr[0];
    let pretty: string;

    if(l.match(/^[A-Za-z0-9]*$/)){
      pretty = attr;
    } else {
        pretty = attr.replaceAll(l,"<br>•");

    }
    return pretty;
  }

  toggleInfoBar () {
    this.showInfoBar = !this.showInfoBar;

    if (this.showInfoBar) {
      this.mainTabsCls = "col-md-1 col-lg-9";
    } else {
      this.mainTabsCls = "col-md-12 col-lg-12";
    }
    
  }
}
