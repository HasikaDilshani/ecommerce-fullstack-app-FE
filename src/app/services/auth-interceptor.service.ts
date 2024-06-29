import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Observable, from, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>>{
    
    //add access token for secured endpoints
    const theEndpoint = environment.shopApiUrl + '/orders';
    const securedEndpoints = [theEndpoint];

    if(securedEndpoints.some(url => request.urlWithParams.includes(url))){
      const accessToken = this.oktaAuth.getAccessToken();

      //clone request and add new header
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }
    const response = await next.handle(request).toPromise();
  if (!response) {
    throw new Error("Expected an HttpEvent, but got undefined");
  }
  
  return response;
    
  }
}
