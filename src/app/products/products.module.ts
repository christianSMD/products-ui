import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { SingleProductComponent } from './single-product/single-product.component';
import { ListProductsComponent } from './list-products/list-products.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NewProductComponent } from './new-product/new-product.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsHomeComponent } from './products-home/products-home.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CategoriesPipe } from '../pipes/categories.pipe';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { ExportComponent } from './export/export.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExportCSVComponent } from './export/export-csv/export-csv.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SeriesComponent } from './series/series.component';
import { CommonModuleModule } from '../common-module/common-module.module';
import { BrandsComponent } from './brands/brands.component';
import { ProductManagerComponent } from './product-manager/product-manager.component';

@NgModule({
  declarations: [
    SingleProductComponent,
    ListProductsComponent,
    NewProductComponent,
    CategoriesComponent,
    ProductsHomeComponent,
    CategoriesPipe,
    ExportComponent,
    ExportCSVComponent,
    DashboardComponent,
    SeriesComponent,
    BrandsComponent,
    ProductManagerComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    MatChipsModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableExporterModule,
    MatMenuModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatToolbarModule,
    DragDropModule,
    MatGridListModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatTooltipModule,
    CommonModuleModule
  ]
})
export class ProductsModule { }
