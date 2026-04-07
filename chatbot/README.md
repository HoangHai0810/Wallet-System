# Wallet Chatbot 🤖

AI Agent project to support E-Wallet (Wallet System) users, built on **LangGraph** and **LangChain**.

## Features
- 💰 **Balance Inquiry**: Check real-time account balances.
- 📜 **Transaction History**: View lists of recent transactions.
- 📊 **Spending Insights**: Automated categorization and reporting of spending insights.
- 💬 **Intelligent Assistant**: Handles queries and supports users in English.

## Project Structure
- `src/agent/graph.py`: Defines the Agent's workflow state machine (Graph).
- `src/tools.py`: API tools connecting to the Wallet Backend.
- `src/prompts.py`: AI persona and system instructions.

## Installation & Setup
1. Install Python 3.11+ and [uv](https://github.com/astral-sh/uv).
2. Create a `.env` file from `.env.example` and fill in the details:
   ```bash
   OPENAI_API_KEY=sk-...
   WALLET_BACKEND_URL=http://your-backend-url
   WALLET_API_TOKEN=your-user-jwt-token
   ```
3. Install dependencies:
   ```bash
   uv sync
   ```
4. Run the Agent (e.g., via test script):
   ```bash
   uv run python tests/test_agent.py
   ```

## Roadmap
- [ ] Integrate Transfer Tool with OTP verification.
- [ ] Add RAG for deep product knowledge and policy support.
