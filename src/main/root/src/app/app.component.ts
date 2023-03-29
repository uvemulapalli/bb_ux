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
  spotprice: any = '';
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

export class DataPoint {
  x: number = 0;
  y: number = 0;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit, AfterViewInit {


  public showLoading:boolean = true;
  public selectedFilteredContractData:DataDisplayResponse = new DataDisplayResponse();
  public userSearchText:string = '';
  public filteredContractData:any = [];
  title = 'Derivatives Pricing';

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

  addInstrumentform: FormGroup = new FormGroup({});

  spotPriceForm: FormGroup = new FormGroup({});

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
      this.showLoading = true;
      this.dataSource = undefined;
      this.displayTab1 = true;
      this.displayTab2 = false;
      this.loadInstruments();
      this.instrumentProgress = '';
      this.displayTab3 = false;
      this.resetTab2();
    }
    if (tab === this.tab2Title) {
      this.showLoading = false;
      this.dataSource = undefined;
      this.displayTab1 = false;
      this.displayTab2 = true;
      this.isSimulationEnabled = false;
      this.displayTab3 = false;
    }
    if (tab === this.tab3Title) {
      this.chartOptions.data[0].dataPoints = [];
      this.chartOptions.data[1].dataPoints = [];
      this.showLoading = false;
      this.dataSource = undefined;
      this.displayTab1 = false;
      this.displayTab2 = false;
      this.isSimulationEnabled = false;
      this.instrumentProgress = '';
      this.displayTab3 = true;
      this.resetTab2();
      this.filteredContractData = this.dataDisplayResponseType.dataDisplayResponse;
      this.clearUserSearchFilter();
    }
  }

  ngOnInit(): void {
    this.loadInstruments();
    this.addInstrumentform = this.formBuilder.group({
          contractId: [null, [Validators.required]],
          ticker: [null, [Validators.required]]
        });

    this.spotPriceForm = this.formBuilder.group({
                                    spotPrice: [null, [Validators.required]]
                                  });
  }

  public clearUserSearchFilter():void {
    this.userSearchText = '';
    this.filterData();
    this.selectedFilteredContractData = new DataDisplayResponse();
    this.chartOptions.data[0].dataPoints = [];
    this.chartOptions.data[1].dataPoints = [];
    if(this.chart && this.displayTab3) {
      this.chart.render();
    }
  }

  private calculateDiff(dateSent: any){
     let currentDate = new Date();
     dateSent = new Date(dateSent);
     return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) - Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) /(1000 * 60 * 60 * 24));
  }

  public generateReport():void {
    this.showLoading = true;
    this.chartOptions.data[0].dataPoints = [];
    this.chartOptions.data[1].dataPoints = [];
    this.chart.render();
    //selectedFilteredContractData
    var expiry: any = '';
    if(this.selectedFilteredContractData.expirationDate) {
      expiry = this.datepipe.transform(new Date(this.selectedFilteredContractData.expirationDate), 'yyyy-MM-dd');
      var differenceInYrs = this.calculateDiff(this.selectedFilteredContractData.expirationDate) / 365;
      console.log("Difference In Yrs. - " + differenceInYrs);
      expiry = 1 + differenceInYrs;
    }

    var strike: any = '';
    if(this.selectedFilteredContractData.strikePrice) {
      strike = this.selectedFilteredContractData.strikePrice / 100;
    }

    var spot: any = '';
    if(this.selectedFilteredContractData.spotPrice){
      spot = this.selectedFilteredContractData.spotPrice / 100;
    }

    let requestBody = {
      "instrumentId": this.selectedFilteredContractData.contractSymbol,
      "strikeprice": strike.toString(),
      "spotprice": spot,
      "volatility": this.selectedFilteredContractData.volatility.toString(),
      "expiry": expiry.toString()
    };
    //console.log(requestBody);
    // this.sendPricingRequestForScreen3(this.createSinglePricingRequest('AAPL230915C00111110', 2.11, '1.575', '0.74', '1.04'));
    this.sendPricingRequestForScreen3(requestBody);
  }

  public filterData():void {
    // console.log("change happend");
    // console.log(this.userSearchText);
    // this.chart.render();
    if (this.userSearchText.length >= 3) {
      this.filteredContractData = this.dataDisplayResponseType.dataDisplayResponse.filter((value:any) => {
        // console.log(value.contractSymbol)
        if (value.contractSymbol.toLowerCase().match(this.userSearchText.toLowerCase())) {
          return true;
        } else {
          return false;
        }
      });
      // console.log("this.filteredContractData")
      // console.log(this.filteredContractData)
    } else if (this.userSearchText.length == 0) {
      this.filteredContractData = this.dataDisplayResponseType.dataDisplayResponse;
    }
  }

  public showSelectedContract(index:number):void {
    // console.log(this.filteredContractData[index]);
    this.selectedFilteredContractData = this.filteredContractData[index];
    this.userSearchText = this.selectedFilteredContractData.contractSymbol;
    this.filterData();
    this.generateReport();
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
          this.showLoading = false;
        }
      },
      error: (err: any) => {
        this.showLoading = false;
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
    if(this.isSimulationEnabled) {
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
  newSpotPrice: number = 0;
  isSpotPriceSaved = false;
  predictedPrice: number = 0;
  screen2Message: string = '';

  public saveDetails(form: any) {
    this.showLoading = true;
    this.ticker = this.addInstrumentform.get('ticker')?.value;
    this.contractSymbol = this.addInstrumentform.get('contractId')?.value;
    this.trackInstrumentProgress('Adding instrument: Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol);
    this.uploadService.saveMarketData(this.ticker, this.contractSymbol).subscribe({
      next: (event: any) => {
      var dataDisplayResponses: Array<DataDisplayResponse> = [];
        if (event instanceof HttpResponse) {
          dataDisplayResponses = event.body;
        } else {
          dataDisplayResponses = event;
        }
        if (Array.isArray(dataDisplayResponses)) {
          var dataDisplayResponse: DataDisplayResponse = dataDisplayResponses[0];
          this.strikePrice = dataDisplayResponse.strikePrice;
          this.expirationDate = dataDisplayResponse.expirationDate;
          this.volatility = dataDisplayResponse.volatility;
          this.spotPrice = dataDisplayResponse.spotPrice;
          this.isContractSaved = true;
          this.addInstrumentform.controls['ticker'].disable();
          this.addInstrumentform.controls['contractId'].disable();
          this.trackInstrumentProgress('Added instrument: Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol +
                                        ', Strike Price - ' + this.strikePrice + ', Expiration Date - ' + this.expirationDate +
                                        ', Volatility - ' + this.volatility);
          this.showLoading = false;
          this.screen2Message = 'Successfully added instrument.';
        }
        this.showLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.trackInstrumentProgress('Failed to add instrument: Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol +
                                      ', Strike Price - ' + this.strikePrice + ', Expiration Date - ' + this.expirationDate +
                                      ', Volatility - ' + this.volatility);

        this.isContractSaved = false;
        this.showLoading = false;
      }
    });
  }

  public generateTrainingSet() {
    this.showLoading = true;
    var requestBody: Array<any> = [];
    const request:JSON = <JSON><unknown>{
            "ticker": this.contractSymbol,
            "strikeprice": JSON.stringify(this.strikePrice),
            "spotprice": JSON.stringify(this.spotPrice),
            "volatility": this.volatility,
            "expiry": this.expirationDate
          }
    requestBody.push(request);
    this.trackInstrumentProgress('Started generating training set for : Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol +
                                            ', Strike Price - ' + this.strikePrice + ', Expiration Date - ' + this.expirationDate +
                                            ', Volatility - ' + this.volatility);
    this.uploadService.generateTrainingSet(requestBody).subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          console.log('event - ' + JSON.stringify(event));
          this.trackInstrumentProgress('Completed generating training set for : Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol +
                                                  ', Strike Price - ' + this.strikePrice + ', Expiration Date - ' + this.expirationDate +
                                                  ', Volatility - ' + this.volatility);
          this.screen2TrainngDataMessage = 'Successfully generated training set.';
          this.isTrainingDataReady = true;
          this.showLoading = false;
        }
        this.showLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.trackInstrumentProgress('Completed generating training set for : Ticker - ' + this.ticker + ', Contract ID - ' + this.contractSymbol +
                                      ', Strike Price - ' + this.strikePrice + ', Expiration Date - ' + this.expirationDate +
                                      ', Volatility - ' + this.volatility);

        this.isContractSaved = false;
        this.showLoading = false;
      }
    });
  }

  screen2TrainngDataMessage: any = '';

  isTrainingDataReady: boolean = false;

  public resetTab2() {
    this.addInstrumentform = this.formBuilder.group({
          contractId: [null, [Validators.required]],
          ticker: [null, [Validators.required]]
        });
    this.spotPriceForm = this.formBuilder.group({
          spotPrice: [null, [Validators.required]]
        });
    this.isContractSaved = false;
    this.isSpotPriceSaved = false;
    this.spotPrice = 0;
    this.instrumentProgress = '';
    this.predictedPrice = 0;
    this.screen2Message = '';
    this.screen2TrainngDataMessage = '';
    this.isTrainingDataReady = false;
  }

  public saveSpotPrice(spotPriceForm: any) {
    this.newSpotPrice = this.spotPriceForm.get('spotPrice')?.value;
    this.trackInstrumentProgress('Adding spot price for instrument : Contract ID - ' + this.contractSymbol + ', Spot Price - ' + this.newSpotPrice);
    /* let pricingRequests: Array<any> = [];
    pricingRequests.push(this.createSinglePricingRequest(this.contractSymbol, this.newSpotPrice)); */
    this.sendPricingRequestForScreen2(this.createSinglePricingRequest(this.contractSymbol, this.newSpotPrice));
    this.isSpotPriceSaved = true;
    this.trackInstrumentProgress('Added spot price for instrument : Contract ID - ' + this.contractSymbol + ', Spot Price - ' + this.newSpotPrice);
  }

  private createSinglePricingRequest(contractSymbol: any, spotPrice: any) {
    const pricingRequest: PricingRequest = new PricingRequest();
    pricingRequest.instrumentId = contractSymbol;
    pricingRequest.spotprice = Number(spotPrice);
    return pricingRequest;
  }

  private sendPricingRequestForScreen3(requestBody: any): void {
    this.uploadService.sendPricingRequestForScreen3(requestBody).subscribe({
    // this.uploadService.sendPricingRequestFromJson().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.pricingResponseType = event.body;
        } else {
          this.pricingResponseType = event;
        }
        this.handlePricingResponseForSingleRequestScreen3(this.pricingResponseType);
      },
      error: (err: any) => {
        console.log(err);
        this.showLoading = false;
      }
    });
  }

  private sendPricingRequestForScreen2(requestBody: any): void {
    this.uploadService.sendPricingRequestForScreen2(requestBody).subscribe({
    // this.uploadService.sendPricingRequestFromJson().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.pricingResponseType = event.body;
        } else {
          this.pricingResponseType = event;
        }
        this.handlePricingResponseForSingleRequest(this.pricingResponseType);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  private handlePricingResponseForSingleRequest(pricingResponseType: any) {
    var responses: PricingResponseType[] = pricingResponseType.data;
    if (Array.isArray(responses)) {
      console.log('Pricing Responses - ' + JSON.stringify(responses));
      responses.forEach((response: any) => {
        var values: Value[] = response.values;
        // console.log('values - ' + JSON.stringify(values));
        if (Array.isArray(values)) {
          values.forEach((value: any) => {
            if (value) {
              if(Number(this.newSpotPrice) === value.spotPrice) {
                 this.predictedPrice = value.predictedPrice;
                 this.isSpotPriceSaved = true;
              }
            }
          });
        }
      });
    }
  }

  private handlePricingResponseForSingleRequestScreen3(pricingResponseType: any) {
    var responses: PricingResponseType[] = pricingResponseType;
    if (Array.isArray(responses)) {
      console.log('Pricing Responses - ' + JSON.stringify(responses));
      responses.forEach((response: any) => {
        var value: any = response;
        // console.log('value - ' + JSON.stringify(value));
        if (value) {
          this.chartOptions.data[0].dataPoints.push({x: value.spot * 100, y: value.bsprice * 100});
          this.chart.render();
          this.chartOptions.data[1].dataPoints.push({x: value.spot * 100, y: value.modelprice * 100});
          this.chart.render();
        }
      });
      this.showLoading = false;
    }
    // this.showLoading = false;
    // console.log('chart options');
    // console.log(this.chartOptions);
    this.chart.render();
  }

  private trackInstrumentProgress(message: string) {
    if(this.instrumentProgress) {
      this.instrumentProgress = this.instrumentProgress + "\n" + message;
    } else {
      this.instrumentProgress = message;
    }
  }

  instrumentProgress: string = '';

  chart: any;

  chartOptions = {
    animationEnabled: true,
    theme: "light2",
    title:{
      text: "Blocksholes vs Differential Model",
      fontSize: 25,
      // fontColor: "#7F00FF",
    },
    axisX:{
      title: "Spot Prices"
    },
    axisY: {
      title: "Model Prices"
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e: any) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      }
    },
    data: [{
    type: "line",
    lineColor: "blue",
    indexLabelFontColor: "blue",
    // legendMarkerType: "square",
    showInLegend: true,
    name: "Blocksholes Price",
    dataPoints: [
      { x: 1.11, y: 0.39 },
      { x: 1.12, y: 0.4 },
      { x: 1.13, y: 0.41 },
      { x: 1.61, y: 0.38 }
      ]
    }, {
    type: "line",
    lineDashType: "dash",
    lineThickness: 5,
    lineColor: "red", // #FF5733, #FFC300
    indexLabelFontColor: "red",
    // legendMarkerType: "square",
    showInLegend: true,
    name: "Predicted Price",
    dataPoints: [
      { x: 1.11, y: 0.39 },
      { x: 1.12, y: 0.4 },
      { x: 1.13, y: 0.41 },
      { x: 1.61, y: 0.38 }
    ]
    }]
  }
  public getChartInstance(event: any):void {
    // console.log("getChartInstance")
    // console.log(event)
    this.chart = event;
  }
}
