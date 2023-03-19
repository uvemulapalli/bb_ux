package com.example.bbux.response;

public class DataDisplayResponse {
	
	private String TradeId;
	
	private String Spot;
	
	private String Strike;
	
	private String timeToMaturity;
	
	private String IR;
	
	private String Sigma;
	
	private String OptionPrice;
	
	private String timeTaken;

	public String getTradeId() {
		return TradeId;
	}

	public void setTradeId(String tradeId) {
		TradeId = tradeId;
	}

	public String getSpot() {
		return Spot;
	}

	public void setSpot(String spot) {
		Spot = spot;
	}

	public String getStrike() {
		return Strike;
	}

	public void setStrike(String strike) {
		Strike = strike;
	}

	public String getTimeToMaturity() {
		return timeToMaturity;
	}

	public void setTimeToMaturity(String timeToMaturity) {
		this.timeToMaturity = timeToMaturity;
	}

	public String getIR() {
		return IR;
	}

	public void setIR(String iR) {
		IR = iR;
	}

	public String getSigma() {
		return Sigma;
	}

	public void setSigma(String sigma) {
		Sigma = sigma;
	}

	public String getOptionPrice() {
		return OptionPrice;
	}

	public void setOptionPrice(String optionPrice) {
		OptionPrice = optionPrice;
	}

	public String getTimeTaken() {
		return timeTaken;
	}

	public void setTimeTaken(String timeTaken) {
		this.timeTaken = timeTaken;
	}
}