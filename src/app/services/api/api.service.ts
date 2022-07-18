
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http : HttpClient) { }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public POST (endpoint: string, data : any){
    return this.http.post<any>(this.baseUrl + endpoint, data);
  }

  public GET (endpoint: string): Observable<any[]>{
    return this.http.get<any[]>(this.baseUrl + endpoint);
  }

  public upload(endpoint: string, data: any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    formData.append('product_id', data.product_id);
    formData.append('product_sku', data.product_sku);
    formData.append('type_id', data.type_id);
    const req = new HttpRequest('POST', this.baseUrl + endpoint, formData, { 
      reportProgress: true, 
      responseType: 'json' 
    });
    return this.http.request(req);
  }

  public getFiles(endpoint: string): Observable<any> {
    return this.http.get(this.baseUrl + endpoint);
  }
}
