import { Component, Injectable, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatFormField, MatFormFieldControl } from "@angular/material/form-field";
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  
	title = 'Price Blotter Report';
  
	fileName = '';
  
	errorMessage = '';
  
	dataDisplayResponseType: DataDisplayResponseType = new DataDisplayResponseType();
	
	displayedColumns: string[] = ['TradeId', 'Spot', 'Strike', 'timeToMaturity', 'IR', 'Sigma', 'OptionPrice', 'timeTaken'];
	
	dataSource: any;
	
	private baseUrl = 'http://localhost:5080';
	
	selectedFiles?: FileList;
	
	currentFile?: File;
	
	progress = 0;
	
	message = '';
	
	fileInfos?: Observable<any>;
	
	constructor(private uploadService: FileUploadService) { }
	
	reset() {
		this.currentFile = undefined;
		this.selectedFiles = undefined;
	}
	
	selectFile(event: any): void {
		this.selectedFiles = event.target.files;
	}
	
	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}
	
	upload(): void {
	    this.progress = 0;
	    if (this.selectedFiles) {
	      const file: File | null = this.selectedFiles.item(0);
	      if (file) {
	        this.currentFile = file;
	        this.uploadService.upload(this.currentFile).subscribe({
	          next: (event: any) => {
	            if (event.type === HttpEventType.UploadProgress) {
	              this.progress = Math.round(100 * event.loaded / event.total);
	            } else if (event instanceof HttpResponse) {
					this.dataDisplayResponseType = event.body;
					if(this.dataDisplayResponseType.errorMessage){
						this.errorMessage = this.dataDisplayResponseType.errorMessage;
						this.reset();
					} else {
						this.dataSource = new MatTableDataSource(this.dataDisplayResponseType.dataDisplayResponse);
						this.dataSource.sort = this.sort;
          				this.dataSource.paginator = this.paginator;
						this.reset();
					}
	            }
	          },
	          error: (err: any) => {
	            console.log(err);
	            this.progress = 0;	
	            if (err.error && err.error.message) {
	              this.message = err.error.message;
	            } else {
	              this.message = 'Could not upload the file!';
	            }
	            this.currentFile = undefined;
	          }
	        });
	      }
	      this.selectedFiles = undefined;
	    }
	}

	@ViewChild(MatPaginator, {static: false})
	set paginator(value: MatPaginator) {
		this.dataSource['paginator'] = value;
	}

	@ViewChild(MatSort, {static: false})
	set sort(value: MatSort) {
		this.dataSource['sort'] = value;
	}

	
}

export class DataDisplayResponseType {
	errorMessage: string = '';
	dataDisplayResponse: any = [];
}

export class DataDisplayResponse {
	TradeId: string = '';
	Spot: string = '';
	Strike: string = '';
	timeToMaturity: string = '';
	IR: string = '';
	Sigma: string = '';
	OptionPrice: string = '';
	timeTaken: string = '';
}