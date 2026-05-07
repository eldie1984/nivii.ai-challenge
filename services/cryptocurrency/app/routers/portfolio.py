from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.routers.prices import get_prices

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock portfolio data (in production, this would be stored in a database)
user_portfolios: Dict[str, Dict[str, Any]] = {}

class Holding(BaseModel):
    symbol: str
    name: str
    quantity: float
    average_buy_price: float
    current_price: Optional[float] = None
    value_usd: Optional[float] = None
    profit_loss: Optional[float] = None
    profit_loss_percentage: Optional[float] = None

class Portfolio(BaseModel):
    user_id: str
    holdings: List[Holding]
    total_value: float
    total_invested: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    last_updated: datetime

class AddHoldingRequest(BaseModel):
    symbol: str
    quantity: float
    buy_price: float

class UpdateHoldingRequest(BaseModel):
    quantity: Optional[float] = None
    buy_price: Optional[float] = None

def get_user_from_request(request: Request) -> str:
    """Extract user ID from request headers"""
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        # Fallback to username
        user_id = request.headers.get("X-User-Name", "anonymous")
    return user_id

async def calculate_portfolio_value(holdings: List[Holding]) -> List[Holding]:
    """Calculate current value and profit/loss for holdings"""
    if not holdings:
        return holdings
    
    # Get current prices
    symbols = [h.symbol for h in holdings]
    try:
        price_response = await get_prices(Request, symbols=",".join(symbols))
        current_prices = {p.symbol: p.price for p in price_response.data}
    except Exception as e:
        logger.error(f"Error fetching prices for portfolio calculation: {e}")
        current_prices = {}
    
    # Update holdings with current values
    updated_holdings = []
    for holding in holdings:
        current_price = current_prices.get(holding.symbol, holding.average_buy_price)
        value = holding.quantity * current_price
        profit_loss = value - (holding.quantity * holding.average_buy_price)
        profit_loss_percentage = (profit_loss / (holding.quantity * holding.average_buy_price)) * 100 if holding.quantity > 0 else 0
        
        updated_holding = holding.copy()
        updated_holding.current_price = current_price
        updated_holding.value_usd = value
        updated_holding.profit_loss = profit_loss
        updated_holding.profit_loss_percentage = profit_loss_percentage
        updated_holdings.append(updated_holding)
    
    return updated_holdings

@router.get("/portfolio")
async def get_portfolio(request: Request):
    """Get user's cryptocurrency portfolio"""
    try:
        user_id = get_user_from_request(request)
        
        if user_id not in user_portfolios:
            # Create empty portfolio for new users
            user_portfolios[user_id] = {
                "holdings": [],
                "total_invested": 0.0,
                "last_updated": datetime.utcnow()
            }
        
        portfolio_data = user_portfolios[user_id]
        holdings = [Holding(**h) for h in portfolio_data["holdings"]]
        
        # Calculate current values
        updated_holdings = await calculate_portfolio_value(holdings)
        
        # Calculate totals
        total_value = sum(h.value_usd or 0 for h in updated_holdings)
        total_invested = sum(h.quantity * h.average_buy_price for h in updated_holdings)
        total_profit_loss = total_value - total_invested
        total_profit_loss_percentage = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0
        
        portfolio = Portfolio(
            user_id=user_id,
            holdings=updated_holdings,
            total_value=total_value,
            total_invested=total_invested,
            total_profit_loss=total_profit_loss,
            total_profit_loss_percentage=total_profit_loss_percentage,
            last_updated=datetime.utcnow()
        )
        
        return {
            "success": True,
            "data": portfolio.dict()
        }
        
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve portfolio")

@router.post("/portfolio/holdings")
async def add_holding(holding_request: AddHoldingRequest, request: Request):
    """Add a new holding to the portfolio"""
    try:
        user_id = get_user_from_request(request)
        
        # Initialize user portfolio if it doesn't exist
        if user_id not in user_portfolios:
            user_portfolios[user_id] = {
                "holdings": [],
                "total_invested": 0.0,
                "last_updated": datetime.utcnow()
            }
        
        portfolio_data = user_portfolios[user_id]
        holdings = portfolio_data["holdings"]
        
        # Check if holding already exists
        existing_holding = None
        for i, h in enumerate(holdings):
            if h["symbol"].upper() == holding_request.symbol.upper():
                existing_holding = i
                break
        
        if existing_holding is not None:
            # Update existing holding (average the buy price)
            current_holding = holdings[existing_holding]
            total_quantity = current_holding["quantity"] + holding_request.quantity
            total_cost = (current_holding["quantity"] * current_holding["average_buy_price"]) + (holding_request.quantity * holding_request.buy_price)
            new_average_price = total_cost / total_quantity
            
            holdings[existing_holding] = {
                "symbol": holding_request.symbol.upper(),
                "name": holding_request.symbol.title(),  # Would need proper name mapping
                "quantity": total_quantity,
                "average_buy_price": new_average_price
            }
        else:
            # Add new holding
            holdings.append({
                "symbol": holding_request.symbol.upper(),
                "name": holding_request.symbol.title(),  # Would need proper name mapping
                "quantity": holding_request.quantity,
                "average_buy_price": holding_request.buy_price
            })
        
        portfolio_data["last_updated"] = datetime.utcnow()
        
        return {
            "success": True,
            "message": "Holding added successfully",
            "data": {
                "symbol": holding_request.symbol.upper(),
                "quantity": holding_request.quantity,
                "buy_price": holding_request.buy_price
            }
        }
        
    except Exception as e:
        logger.error(f"Error adding holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to add holding")

