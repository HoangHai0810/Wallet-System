import os
from dotenv import load_dotenv
from agent.graph import graph
from langchain_core.messages import HumanMessage

load_dotenv()

def chat_with_agent(query: str):
    print(f"\nUser: {query}")
    print("-" * 30)

    initial_state = {"messages": [HumanMessage(content=query)]}

    for event in graph.stream(initial_state, config={"configurable": {"thread_id": "1"}}):
        for node_name, output in event.items():
            if "messages" in output:
                last_msg = output["messages"][-1]
                if node_name == "agent":
                    if last_msg.tool_calls:
                        print(f"Agent is calling tools: {[t['name'] for t in last_msg.tool_calls]}")
                    else:
                        print(f"Agent: {last_msg.content}")
                elif node_name == "tools":
                    print(f"Tool Result: {last_msg.content}")

if __name__ == "__main__":
    if not os.getenv("OPENAI_API_KEY"):
        print("Please configure OPENAI_API_KEY in your .env file to run the test!")
    else:
        chat_with_agent("How much money do I have in my account?")

