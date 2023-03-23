import { Component, OnInit, AfterViewInit, Injectable, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit, AfterViewInit {

	title = 'Derivative Prices';

	tab1Title = 'Simulation';

	displayTab1 = true;

	tab2Title = 'Graph Report';

	displayTab2 = false;

	tab: number = 2;

	dataDisplayResponseType: DataDisplayResponseType = new DataDisplayResponseType();

	displayedColumns: string[] = ['ticker', 'spotPrice', 'strikePrice', 'expiry', 'volatility', 'optionPrice', 'predictedPrice', 'timeTaken'];

	//public dataSource = new MatTableDataSource<DataDisplayResponse>([], 100);

	dataSource: any;

	private baseUrl: string = 'http://localhost:5080';

	message: string = '';

	errorMessage: string = '';

	@ViewChild(MatSort, {static: false}) set matSort(sort: MatSort) {
      if (this.dataSource && !this.dataSource.sort) {
          this.dataSource.sort = sort;
      }
  }

	@ViewChild(MatPaginator, {static: false}) set paginator(paginator: MatPaginator) {
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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	private loadInstruments(): void {
    this.uploadService.loadAllActiveInstruments().subscribe({
      next: (event: any) => {
        if (event instanceof HttpResponse) {
          this.dataDisplayResponseType = event.body;
          if(this.dataDisplayResponseType.errorMessage){
            this.errorMessage = this.dataDisplayResponseType.errorMessage;
          } else {
            this.dataSource = new MatTableDataSource(this.dataDisplayResponseType.dataDisplayResponse);
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
    if(tab === this.tab1Title) {
      this.displayTab1 = true;
      this.displayTab2 = false;
      this.loadInstruments();
    }

    if(tab === this.tab2Title) {
      this.displayTab1 = false;
      this.displayTab2 = true;
    }
  }
}

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
