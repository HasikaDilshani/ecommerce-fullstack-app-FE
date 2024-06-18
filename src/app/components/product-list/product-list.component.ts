import { keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {



  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
  previousCategoryId: number = 1;
  previousKeyword: string = '';

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.showProducts();
    });
  }

  showProducts(){
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
      this.handleListProducts();
    }
  }

  handleListProducts(){

    //check if id param is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      //get id param string and convert to number
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else{
      this.currentCategoryId = 1;
    }

    if(this.previousCategoryId !== this.currentCategoryId){
      this.thePageNumber = 1;
    }


    this.previousCategoryId = this.currentCategoryId;

    //now get products with category id
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                              this.thePageSize,
                                              this.currentCategoryId)
                                              .subscribe(
                                                data => {
                                                  this.processResults(data);
                                                }
                                                
                                              );
  }

  processResults(data: any){
    this.products = data._embedded.products;
    this.thePageNumber = data.page.number + 1;
    this.thePageSize = data.page.size;
    this.theTotalElements = data.page.totalElements;
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.showProducts();
  }

  handleSearchProducts(){
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    if(this.previousKeyword !== theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    this.productService.searchProductsPaginate(this.thePageNumber - 1,
      this.thePageSize,theKeyword).subscribe(
      data => {
        this.processResults(data);
      }
    );
  }

  addToCart(theProduct: Product) {
    console.log(theProduct.unitPrice);

    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }

}
