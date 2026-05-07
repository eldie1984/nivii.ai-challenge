from fastapi import APIRouter, HTTPException, Depends, Request, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import asyncio
from datetime import datetime, timedelta
import logging

from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Simple in-memory cache (in production, use Redis)
price_cache: Dict[str, Dict[str, Any]] = {}

class CryptoPrice(BaseModel):
    symbol: str
    name: str
    price: float
    change_24h: float
    change_7d: Optional[float] = None
    market_cap: Optional[float] = None
    volume_24h: Optional[float] = None
    last_updated: datetime

class PriceResponse(BaseModel):
    success: bool
    data: List[CryptoPrice]
    timestamp: datetime

async def fetch_coingecko_prices(symbols: List[str]) -> Dict[str, Dict[str, Any]]:
    """Fetch prices from CoinGecko API"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Convert symbols to lowercase for CoinGecko
            coin_ids = [symbol.lower() for symbol in symbols]
            
            response = await client.get(
                f"{settings.COINGECKO_API_URL}/simple/price",
                params={
                    "ids": ",".join(coin_ids),
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_7d_change": "true",
                    "include_market_cap": "true",
                    "include_24hr_vol": "true"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"CoinGecko API error: {response.status_code}")
                return {}
                
    except Exception as e:
        logger.error(f"Error fetching from CoinGecko: {e}")
        return {}

async def fetch_coinmarketcap_prices(symbols: List[str]) -> Dict[str, Dict[str, Any]]:
    """Fetch prices from CoinMarketCap API"""
    if not settings.COINMARKETCAP_API_KEY:
        return {}
        
    try:
        headers = {
            "X-CMC_PRO_API_KEY": settings.COINMARKETCAP_API_KEY,
            "Accept": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            response = await client.get(
                f"{settings.COINMARKETCAP_API_URL}/cryptocurrency/quotes/latest",
                params={"symbol": ",".join(symbols)}
            )
            
            if response.status_code == 200:
                return response.json().get("data", {})
            else:
                logger.error(f"CoinMarketCap API error: {response.status_code}")
                return {}
                
    except Exception as e:
        logger.error(f"Error fetching from CoinMarketCap: {e}")
        return {}

def get_mock_prices(symbols: List[str]) -> List[CryptoPrice]:
    """Return mock prices when APIs are unavailable"""
    mock_data = {
        "bitcoin": {"name": "Bitcoin", "price": 45000.0, "change_24h": 2.5},
        "ethereum": {"name": "Ethereum", "price": 3000.0, "change_24h": 1.8},
        "binance": {"name": "BNB", "price": 300.0, "change_24h": -0.5},
        "cardano": {"name": "Cardano", "price": 0.5, "change_24h": 3.2},
        "solana": {"name": "Solana", "price": 100.0, "change_24h": 5.1}
    }
    
    prices = []
    for symbol in symbols:
        symbol_lower = symbol.lower()
        if symbol_lower in mock_data:
            data = mock_data[symbol_lower]
            prices.append(CryptoPrice(
                symbol=symbol.upper(),
                name=data["name"],
                price=data["price"],
                change_24h=data["change_24h"],
                last_updated=datetime.utcnow()
            ))
    
    return prices

@router.get("/prices", response_model=PriceResponse)
async def get_prices(
    request: Request,
    symbols: Optional[str] = Query(None, description="Comma-separated list of cryptocurrency symbols"),
    limit: int = Query(10, ge=1, le=100, description="Number of cryptocurrencies to return")
):
    """
    Get cryptocurrency prices
    
    - **symbols**: Optional comma-separated list of symbols (e.g., "bitcoin,ethereum,binance")
    - **limit**: Maximum number of results to return (default: 10)
    """
    try:
        # Parse symbols
        if symbols:
            symbol_list = [s.strip().upper() for s in symbols.split(",")]
        else:
            # Default popular cryptocurrencies
            symbol_list = ["BITCOIN", "ETHEREUM", "BINANCE", "CARDANO", "SOLANA"]
        
        # Check cache
        cache_key = ",".join(sorted(symbol_list))
        now = datetime.utcnow()
        
        if cache_key in price_cache:
            cached_data = price_cache[cache_key]
            if (now - cached_data["timestamp"]).seconds < settings.CACHE_TTL_SECONDS:
                return PriceResponse(
                    success=True,
                    data=cached_data["prices"],
                    timestamp=cached_data["timestamp"]
                )
        
        # Try to fetch from APIs
        prices = []
        
        # Try CoinGecko first (free tier)
        coingecko_data = await fetch_coingecko_prices(symbol_list)
        
        if coingecko_data:
            for symbol in symbol_list:
                symbol_lower = symbol.lower()
                if symbol_lower in coingecko_data:
                    data = coingecko_data[symbol_lower]
                    prices.append(CryptoPrice(
                        symbol=symbol.upper(),
                        name=symbol.title(),  # Would need mapping for proper names
                        price=data.get("usd", 0.0),
                        change_24h=data.get("usd_24h_change", 0.0),
                        change_7d=data.get("usd_7d_change"),
                        market_cap=data.get("usd_market_cap"),
                        volume_24h=data.get("usd_24h_vol"),
                        last_updated=now
                    ))
        
        # If no data from APIs, use mock data
        if not prices:
            prices = get_mock_prices(symbol_list)
        
        # Update cache
        price_cache[cache_key] = {
            "prices": prices,
            "timestamp": now
        }
        
        return PriceResponse(
            success=True,
            data=prices[:limit],  # Apply limit
            timestamp=now
        )
        
    except Exception as e:
        logger.error(f"Error in get_prices: {e}")
        # Return mock data as fallback
        return PriceResponse(
            success=True,
            data=get_mock_prices(symbol_list if symbols else ["BITCOIN", "ETHEREUM"])[:limit],
            timestamp=datetime.utcnow()
        )

@router.get("/prices/{symbol}")
async def get_single_price(symbol: str, request: Request):
    """Get price for a single cryptocurrency"""
    return await get_prices(request, symbols=symbol, limit=1)

@router.get("/supported-symbols")
async def get_supported_symbols():
    """Get list of supported cryptocurrency symbols"""
    return {
        "success": True,
        "data": [
            {"symbol": "BTC", "name": "Bitcoin"},
            {"symbol": "ETH", "name": "Ethereum"},
            {"symbol": "BNB", "name": "BNB"},
            {"symbol": "ADA", "name": "Cardano"},
            {"symbol": "SOL", "name": "Solana"},
            {"symbol": "XRP", "name": "Ripple"},
            {"symbol": "DOT", "name": "Polkadot"},
            {"symbol": "DOGE", "name": "Dogecoin"},
            {"symbol": "AVAX", "name": "Avalanche"},
            {"symbol": "MATIC", "name": "Polygon"}
        ]
    }
