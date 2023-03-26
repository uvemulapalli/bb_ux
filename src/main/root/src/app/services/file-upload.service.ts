import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {

	private baseUrlForInitInstruments = 'http://localhost:5080';

	private baseUrlForInstrumentPricing = 'http://a8216942522c.mylabserver.com:8090';

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

	sendPricingRequestFromJson() {
    return this.httpClient.get("assets/pricingResponse.json");
  }
}
