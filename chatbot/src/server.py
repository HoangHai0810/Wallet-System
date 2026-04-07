import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agent.graph import graph
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

app = FastAPI(title="Wallet Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, authorization: str = Header(None)):
    try:
        if authorization:
            os.environ["WALLET_API_TOKEN"] = authorization.replace("Bearer ", "")
        
        initial_state = {"messages": [HumanMessage(content=request.message)]}
        
        result = graph.invoke(
            initial_state, 
            config={"configurable": {"thread_id": request.thread_id}}
        )
        
        if "messages" in result:
            last_msg = result["messages"][-1]
            if isinstance(last_msg, AIMessage):
                return ChatResponse(response=last_msg.content)
        
        raise HTTPException(status_code=500, detail="Failed to get AI response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
