import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem){

    let alreadyExistsinCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;


    if(this.cartItems.length > 0){

      existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);

      alreadyExistsinCart = (existingCartItem !== undefined);
    }

    if(alreadyExistsinCart && existingCartItem){
      existingCartItem.quanity++;
    }
    else{
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let item of this.cartItems){
      totalPriceValue += item.quanity * item.unitPrice;
      totalQuantityValue += item.quanity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    console.log(totalPriceValue,totalQuantityValue)

  }

  decrementItem(item: CartItem) {
    item.quanity--;

    if(item.quanity === 0){
      this.remove(item);
    }
    else{
      this.computeCartTotals();
    }
  }

  remove(item: CartItem){
    const itemIndex = this.cartItems.findIndex( tempItem => tempItem.id === item.id);

    if(itemIndex > -1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }

}
