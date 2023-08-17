import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopNavComponent } from './view/top-nav/top-nav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatLine, MatRippleModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthenticationModule } from './authentication/authentication.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { HomeComponent } from './home/home.component';
import { SidenavComponent } from './view/sidenav/sidenav.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatListModule} from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTreeModule } from '@angular/material/tree';
import { TreeComponent } from './view/tree/tree.component';
import { ParentPipe } from './pipes/parent.pipe';
import { UsersComponent } from './users/users.component'
import { MatTableModule } from '@angular/material/table';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenInterceptorService } from './services/interceptor/token-interceptor.service';
import { ProfileComponent } from './profile/profile.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BlockUIModule  } from 'ng-block-ui';
import { SettingsComponent } from './settings/settings.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MinisidenavComponent } from './view/minisidenav/minisidenav.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModuleModule } from './common-module/common-module.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SpeedTestModule } from 'ng-speed-test';

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    SidenavComponent,
    HomeComponent,
    TreeComponent,
    ParentPipe,
    UsersComponent,
    ProfileComponent,
    SettingsComponent,
    MinisidenavComponent,
  ],
  imports: [
    BrowserModule,
    AuthenticationModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatToolbarModule,
    MatButtonModule,
    MatRippleModule,
    MatGridListModule,
    HttpClientModule,
    MatMenuModule,
    MatSidenavModule,
    MatIconModule,
    MatBadgeModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatTableModule,
    MatTableExporterModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSortModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTooltipModule,
    MatTabsModule,
    BlockUIModule.forRoot(),
    MatAutocompleteModule,
    CommonModuleModule,
    MatCheckboxModule,
    SpeedTestModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
