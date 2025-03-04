import yfinance as yf
import requests
import json

NEWS_API_KEY = "your_news_api_key"  # Replace with your News API key
AMFI_API_URL = "https://api.mfapi.in/mf"

def get_stock_data(ticker):
    stock = yf.Ticker(ticker)
    return {
        "name": stock.info.get("shortName"),
        "current_price": stock.info.get("regularMarketPrice"),
        "day_high": stock.info.get("dayHigh"),
        "day_low": stock.info.get("dayLow"),
        "market_cap": stock.info.get("marketCap"),
        "pe_ratio": stock.info.get("trailingPE"),
    }

def get_stock_news(ticker):
    url = f"https://newsapi.org/v2/everything?q={ticker}&apiKey={NEWS_API_KEY}"
    response = requests.get(url)
    data = response.json()
    return [{"title": article["title"], "url": article["url"]} for article in data.get("articles", [])[:5]]

def get_mutual_fund_nav(scheme_code):
    response = requests.get(f"{AMFI_API_URL}/{scheme_code}")
    if response.status_code == 200:
        data = response.json()
        return {"fund_name": data["meta"]["fund_house"], "nav": data["data"][0]["nav"]}
    return None

if __name__ == "__main__":
    stock_ticker = "RELIANCE.NS"
    mf_scheme_code = "102885"  # Example mutual fund scheme code
    print("Stock Data:", get_stock_data(stock_ticker))
    print("Stock News:", get_stock_news(stock_ticker))
    print("Mutual Fund NAV:", get_mutual_fund_nav(mf_scheme_code))