import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { ApiService } from 'src/app/services/api/api.service';
import { InfoService } from 'src/app/services/info/info.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';
import { SidenavService } from 'src/app/services/sidenav/sidenav.service';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {

  sku: string;
  productsLoader: boolean = true;
  product: Product;


  constructor(public navbar: NavbarService,
    private route: ActivatedRoute, 
    private router: Router,
    private info: InfoService,
    public nav: NavbarService,
    public sideNav: SidenavService,
    public treeNav: TreeService,
    public api: ApiService
  ) { }

  ngOnInit(): void {
    this.nav.hide();
    this.sideNav.hide();
    this.treeNav.hide();

    this.route.params.subscribe((params: Params) => {
      this.sku = params['sku'];
    });

    this.getDetails(this.sku);
  }

  getDetails(sku: string): void {
    this.productsLoader = true;
    this.info.setLoadingInfo('Loading product details...', 'info');
    this.api.GET(`products/${sku}`).subscribe({
      next:(res)=>{
        this.productsLoader = false;
        if (res.length > 0) {
          this.product = res[0];
        }
      }, error:(res)=>{
        this.info.setLoadingInfo('Failed to connect to the server: ' + res.message, 'success');
        this.productsLoader = false;
      }
    });
  }

}
