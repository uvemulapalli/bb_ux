package com.example.bbux.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.example.bbux.response.DataDisplayResponse;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;
import org.springframework.util.ResourceUtils;

@Service
public class DataFormatterService {

	private static final Logger logger = LoggerFactory.getLogger(DataFormatterService.class);

	@Value("#{'${file.headers}'.split(',')}")
	private List<String> headerData;

	@Value("#{'${file.name}'}")
	private String fileName;

	private String[] extractHeadersFromCSV(final File inputFile) {
		BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(inputFile));
			String header = br.readLine();
			if (header != null) {
				return header.split(",");
			}
		} catch (FileNotFoundException fileNotFoundException) {
			logger.error("Unable to parse CSV - {} ", fileNotFoundException);
		} catch (IOException ioException) {
			logger.error("Unable to parse CSV - {} ", ioException);
		} finally {
			if (null != br) {
				try {
					br.close();
				} catch (IOException ioException) {
					logger.error("Unable to close bufferedReader - {} ", ioException);
				}
			}
		}
		logger.info("No CSV headers were found for the file {}", inputFile.getAbsoluteFile().getPath());
		return null;
	}

	private HeaderColumnNameTranslateMappingStrategy<DataDisplayResponse> mapHeaders(final String[] headersFromCSV) {
		if (headersFromCSV.length != this.headerData.size()) {
			logger.error(
					"Headers froom CSV file & Configuration didn't matched. Header from CSV {}, Headers from configuration {}",
					ArrayUtils.toString(headersFromCSV), StringUtils.join(this.headerData, ","));
		}

		Map<String, String> mapping = new HashMap<String, String>();
		for (int i = 0; i < headersFromCSV.length; i++) {
			mapping.put(headersFromCSV[i], this.headerData.get(i));
		}
		HeaderColumnNameTranslateMappingStrategy<DataDisplayResponse> strategy = new HeaderColumnNameTranslateMappingStrategy<DataDisplayResponse>();
		strategy.setType(DataDisplayResponse.class);
		strategy.setColumnMapping(mapping);
		return strategy;
	}

	public List<DataDisplayResponse> getFormattedData(final File inputFile) {
		String[] headersFromCSV = extractHeadersFromCSV(inputFile);

		if (null != headersFromCSV) {
			try {
				HeaderColumnNameTranslateMappingStrategy<DataDisplayResponse> strategy = mapHeaders(headersFromCSV);
				CSVReader csvReader = new CSVReader(new FileReader(inputFile));
				CsvToBean<DataDisplayResponse> csvToBean = new CsvToBean<DataDisplayResponse>();
				csvToBean.setMappingStrategy(strategy);
				csvToBean.setCsvReader(csvReader);
				return csvToBean.parse();
			} catch (FileNotFoundException fileNotFoundException) {
				logger.error("Unable to read CSV file {}, {}", inputFile.getAbsoluteFile().getAbsolutePath(), fileNotFoundException);
			}
		}
		return null;
	}

	@Value("classpath:instruments_1000.csv")
	Resource resourceFile;

	public List<DataDisplayResponse> loadAllActiveInstruments(){
		try {
			File inputFile = this.resourceFile.getFile();
			return getFormattedData(inputFile);
		} catch (IOException ioException) {
			logger.error("Unable to load CSV file from classpath.", ioException);
		}
		return null;
	}
}