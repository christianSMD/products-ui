
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://products.smdtechnologies.com/public/api/';
  private storageUrl = 'https://products.smdtechnologies.com/public/storage/';
  public domainUrl = 'https://products.smdtechnologies.com/login';

  constructor(private http : HttpClient) { }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public getStorageUrl () {
    return this.storageUrl;
  }

  public POST (endpoint: string, data : any){
    return this.http.post<any>(this.baseUrl + endpoint, data);
  }

  public GET (endpoint: string): Observable<any[]>{
    return this.http.get<any[]>(this.baseUrl + endpoint);
  }

  public IMAGESERVER(sku: string): Observable<any[]> {
    return this.http.get<any[]>('https://images.smdtechnologies.co.za/products_system/' + sku);
  }

  public IMAGESERVERHIRES(sku: string): Observable<any[]> {
    return this.http.get<any[]>('https://images.smdtechnologies.co.za/products_system_hi_res/' + sku);
  }

  public upload(endpoint: string, data: any): Observable<HttpEvent<any>> {
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
    return this.http.get(this.baseUrl + endpoint);
  }

  public download(endpoint: string, uri: string, product_id: string, product_sku: string, old_type_id: number, path: string, new_type_id: number) {
   
    return this.http.post(this.baseUrl + endpoint, {
      original_path: uri,
      product_id: product_id,
      product_sku: product_sku,
      original_type_id: old_type_id,
      new_type_id: new_type_id
    }, { responseType:'arraybuffer' })
    
  }

  public downloadCSV(endpoint: string, brand: string, active: boolean, development: boolean, eol: boolean) {
   
    return this.http.post(this.baseUrl + endpoint, {
      brand: brand,
      active: active,
      development: development,
      eol: eol,
    }, { responseType:'arraybuffer' })
    
  }
}
