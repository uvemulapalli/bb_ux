package com.example.bbux.response;

public class DataDisplayResponse {
	
	private String ticker;

	private String contractSymbol;
	
	private Double strikePrice;
	
	private String expirationDate;
	
	private Double volatility;

	private Double spotPrice;

	// private Double optionPrice;

	private Double predictedPrice;

	private Double timeTaken;

	public String getTicker() {
		return ticker;
	}

	public void setTicker(String ticker) {
		this.ticker = ticker;
	}

	public String getContractSymbol() {
		return contractSymbol;
	}

	public void setContractSymbol(String contractSymbol) {
		this.contractSymbol = contractSymbol;
	}

	public Double getStrikePrice() {
		return strikePrice;
	}

	public void setStrikePrice(Double strikePrice) {
		this.strikePrice = strikePrice;
	}

	public String getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(String expirationDate) {
		this.expirationDate = expirationDate;
	}

	public Double getVolatility() {
		return volatility;
	}

	public void setVolatility(Double volatility) {
		this.volatility = volatility;
	}

	public Double getSpotPrice() {
		return spotPrice;
	}

	public void setSpotPrice(Double spotPrice) {
		this.spotPrice = spotPrice;
	}

	/*public Double getOptionPrice() {
		return optionPrice;
	}

	public void setOptionPrice(Double optionPrice) {
		this.optionPrice = optionPrice;
	}*/

	public Double getPredictedPrice() {
		return predictedPrice;
	}

	public void setPredictedPrice(Double predictedPrice) {
		this.predictedPrice = predictedPrice;
	}

	public Double getTimeTaken() {
		return timeTaken;
	}

	public void setTimeTaken(Double timeTaken) {
		this.timeTaken = timeTaken;
	}
}