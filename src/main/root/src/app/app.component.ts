import { Component, OnInit, AfterViewInit, Injectable, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, min, max } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatButtonModule } from "@angular/material/button";

export class DataDisplayResponseType {
  errorMessage: string = '';
  dataDisplayResponse: any = [];
}

export class DataDisplayResponse {
  ticker: string = '';
  spotPrice: number = 0;
  strikePrice: number = 0;
  expiry: number = 0;
  volatility: number = 0;
  optionPrice: number = 0;
  predictedPrice: number = 0;
  timeTaken: number = 0;
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

  displayedColumns: string[] = [];

  dataSource: any;

  private baseUrl: string = 'http://localhost:5080';

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
              //element['cellHighlightColor'] = 'default-cell';
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
    if(objectToModify.spotPrice < this.minSpotPrice) {
      this.generateRandom(objectToModify);
    }
    return objectToModify;
  }

  findMinMaxSpotPrice() {
    if (this.dataSource.data.length) {
      this.minSpotPrice = Math.min(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      this.maxSpotPrice = Math.max(...this.dataSource.data.map((item: any) => parseFloat(item.spotPrice)));
      console.log(" Min: " + this.minSpotPrice);
      console.log(" Max: " + this.maxSpotPrice);
      this.dataSource.data.forEach((record: any) => {
        let oldValue = record.spotPrice;
        setInterval(() => {
          record = this.generateRandom(record);
          this.handleHighlight(record, oldValue);
        }, 10000);
      });
    }
  }

  handleHighlight(row: any, thresholdValue: any) {
    let redColor = 'red-cell';
    let greenColor = 'green-cell';
    if (row.spotPrice < thresholdValue) {
      row['cellHighlightColor'] = redColor;
    } else {
      row['cellHighlightColor'] = greenColor;
    }
    row.predictedPrice = row.spotPrice;
  }
}


