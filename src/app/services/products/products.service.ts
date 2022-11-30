import { Injectable } from '@angular/core';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private products: Product[] = [];
  private categories: Category[] = [];

  constructor() { }

  public getProducts () {
    console.log("Products GETTER");
    console.log(this.products);
    return this.products;
  }
  
  public setProducts (products: Product[]): void {
    this.products = products;
  }

  public getCategories() {
    return this.categories;
  }

  public setCategories (categories: Category[]): void {
    this.categories = categories;
  }

  /**
   * @param query
   * @Todo Searches the list of products to find a matching product
   * @return
   * 
   */
  public searchProductByName(query: string) {
    const name = query.toLowerCase();
    let product = this.products.find((x: Product)=>x.name.toLowerCase() == name);
    return product;
  }

}
