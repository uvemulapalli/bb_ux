package com.example.bbux.controller;

import java.io.File;
import java.util.List;

import com.example.bbux.response.DataDisplayResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.example.bbux.response.DataDisplayResponseType;
import com.example.bbux.service.DataFormatterService;
import com.example.bbux.service.DataTransferService;

@RestController
public class DataDisplayController {
	
	@Autowired
	private DataTransferService dataTransferServie;
	
	@Autowired
	private DataFormatterService dataFormatterService;
	
	@PostMapping(path = "/uploadFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<DataDisplayResponseType> fileUpload(@RequestParam("file") MultipartFile file) {
		DataDisplayResponseType dataDisplayResponseType = new DataDisplayResponseType();
		File myFile = this.dataTransferServie.transferFile(file);
		if(null != myFile) {
			dataDisplayResponseType.setDataDisplayResponse(this.dataFormatterService.getFormattedData(myFile));
			myFile.delete();
			return new ResponseEntity<DataDisplayResponseType>(dataDisplayResponseType, HttpStatus.OK);
		}
		dataDisplayResponseType.setErrorMessage("Unable to transfer file - " + file.getOriginalFilename());
		return new ResponseEntity<DataDisplayResponseType>(dataDisplayResponseType, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	@PostMapping(path = "/loadAllActiveInstruments", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<DataDisplayResponseType> loadAllActiveInstruments() {
		DataDisplayResponseType dataDisplayResponseType = new DataDisplayResponseType();
		List<DataDisplayResponse> dataDisplayResponses = this.dataFormatterService.loadAllActiveInstruments();
		if(null == dataDisplayResponses || dataDisplayResponses.isEmpty()) {
			dataDisplayResponseType.setErrorMessage("Unable to load instruments");
			return new ResponseEntity<DataDisplayResponseType>(dataDisplayResponseType, HttpStatus.INTERNAL_SERVER_ERROR);
		} else {
			dataDisplayResponseType.setDataDisplayResponse(dataDisplayResponses);
			return new ResponseEntity<DataDisplayResponseType>(dataDisplayResponseType, HttpStatus.OK);
		}
	}
}