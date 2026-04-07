from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from agent.state import AgentState
from wallet_chatbot.tools import get_balance, get_transaction_history, get_spending_insights
from wallet_chatbot.prompts import SYSTEM_PROMPT

tools = [get_balance, get_transaction_history, get_spending_insights]
tool_node = ToolNode(tools)

model = ChatOpenAI(model="gpt-4o", temperature=0).bind_tools(tools)

def call_model(state: AgentState):
    """Calls the LLM with the current state."""
    messages = state["messages"]

    if not messages or messages[0].type != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + list(messages)
    
    response = model.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    """Determines if the flow should continue to tools or end."""
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

graph = workflow.compile()
