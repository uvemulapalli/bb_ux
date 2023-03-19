package com.example.bbux.response;

import java.io.Serializable;
import java.util.List;

public class DataDisplayResponseType implements Serializable {
	
	private static final long serialVersionUID = 1L;

	private List<DataDisplayResponse> dataDisplayResponse;
	
	private String errorMessage;

	public List<DataDisplayResponse> getDataDisplayResponse() {
		return dataDisplayResponse;
	}

	public void setDataDisplayResponse(List<DataDisplayResponse> dataDisplayResponse) {
		this.dataDisplayResponse = dataDisplayResponse;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}
}