@router.put("/portfolio/holdings/{symbol}")
async def update_holding(symbol: str, update_request: UpdateHoldingRequest, request: Request):
    """Update an existing holding"""
    try:
        user_id = get_user_from_request(request)
        
        if user_id not in user_portfolios:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        portfolio_data = user_portfolios[user_id]
        holdings = portfolio_data["holdings"]
        
        # Find the holding
        holding_index = None
        for i, h in enumerate(holdings):
            if h["symbol"].upper() == symbol.upper():
                holding_index = i
                break
        
        if holding_index is None:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        # Update the holding
        holding = holdings[holding_index]
        if update_request.quantity is not None:
            holding["quantity"] = update_request.quantity
        if update_request.buy_price is not None:
            holding["average_buy_price"] = update_request.buy_price
        
        portfolio_data["last_updated"] = datetime.utcnow()
        
        return {
            "success": True,
            "message": "Holding updated successfully",
            "data": holding
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to update holding")

@router.delete("/portfolio/holdings/{symbol}")
async def delete_holding(symbol: str, request: Request):
    """Remove a holding from the portfolio"""
    try:
        user_id = get_user_from_request(request)
        
        if user_id not in user_portfolios:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        portfolio_data = user_portfolios[user_id]
        holdings = portfolio_data["holdings"]
        
        # Find and remove the holding
        holding_index = None
        for i, h in enumerate(holdings):
            if h["symbol"].upper() == symbol.upper():
                holding_index = i
                break
        
        if holding_index is None:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        removed_holding = holdings.pop(holding_index)
        portfolio_data["last_updated"] = datetime.utcnow()
        
        return {
            "success": True,
            "message": "Holding removed successfully",
            "data": removed_holding
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting holding: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete holding")

@router.get("/portfolio/performance")
async def get_portfolio_performance(request: Request):
    """Get portfolio performance metrics"""
    try:
        user_id = get_user_from_request(request)
        
        if user_id not in user_portfolios:
            return {
                "success": True,
                "data": {
                    "total_value": 0.0,
                    "total_invested": 0.0,
                    "total_profit_loss": 0.0,
                    "total_profit_loss_percentage": 0.0,
                    "holding_count": 0,
                    "best_performer": None,
                    "worst_performer": None
                }
            }
        
        portfolio_data = user_portfolios[user_id]
        holdings = [Holding(**h) for h in portfolio_data["holdings"]]
        
        if not holdings:
            return {
                "success": True,
                "data": {
                    "total_value": 0.0,
                    "total_invested": 0.0,
                    "total_profit_loss": 0.0,
                    "total_profit_loss_percentage": 0.0,
                    "holding_count": 0,
                    "best_performer": None,
                    "worst_performer": None
                }
            }
        
        # Calculate current values
        updated_holdings = await calculate_portfolio_value(holdings)
        
        # Calculate totals
        total_value = sum(h.value_usd or 0 for h in updated_holdings)
        total_invested = sum(h.quantity * h.average_buy_price for h in updated_holdings)
        total_profit_loss = total_value - total_invested
        total_profit_loss_percentage = (total_profit_loss / total_invested * 100) if total_invested > 0 else 0
        
        # Find best and worst performers
        best_performer = max(updated_holdings, key=lambda h: h.profit_loss_percentage or 0)
        worst_performer = min(updated_holdings, key=lambda h: h.profit_loss_percentage or 0)
        
        return {
            "success": True,
            "data": {
                "total_value": total_value,
                "total_invested": total_invested,
                "total_profit_loss": total_profit_loss,
                "total_profit_loss_percentage": total_profit_loss_percentage,
                "holding_count": len(updated_holdings),
                "best_performer": {
                    "symbol": best_performer.symbol,
                    "profit_loss_percentage": best_performer.profit_loss_percentage
                },
                "worst_performer": {
                    "symbol": worst_performer.symbol,
                    "profit_loss_percentage": worst_performer.profit_loss_percentage
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting portfolio performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance metrics")
