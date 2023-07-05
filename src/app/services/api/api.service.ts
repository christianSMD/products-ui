
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import {saveAs} from 'file-saver';
import * as FileSaver from 'file-saver';
import { Product } from 'src/app/interfaces/product';
import pptxgen from "pptxgenjs";
import { Type } from '@angular/compiler';
import { InfoService } from '../info/info.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private baseUrl = 'https://products.smdtechnologies.com/public/api/';
  private storageUrl = 'https://products.smdtechnologies.com/public/storage/';
  public domainUrl = 'https://products.smdtechnologies.com/login';

  constructor(private http : HttpClient) {}

  public test(endpoint: string) {
    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Token':'301|HRnSLV2db1tg0vCVXpfQbGfKeH8iTHNA415hQIZk'
    });
    return this.http.get<any[]>('https://products.smdtechnologies.com/public/api/' + endpoint);
  }

  private endpoints(): void {  
    if(isDevMode()){
      // this.baseUrl = 'http://127.0.0.1:8000/api/';
      // this.storageUrl = 'http://127.0.0.1:8000/storage/';
      // this.domainUrl = 'http://localhost:4200/login';
      this.baseUrl = 'https://products.smdtechnologies.com/public/api/';
      this.storageUrl = 'https://products.smdtechnologies.com/public/storage/';
      this.domainUrl = 'https://products.smdtechnologies.com/login';
    }
    
  }

  public getBaseUrl() {
    this.endpoints();
    return this.baseUrl;
  }

  public getStorageUrl () {
    this.endpoints();
    return this.storageUrl;
  }

  public POST (endpoint: string, data : any){
    this.endpoints();
    return this.http.post<any>(this.baseUrl + endpoint, data);
  }

  public GET (endpoint: string): Observable<any[]>{
    this.endpoints();
    const timeoutDuration = 120000;
    return this.http.get<any[]>(this.baseUrl + endpoint)
    .pipe(timeout(timeoutDuration));
  }

  public IMAGESERVER(sku: string): Observable<any[]> {
    return this.http.get<any[]>('https://images.smdtechnologies.co.za/products_system/' + sku);
  }

  public IMAGESERVERHIRES(sku: string): Observable<any[]> {
    return this.http.get<any[]>('https://images.smdtechnologies.co.za/products_system_hi_res/' + sku);
  }

  public upload(endpoint: string, data: any): Observable<HttpEvent<any>> {
    this.endpoints();
    const formData: FormData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('product_id', data.product_id);
    formData.append('product_sku', data.product_sku);
    formData.append('type_id', data.type_id);
    formData.append('type', data.type);
    formData.append('permissions', data.permissions);
    formData.append('expiry_date', data.expiry_date);
    const req = new HttpRequest('POST', this.baseUrl + endpoint, formData, { 
      reportProgress: true, 
      responseType: 'json' 
    });
    return this.http.request(req);
  }

  public getFiles(endpoint: string): Observable<any> {
    this.endpoints();
    return this.http.get(this.baseUrl + endpoint);
  }

  public download(endpoint: string, uri: string, product_id: string, product_sku: string, old_type_id: number, path: string, new_type_id: number) {
    this.endpoints();
    return this.http.post(this.baseUrl + endpoint, {
      original_path: uri,
      product_id: product_id,
      product_sku: product_sku,
      original_type_id: old_type_id,
      new_type_id: new_type_id
    }, { responseType:'arraybuffer' })
    
  }

  public downloadCSV(endpoint: string, brand: string, active: boolean, development: boolean, eol: boolean) {
    this.endpoints();
    return this.http.post(this.baseUrl + endpoint, {
      brand: brand,
      active: active,
      development: development,
      eol: eol,
    }, { responseType:'arraybuffer' })
    
  }

  presentation (productId: number, linkedProducts: any[], series: string, brand: string, allProducts: Product[]) {
    let pres = new pptxgen(); 
    let coverSlide = pres.addSlide();
    let overviewSlide = pres.addSlide();
    const mainProduct: any = allProducts.find((p: Product) => p.id == productId);

    if(brand) {
      coverSlide.addImage({
        path: `../../../assets/logos/${brand.toLocaleLowerCase()}.png`,
        x: '25%', y: '9%', w: '50%', h: '80%',
      });
    }
    

    overviewSlide.addText(`${mainProduct.name}\n${mainProduct.description}`, {
      x: '1%', y: '10%', w: '40%', h: '40%',
      margin: 0.5,
      fontFace: "Arial",
      fontSize: 9,
      color: "000000",
      bold: false,
      isTextBox: true,
  });
    

    if (linkedProducts.length < 1) {

      const product: any = allProducts.find((p: Product) => p.id == productId);
      let slide = pres.addSlide();
  
      slide.addShape(pres.ShapeType.rect, {
        fill: { type: "solid", color: "669999" },
        x:0.0, y:0.0, w:'40%', h:'100%'
      });
    
      this.pptSlideImages(product.sku, slide);
    
      const panelText = `
        ${product.name}\n 
        ${product.sku} \n 
        ${series}
      `;
      
      slide.addText(panelText, {
          x: '1%', y: '10%', w: '40%', h: '40%',
          margin: 0.5,
          fontFace: "Arial",
          fontSize: 9,
          color: "FFFFFF",
          bold: false,
          isTextBox: true,
      });
    } else {

      for (let index = 0; index < linkedProducts.length; index++) {
        const product: any = allProducts.find((p: Product) => p.id == linkedProducts[index]);
        let slide = pres.addSlide();
  
        slide.addShape(pres.ShapeType.rect, {
          fill: { type: "solid", color: "669999" },
          x:0.0, y:0.0, w:'40%', h:'100%'
        });
            
        this.pptSlideImages(product.sku, slide);

        const panelText = `
          ${product.name}\n 
          ${product.sku} \n 
        `;
        
        slide.addText(panelText, {
            x: '1%', y: '10%', w: '40%', h: '40%',
            margin: 0.5,
            fontFace: "Arial",
            fontSize: 9,
            color: "FFFFFF",
            bold: false,
            isTextBox: true,
        });
  
      }

    }
    setTimeout(() => {
      pres.writeFile({ fileName: `presentation.pptx` });
    }, 6000);
  }

  public pptSlideImages(productSku: string, slide: any) {
    
    this.IMAGESERVERHIRES(productSku).subscribe({  
      next:(res)=>{   
        if(res.length > 0) {
          let pos = 50;
          for (let index = 0; index < res.length; index++) {
            setTimeout(() => {
              if (filename.endsWith(".png") || filename.endsWith(".jpg")) {
                slide.addImage({
                  path: `https://images.smdtechnologies.co.za/uploads/${filename}`,
                  x: `${pos + index}%`, y: '9%', w: '40%', h: '70%',
                });
              } 
            }, 1000);
            const filename: string = res[index].filename;
          }
        }
      }, error:(res)=> {
        console.log(res);
      }
    }); 
  }

}
