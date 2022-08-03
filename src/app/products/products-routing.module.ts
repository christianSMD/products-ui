import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportComponent } from './export/export.component';
import { CategoriesComponent } from './categories/categories.component';
import { ListProductsComponent } from './list-products/list-products.component';
import { NewProductComponent } from './new-product/new-product.component';
import { ProductsHomeComponent } from './products-home/products-home.component';
import { SingleProductComponent } from './single-product/single-product.component';

const routes: Routes = [
  { path: '', component: ProductsHomeComponent },
  { path: ':sku', component: SingleProductComponent },
  { path: 'brand/:brand', component: ListProductsComponent },
  { path: 'add/new', component: NewProductComponent },
  { path: 'categories/manage', component: CategoriesComponent },
  { path: 'products/export', component: ExportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
