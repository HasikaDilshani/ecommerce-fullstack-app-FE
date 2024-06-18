import { CartItem } from "./cart-item";

export class OrderItem {
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: number;

    constructor(cartItem: CartItem){
        this.imageUrl = cartItem.imageUrl;
        this.quantity = cartItem.quanity;
        this.unitPrice = cartItem.unitPrice;
        this.productId = cartItem.id;
    }
}
