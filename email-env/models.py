from langchain_community.embeddings import OpenAIEmbeddings
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain_community.chat_models import ChatOpenAI

import sys
from datetime import datetime
import pandas as pd
import numpy as np
import warnings
import os
import email
import email.message
from message import EmailMessage, ModelPrompt
from util import output, LogPriority

np.random.seed(0)

class RandomModel:
    def __init__(self):
        self.rng = np.random.default_rng(12345)

    def respond(self, message, context):
        if self.rng.integers(3) == 0:
            new_message = message.copy()
            new_message.recipient = message.sender
            new_message.sender = message.recipient
            return new_message

# You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture. 
# You are Gemini, a large language model trained by Google, based on the MoE Transformer architecture. 

template = """
You are Gemini, a large language model trained by Google, based on the MoE Transformer architecture. 

Knowledge cutoff: 2023-04 
Current date: {date}
Image input capabilities: enabled 
Retreival augmented generation capabilities: enabled

Based on the user prompt, the following content was retrieved from the RAG database:
{context}
End of RAG context.

End of system prompt. What follows is the user prompt:

I need you to act as my email assistant, use the emails from my email application as context. 
Below is a newly recieved email, please respond with the appropriate action, either
"Ignore", "Forward to: <email address>", "Reply with: <new message>", or "Send to <email address>: <new message>".
Only respond with one of these options. Here is the new email:
{newemail}

Action:
"""

class ActionModel:
    def __init__(self):
        self.prompt = ModelPrompt(template)
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.1)

    def respond(self, message, context):
        context = [msg.as_string() for msg in context]
        context = "\n\n\n".join(context)
        
        prompt = self.prompt.format(
            date=datetime.today().strftime("%Y-%m-%d %H:%M:%S"),
            context=context,
            newemail=message.as_string(),
        )
        output("Model Prompt:", color="purple", priority=LogPriority.DEBUG)
        output(prompt, priority=LogPriority.DEBUG)
        
        response = self.llm.invoke(prompt)
        output("Model Response:", color="purple", priority=LogPriority.DEBUG)
        output(response.content, priority=LogPriority.DEBUG)
        response = response.content
        new_message = None

        if response.startswith("Forward to:"):
            output("Model Action:", "Foward", color="purple", priority=LogPriority.LOW)
            new_message = message.new_message(recipient=new_dest, generated=True)

        if response.startswith("Reply with:"):
            output("Model Action:", "Reply", color="purple", priority=LogPriority.LOW)
            response = response.replace("Reply with:", "")
            new_message = message.new_message(content=response, generated=True)

        if response.startswith("Send to"):
            output("Model Action:", "Send", color="purple", priority=LogPriority.LOW)
            response = response.replace("Send to", "")
            new_dest, response = response.strip().split(':', maxsplit=1)
            new_dest, response = new_dest.strip(), response.strip()
            new_message = message.new_message(recipient=new_dest, content=response)

        return new_message
