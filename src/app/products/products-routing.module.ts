import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandsComponent } from './brands/brands.component';
import { CategoriesComponent } from './categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExportCSVComponent } from './export/export-csv/export-csv.component';
import { ExportComponent } from './export/export.component';
import { ListProductsComponent } from './list-products/list-products.component';
import { NewProductComponent } from './new-product/new-product.component';
import { ProductManagerComponent } from './product-manager/product-manager.component';
import { ProductsHomeComponent } from './products-home/products-home.component';
import { SeriesComponent } from './series/series.component';
import { SingleProductComponent } from './single-product/single-product.component';
import { QrCodeComponent } from './qr-code/qr-code.component';
import { PublicComponent } from './public/public.component';

const routes: Routes = [
  { path: '', component: ProductsHomeComponent },
  { path: ':sku', component: SingleProductComponent },
  { path: 'brand/:brand', component: ListProductsComponent },
  { path: 'add/new/:type', component: NewProductComponent },
  { path: 'categories/manage', component: CategoriesComponent },
  { path: 'products/export', component: ExportComponent },
  { path: 'products/export-csv', component: ExportCSVComponent },
  { path: 'products/dashboard', component: DashboardComponent },
  { path: 'series/:series', component:  SeriesComponent},
  { path: 'brands/manage-brands', component:  BrandsComponent},
  { path: 'products/product-manager', component:  ProductManagerComponent},
  { path: 'qrcode/:sku', component:  QrCodeComponent},
  { path: 'public/:sku', component:  PublicComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
