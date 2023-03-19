package com.example.bbux.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DataTransferService {
	
	private static final Logger logger = LoggerFactory.getLogger(DataTransferService.class);

	@Value("${file.upload-dir}")
	private String FILE_DIRECTORY;
	
	public File transferFile(final MultipartFile inputFile) {
		try {
			File myFile = new File(FILE_DIRECTORY + inputFile.getOriginalFilename());
			myFile.createNewFile();
			FileOutputStream fos =new FileOutputStream(myFile);
			fos.write(inputFile.getBytes());
			fos.close();
			return myFile;
		} catch(IOException ioException) {
			logger.error("Unable to transfer file {} - {}", inputFile.getOriginalFilename(), ioException);
		}		
		return null;		
	}

}
