import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { MyShopValidators } from 'src/app/validators/my-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {


  checkoutFormGroup!: FormGroup ;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  states: State[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router
  ) { }

  ngOnInit(): void {
    this.reviewCartDetails();

    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail,
          [Validators.required, 
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        state: new FormControl('',[
          Validators.required]),
        country: new FormControl('',[
          Validators.required]),
        zipCode: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        state: new FormControl('',[
          Validators.required]),
        country: new FormControl('',[
          Validators.required]),
        zipCode: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('',[
          Validators.required]),
        nameOnCard: new FormControl('',[
          Validators.required, 
          Validators.minLength(2), 
          MyShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',
          [Validators.required, 
            Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',
          [Validators.required, 
            Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),
    });

    //populate credit card years and months
    const startMonth: number = new Date().getMonth() + 1;

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    );

    //populate countries
    this.shopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );

  

  }

  get firstName(){ return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName');}
  get email(){ return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country');}

  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country');}

  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOncard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode');}
  
  onSubmit(){
   if(this.checkoutFormGroup?.invalid){
    this.checkoutFormGroup.markAllAsTouched();
    return;
   }

   //set up order
   let order = new Order();
   order.totalPrice = this.totalPrice;
   order.totalQuantity = this.totalQuantity;

   //get cart items
   const cartItems = this.cartService.cartItems;

   //create order items from cart items
   let orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item));

   //set up purchase
   let purchase = new Purchase();

   //populate purchase - customer
   purchase.customer = this.checkoutFormGroup.controls['customer'].value;


   //populate purchase - shipping address
   purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
   const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
   const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
   purchase.shippingAddress.state = shippingState.name;
   purchase.shippingAddress.country = shippingCountry.name;


   //populate purchase - billing address
   purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
   const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
   const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
   purchase.billingAddress.state = billingState.name;
   purchase.billingAddress.country = billingCountry.name;

   //populate purchase - order and order items
   purchase.order = order;
   purchase.orderItems = orderItems;

   //call API
   this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          
          //reset cart
          this.resetCart();

        },
        error: err => {
          alert(`error:  ${err.message}`);
        }
      }
   );

  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems =[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset form
    this.checkoutFormGroup.reset();

    //naviagte to home
    this.router.navigateByUrl("/products");

  }

  copyShippingAddresssToBillingAddress(event: any) {
    if(event?.target?.checked){
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

        this.billingAddressStates = this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

    }
  }

  handleMonthsAndYears() {
    const creditCardFormData = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormData?.value?.expirationYear);

    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );

  }

  getStates(formGroupName: string) {
    
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value?.country?.code;
    const countryName = formGroup?.value?.country?.name;

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else{
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

}



