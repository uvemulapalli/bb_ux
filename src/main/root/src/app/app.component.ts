import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FileUploadService } from 'src/app/services/file-upload.service';

export class DataDisplayResponseType {
  errorMessage: string = '';
  dataDisplayResponse: any = [];
}

export class DataDisplayResponse {
  ticker: string = '';
  contractSymbol: string = '';
  spotPrice: number = 0;
  strikePrice: number = 0;
  expirationDate: string = '';
  volatility: number = 0;
  optionPrice: number = 0;
  predictedPrice: number = 0;
  timeTaken: number = 0;
}

export class PricingResponseType {
  data: any = [];
}

export class PricingResponse {
  instrumentId: string = '';
  predictionTime: number = 0;
  totalTime: number = 0;
  trainingTime: number = 0;
  values: any = [];
}

export class PricingValue {
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

  title = 'Derivative Prices';

  tab1Title = 'Simulation';

  tab2Title = 'Graph';

  displayTab1 = true;

  displayTab2 = false;

  tab: number = 2;

  dataDisplayResponseType: DataDisplayResponseType = new DataDisplayResponseType();

  pricingResponseType: PricingResponseType = new PricingResponseType();

  displayedColumns: string[] = [];

  dataSource: any;

  message: string = '';

  errorMessage: string = '';

  minSpotPrice = 0.0;

  maxSpotPrice = 0.0;

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

  constructor(private uploadService: FileUploadService) {
    this.displayTab1 = true;
    this.displayTab2 = false;
  }

  ngOnInit(): void {
    this.loadInstruments();
  }

  ngAfterViewInit(): void { }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private loadInstruments(): void {
    this.uploadService.loadAllActiveInstruments().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.dataDisplayResponseType = event.body;
          if (this.dataDisplayResponseType.errorMessage) {
            this.errorMessage = this.dataDisplayResponseType.errorMessage;
          } else {
            var response = this.dataDisplayResponseType.dataDisplayResponse;
            this.dataSource = new MatTableDataSource(response);
            this.dataSource.data.forEach((element: any) => {
              if (element.expirationDate === 'expirationDate') {
                element['expirationDate'] = new Date(element.expirationDate);
              }
            });
            this.displayedColumns = Object.keys(response[0]);
            this.findMinMaxSpotPrice();
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

  onChange(event: MatTabChangeEvent) {
    const tab = event.tab.textLabel;
    console.log(tab);
    if (tab === this.tab1Title) {
      this.dataSource = undefined;
      this.displayTab1 = true;
      this.displayTab2 = false;
      this.loadInstruments();
    }

    if (tab === this.tab2Title) {
      this.displayTab1 = false;
      this.displayTab2 = true;
    }
  }

  generateRandom(objectToModify: any) {
    let randomGen = Math.random() * ((9) - (1) + 1);
    let incDecValue = Math.floor(randomGen);
    objectToModify.spotPrice = parseFloat((objectToModify.spotPrice + (incDecValue % 2 === 0 ? -randomGen : randomGen)).toFixed(5));
    return objectToModify;
  }

  findMinMaxSpotPrice() {
    if (this.dataSource.data.length) {
      this.minSpotPrice = Math.min(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      this.maxSpotPrice = Math.max(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      console.log(" Min: " + this.minSpotPrice);
      console.log(" Max: " + this.maxSpotPrice);
      /* this.dataSource.data.forEach((record: any) => {
        record['baseValue'] = record.spotPrice;
        setInterval(() => { record = this.generateRandom(record); }, 10000);
      }); */
      var tempList = this.dataSource.data;
      const shuffledList = tempList.sort(() => 0.5 - Math.random());
      let selected = shuffledList.slice(0, 10);
      selected.forEach((record: any) => {
        record['baseValue'] = record.spotPrice;
        setInterval(() => { record = this.generateRandom(record); }, 10000);
      });
    }
  }

  getBackgroundColor(element: any, colName: any) {
    if (colName === 'spotPrice') {
      //element.predictedPrice = element.spotPrice;
      this.sendPricingRequest(element.contractSymbol, element.spotPrice);
      if (element.spotPrice < element.baseValue) {
        return '#FF6347';
      } else if (element.spotPrice > element.baseValue) {
        return '#90EE90';
      }
    }
    return '';
  }

  getBorderRadius(element: any, colName: any) {
    if (colName === 'spotPrice') {
     return '5px';
    }
    return '';
  }

  private sendPricingRequest (instrumentId: string, spotprice: number): void {
    var requestBody = [{"instrumentId" : instrumentId, "spotprice": spotprice}];
    // this.uploadService.sendPricingRequest(requestBody).subscribe({
    this.uploadService.sendPricingRequestFromJson().subscribe({
     next: (event: any) => {
       if (event instanceof HttpResponse) {
         this.pricingResponseType = event.body;
         this.handlePricingResponse(this.pricingResponseType);
       }
     },
     error: (err: any) => {
       console.log(err);
     }
    });
  }
  private handlePricingResponse(pricingResponseType: any) {
    var responses = this.pricingResponseType.data;
    if(responses) {
      var response = responses[0];
      if(response) {
        var pricingValues = response.values;
        if(pricingValues) {
          var predictedPrice = pricingValues[0].predictedPrice;
          let elementIndex = this.dataSource.data.findIndex(element => {element.contractSymbol == response.instrumentId});
          let elementToBeModified = this.dataSource.data[elementIndex];
          elementToBeModified.predictedPrice = predictedPrice;
          elementToBeModified.timeTaken = response.predictionTime;
          this.dataSource.data[elementIndex] = elementToBeModified;
      }
    }
  }
}
