import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'authentication', loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule) },
  { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },
  { path: 'users', component: UsersComponent },
  { path: 'users', component: UsersComponent },
  { path: 'profile/:id', component: ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
