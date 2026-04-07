import os
import httpx
from typing import Optional, Dict, Any, List
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("WALLET_BACKEND_URL", "http://localhost:8080")
API_TOKEN = os.getenv("WALLET_API_TOKEN", "")

@tool
def get_balance() -> str:
    """Gets the current balance and account information of the logged-in user's wallet."""
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    try:
        with httpx.Client() as client:
            response = client.get(f"{BACKEND_URL}/wallet/my", headers=headers)
            response.raise_for_status()
            data = response.json()
            return f"Your current balance is {data['balance']:,} VNĐ. Phone number: {data['phoneNumber']}."
    except Exception as e:
        return f"Error fetching balance: {str(e)}"

@tool
def get_transaction_history(page: int = 0, size: int = 5) -> str:
    """Retrieves the recent transaction history of the user."""
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    try:
        params = {"page": page, "size": size}
        with httpx.Client() as client:
            response = client.get(f"{BACKEND_URL}/wallet/history", headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            transactions = data.get("content", [])
            if not transactions:
                return "You have no recent transactions."
            
            res = "List of most recent transactions:\n"
            for tx in transactions:
                res += f"- {tx['createdAt']}: {tx['type']} {tx['amount']:,} VNĐ (Status: {tx['status']})\n"
            return res
    except Exception as e:
        return f"Error fetching transaction history: {str(e)}"

@tool
def get_spending_insights() -> str:
    """Analyzes the user's spending habits and provides a summary by category."""
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    try:
        params = {"page": 0, "size": 100}
        with httpx.Client() as client:
            response = client.get(f"{BACKEND_URL}/wallet/history", headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            transactions = data.get("content", [])
            
            if not transactions:
                return "Not enough data for spending analysis."

            categories = {}
            total_spent = 0
            for tx in transactions:
                if tx['type'] == 'TRANSFER' or tx['type'] == 'WITHDRAW':
                    cat = tx.get('category') or "Uncategorized"
                    amount = float(tx['amount'])
                    categories[cat] = categories.get(cat, 0) + amount
                    total_spent += amount
            
            if total_spent == 0:
                return "You have no spending transactions to categorize."

            res = f"Total recent spending: {total_spent:,.0f} VNĐ\nBreakdown by category:\n"
            for cat, amt in sorted(categories.items(), key=lambda x: x[1], reverse=True):
                percentage = (amt / total_spent) * 100
                res += f"- {cat}: {amt:,.0f} VNĐ ({percentage:.1f}%)\n"
            return res
    except Exception as e:
        return f"Error analyzing spending: {str(e)}"
