import yfinance as yf
import json
import sys

def get_stock_data(ticker):
    try:
        data = yf.Ticker(ticker).history(period="1mo")
        return data.to_json()
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ticker = sys.argv[1]
    else:
        ticker = "RELIANCE.NS"  # Default ticker
    stock_data = get_stock_data(ticker)
    print(stock_data)