import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {

	private baseUrlForInitInstruments = 'http://localhost:5080';

	private baseUrlForInstrumentPricing = 'http://20.251.49.126:8090';

	private baseUrlForGetOption = 'http://137.117.43.12:5000';

	private baseUrlForGeneratingTrainingSet = 'http://137.117.43.12:5001';

	private baseUrlForGeneratingReport = 'http://137.117.43.12:5001';

	constructor(private httpClient: HttpClient) {}

	loadAllActiveInstruments(): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.baseUrlForInitInstruments}/loadAllActiveInstruments`, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }

	sendPricingRequest(requestBody: any): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.baseUrlForInstrumentPricing}/model/price/instruments`, requestBody, {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }

	sendPricingRequestForScreen3(requestBody: any): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.baseUrlForInstrumentPricing}/model/price/instrument1`, requestBody, {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }

	sendPricingRequestFromJson() {
    return this.httpClient.get("assets/pricingResponse.json");
  }

	saveMarketData(ticker: string, contractSymbol: string): Observable<HttpEvent<any>> {
	  let getOptionUrl = this.baseUrlForGetOption + '/getOption?ticker=' + ticker + '&contractSymbol=' + contractSymbol;
    const req = new HttpRequest('GET', `${getOptionUrl}`, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }

	generateTrainingSet(requestBody: any): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.baseUrlForGeneratingTrainingSet}/train/GetTrainingSetForInstruments`, requestBody, {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }

	generateReport(requestBody: any): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.baseUrlForGeneratingReport}/train/generateTestSet`, requestBody, {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
      reportProgress: true,
      responseType: 'json'
    });
    return this.httpClient.request(req);
  }
}
