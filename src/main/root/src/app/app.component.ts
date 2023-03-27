import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

export class DataDisplayResponseType {
  errorMessage: string = '';
  dataDisplayResponse: Array<any> = [];
}

export class DataDisplayResponse {
  ticker: string = '';
  contractSymbol: string = '';
  strikePrice: number = 0;
  expirationDate: string = '';
  volatility: number = 0;
  spotPrice: number = 0;
  // optionPrice: number = 0;
  predictedPrice: number = 0;
  timeTaken: number = 0;
}

export class PricingRequest {
  instrumentId: string = '';
  spotprice: Array<any> = [];
}

export class PricingResponseType {
  data: PricingResponse[] = [];
}

export class PricingResponse {
  instrumentId: string = '';
  predictionTime: number = 0;
  totalTime: number = 0;
  trainingTime: number = 0;
  values: Value[] = [];
}

export class Value {
  delta: number = 0;
  predictedPrice: number = 0;
  spotPrice: number = 0;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit, AfterViewInit {

  title = 'Derivative Pricing';

  tab1Title = 'Simulation';

  tab2Title = 'Instrument Pricing';

  tab3Title = 'Pricing Report';

  displayTab1 = true;

  displayTab2 = false;

  displayTab3 = false;

  tab: number = 3;

  isSimulationEnabled = false;

  dataDisplayResponseType: DataDisplayResponseType = new DataDisplayResponseType();

  pricingResponseType: PricingResponseType = new PricingResponseType();

  displayedColumns: string[] = [];

  dataSource: any;

  message: string = '';

  errorMessage: string = '';

  minSpotPrice = 0.0;

  maxSpotPrice = 0.0;

  form: FormGroup = new FormGroup({});

  sportPriceForm: FormGroup = new FormGroup({});

  @ViewChild(MatSort, { static: false }) set matSort(sort: MatSort) {
    if (this.dataSource && !this.dataSource.sort) {
      this.dataSource.sort = sort;
    }
  }

  @ViewChild(MatPaginator, { static: false }) set paginator(paginator: MatPaginator) {
    if (this.dataSource && !this.dataSource.paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(private uploadService: FileUploadService,
              public datepipe: DatePipe,
              private formBuilder: FormBuilder) {
    this.displayTab1 = true;
    this.displayTab2 = false;
    this.displayTab3 = false;
  }

  public onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    // console.log(tab);
    if (tab === this.tab1Title) {
      this.dataSource = undefined;
      this.displayTab1 = true;
      this.displayTab2 = false;
      this.loadInstruments();
    }
    if (tab === this.tab2Title) {
      this.dataSource = undefined;
      this.displayTab1 = false;
      this.displayTab2 = true;
      this.isSimulationEnabled = false;
    }
    if (tab === this.tab3Title) {
      this.dataSource = undefined;
      this.displayTab1 = false;
      this.displayTab2 = false;
      this.isSimulationEnabled = false;
    }
  }

  ngOnInit(): void {
    this.loadInstruments();
    this.form = this.formBuilder.group({
          contractId: [null, [Validators.required]],
          ticker: [null, [Validators.required]]
        });

    this.sportPriceForm = this.formBuilder.group({
                                    spotPrice: [null, [Validators.required]]
                                  });
  }

  public loadInstruments(): void {
    this.uploadService.loadAllActiveInstruments().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.dataDisplayResponseType = event.body;
          if (this.dataDisplayResponseType.errorMessage) {
            this.errorMessage = this.dataDisplayResponseType.errorMessage;
          } else {
            var response = this.dataDisplayResponseType.dataDisplayResponse;
            this.dataSource = new MatTableDataSource(response);
            this.displayedColumns = Object.keys(response[0]);
            // console.log('this.displayedColumns - ' + this.displayedColumns);
            this.dataSource.data.forEach((element: any) => {
              element.expirationDate = this.datepipe.transform(new Date(element.expirationDate), 'MM-dd-yyyy');
              // console.log('element - ' + JSON.stringify(element));
              element['baseValue'] = element.spotPrice;
              element['valid'] = 0;
            });
          }
        }
      },
      error: (err: any) => {
        console.log(err);
        if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Unable to load instruments !';
        }
      }
    });
  }

  ngAfterViewInit(): void { }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public toggle(event: MatSlideToggleChange) {
    this.isSimulationEnabled = event.checked;
    if(this.isSimulationEnabled) {
      this.startSimulation();
    } else {
      this.loadInstruments();
    }
  }

  public refresh() {
    this.isSimulationEnabled = false;
    this.dataSource.data = undefined;
    this.loadInstruments();
  }

  private startSimulation() {
    this.findMinMaxSpotPrice();
    setInterval(() => { this.processSimulation(); }, 10000);
  }

  private findMinMaxSpotPrice() {
    if (this.dataSource.data.length) {
      this.minSpotPrice = Math.min(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      this.maxSpotPrice = Math.max(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      console.log(" Min: " + this.minSpotPrice);
      console.log(" Max: " + this.maxSpotPrice);
    }
  }

  private processSimulation() {
    var tempList = this.dataSource.data;
    const shuffledList = tempList.sort(() => 0.5 - Math.random());
    let selected = shuffledList.slice(0, 250);
    let pricingRequests: Array<any> = [];
    selected.forEach((element: any) => {
      this.generateRandom(element);
      if(element) {
        pricingRequests.push(this.createPricingRequest(element));
      }
    });
    // console.log('Pricing Requests - ' + JSON.stringify(pricingRequests));
    this.sendPricingRequest(pricingRequests);
  }

  private createPricingRequest(element: any) {
    const pricingRequest: PricingRequest = new PricingRequest();
    pricingRequest.instrumentId = element.contractSymbol;
    pricingRequest.spotprice = element.spotPrice;
    return pricingRequest;
  }

  private generateRandom(objectToModify: any) {
    if(this.isSimulationEnabled) {
      let randomGen = Math.random() * ((9) - (1) + 1);
      let incDecValue = Math.floor(randomGen);
      objectToModify.spotPrice = parseFloat((objectToModify.spotPrice + (incDecValue % 2 === 0 ? -randomGen : randomGen)).toFixed(5));
    }
  }

  private sendPricingRequest(requestBody: any): void {
    this.uploadService.sendPricingRequest(requestBody).subscribe({
    // this.uploadService.sendPricingRequestFromJson().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.pricingResponseType = event.body;
        } else {
          this.pricingResponseType = event;
        }
        this.handlePricingResponse(this.pricingResponseType);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  private handlePricingResponse(pricingResponseType: any) {
    var responses: PricingResponseType[] = pricingResponseType.data;
    if (Array.isArray(responses)) {
      // console.log('Pricing Responses - ' + JSON.stringify(responses));
      responses.forEach((response: any) => {
        var values: Value[] = response.values;
        // console.log('values - ' + JSON.stringify(values));
        if (Array.isArray(values)) {
          values.forEach((value: any) => {
            if (value) {
              var predictedPrice = value.predictedPrice;
              var contractList = this.dataDisplayResponseType.dataDisplayResponse;
              let elementIndex = contractList.findIndex(x => x.contractSymbol === response.instrumentId);
              if(elementIndex > 0) {
                let elementToBeModified = this.dataSource.data[elementIndex];
                if(elementToBeModified) {
                  elementToBeModified.predictedPrice = predictedPrice;
                  elementToBeModified.timeTaken = response.predictionTime;
                  this.dataSource.data[elementIndex] = elementToBeModified;
                }
              }
            }
          });
        }
      });
    }
  }

  public getBackgroundColor(element: any, colName: any) {
    // element.predictedPrice = element.spotPrice;
    if (element.spotPrice < element.baseValue) {
      element['valid'] = -1;
      return '#FF6347';
    } else if (element.spotPrice > element.baseValue) {
      element['valid'] = 1;
      return '#90EE90';
    }
    return '';
  }

  ticker: string = ' - ';
  contractSymbol: string = ' - ';
  strikePrice: number = 0;
  expirationDate: string = '';
  volatility: number = 0;
  isContractSaved: boolean = false;
  spotPrice: number = 0;
  isSpotPriceSaved = false;

  public saveDetails(form: any) {
    //console.log('SUCCESS!! :-)\n\n' + JSON.stringify(this.form.value, null, 4));
    //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.form.value, null, 4));
    this.ticker = this.form.get('ticker')?.value;
    this.contractSymbol = this.form.get('contractId')?.value;
    this.strikePrice = 0.14;
    this.expirationDate = '03-26-2023';
    this.volatility = 0.28;
    this.isContractSaved = true;
    this.form.controls['ticker'].disable();
    this.form.controls['contractId'].disable();
  }

  public reset() {
    this.form = this.formBuilder.group({
          contractId: [null, [Validators.required]],
          ticker: [null, [Validators.required]]
        });
    this.sportPriceForm = this.formBuilder.group({
          spotPrice: [null, [Validators.required]]
        });
    this.isContractSaved = false;
    this.isSpotPriceSaved = false;
    this.spotPrice = 0;
  }

  public saveSpotPrice(sportPriceForm: any) {
    this.spotPrice = this.sportPriceForm.get('spotPrice')?.value;
    this.isSpotPriceSaved = true;
  }
}
