package com.example.bbux.response;

public class DataDisplayResponse {
	
	private String ticker;
	
	private Float spotPrice;
	
	private Float strikePrice;
	
	private Float expiry;
	
	private Float volatility;

	private Float optionPrice;

	private Float predictedPrice;

	private Float timeTaken;

	public String getTicker() {
		return ticker;
	}

	public void setTicker(String ticker) {
		this.ticker = ticker;
	}

	public Float getSpotPrice() {
		return spotPrice;
	}

	public void setSpotPrice(Float spotPrice) {
		this.spotPrice = spotPrice;
	}

	public Float getStrikePrice() {
		return strikePrice;
	}

	public void setStrikePrice(Float strikePrice) {
		this.strikePrice = strikePrice;
	}

	public Float getExpiry() {
		return expiry;
	}

	public void setExpiry(Float expiry) {
		this.expiry = expiry;
	}

	public Float getVolatility() {
		return volatility;
	}

	public void setVolatility(Float volatility) {
		this.volatility = volatility;
	}

	public Float getOptionPrice() {
		return optionPrice;
	}

	public void setOptionPrice(Float optionPrice) {
		this.optionPrice = optionPrice;
	}

	public Float getPredictedPrice() {
		return predictedPrice;
	}

	public void setPredictedPrice(Float predictedPrice) {
		this.predictedPrice = predictedPrice;
	}

	public Float getTimeTaken() {
		return timeTaken;
	}

	public void setTimeTaken(Float timeTaken) {
		this.timeTaken = timeTaken;
	}
}