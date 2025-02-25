import yfinance as yf
import pandas as pd
import pandas_ta as ta  # Optimized technical indicators
import joblib  # Caching API calls
import json
from textblob import TextBlob  # Sentiment Analysis
import sys  # Import sys module

CACHE_FILE = "stock_cache.pkl"

# Load cache if exists
try:
    stock_cache = joblib.load(CACHE_FILE)
except FileNotFoundError:
    stock_cache = {}

def fetch_stock_data(ticker: str):
    """Fetches maximum historical stock data with financials, indicators & sentiment analysis."""
    if ticker in stock_cache:
        print(f"Using cached data for {ticker}")
        return stock_cache[ticker]

    try:
        stock = yf.Ticker(ticker)

        # Fetch Maximum Historical Market Data
        hist = stock.history(period="max")  # Fetches all available data
        if hist.empty:
            raise ValueError(f"No historical data found for {ticker}")

        # Fetch financial metrics
        info = stock.info
        financials = {
            "Name": info.get("longName", ""),
            "Sector": info.get("sector", ""),
            "Market Cap": info.get("marketCap", ""),
            "P/E Ratio": info.get("trailingPE", ""),
            "EPS": info.get("trailingEps", ""),
            "Dividend Yield": info.get("dividendYield", ""),
            "Debt-to-Equity": info.get("debtToEquity", ""),
            "ROE": info.get("returnOnEquity", ""),
            "Beta (Volatility)": info.get("beta", ""),
        }

        # Calculate Technical Indicators
        indicators = calculate_indicators(hist)

        # Fetch recent news & perform sentiment analysis
        news = stock.news
        sentiments = analyze_sentiment(news) if news else []

        # Store results
        result = {
            "Financials": financials,
            "Indicators": indicators,
            "Sentiment": sentiments,
        }

        # Cache results
        stock_cache[ticker] = result
        joblib.dump(stock_cache, CACHE_FILE)

        return result

    except Exception as e:
        return {"error": str(e)}

def calculate_indicators(df):
    """Calculates RSI, MACD, and Bollinger Bands."""
    df["Returns"] = df["Close"].pct_change()

    # RSI (Relative Strength Index)
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    # MACD (Moving Average Convergence Divergence)
    df["MACD"] = df["Close"].ewm(span=12, adjust=False).mean() - df["Close"].ewm(span=26, adjust=False).mean()
    df["Signal Line"] = df["MACD"].ewm(span=9, adjust=False).mean()

    # Bollinger Bands (20-day SMA + Standard Deviations)
    df["SMA20"] = df["Close"].rolling(window=20).mean()
    df["Upper Band"] = df["SMA20"] + (df["Close"].rolling(window=20).std() * 2)
    df["Lower Band"] = df["SMA20"] - (df["Close"].rolling(window=20).std() * 2)

    return df[["RSI", "MACD", "Signal Line", "SMA20", "Upper Band", "Lower Band"]].iloc[-1].to_dict()

def analyze_sentiment(news_items):
    """Performs sentiment analysis on news headlines and classifies them."""
    sentiment_scores = []
    for item in news_items[:5]:  # Limit to 5 news articles
        headline = item.get("title", "")
        sentiment = TextBlob(headline).sentiment.polarity
        sentiment_label = (
            "Positive" if sentiment > 0.2 else
            "Negative" if sentiment < -0.2 else
            "Neutral"
        )
        sentiment_scores.append({"Headline": headline, "Sentiment": sentiment, "Label": sentiment_label})
    return sentiment_scores

# Example usage
if __name__ == "__main__":
    if len(sys.argv) > 1:
        ticker = sys.argv[1]
    else:
        ticker = "HDFCBANK.NS"  # Default ticker updated to HDFC Bank
    data = fetch_stock_data(ticker)
    print(json.dumps(data, indent=4))
