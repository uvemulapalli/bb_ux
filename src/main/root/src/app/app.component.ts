import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';

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
	
	blotterData: any = [];
	
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
						this.blotterData = this.dataDisplayResponseType.dataDisplayResponse;
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