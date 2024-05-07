from langchain_community.embeddings import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain_community.chat_models import ChatOpenAI

import sys
import pandas as pd
import numpy as np
import warnings
import os
import email
import email.message
from util import output, LogPriority

np.random.seed(0)

class RandomModel:
    def __init__(self):
        self.rng = np.random.default_rng(12345)

    def respond(self, message, context):
        if self.rng.integers(3) == 0:
            new_message = email.message.EmailMessage()
            new_message.set_content(message.get_content())
            new_message["To"] = message["From"]
            new_message["From"] = message["To"]
            return new_message

template = """
You are an email assistant, here are some emails from my email application, use them as context.
Context:
{context}

Below is a newly recieved email, please respond with the appropriate action, either
"Ignore", "Forward to: <email address>", "Reply with: <new message>", or "Send to <email address>: <new message>".
Only respond with one of these options. Here is the new email:
{newemail}
Action:
"""

class ActionModel:
    def __init__(self):
        self.prompt = ChatPromptTemplate.from_template(template)
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.1)

    def respond(self, message, context):
        context = [msg.as_string() for msg in context]
        context = "\n\n\n".join(context)
        prompt = self.prompt.format(context=context, newemail=message)
        output("Model Prompt:", color="purple", priority=LogPriority.DEBUG)
        output(prompt, priority=LogPriority.DEBUG)
        
        response = self.llm.invoke(prompt)
        output("Model Response:", color="purple", priority=LogPriority.DEBUG)
        output(response.content, priority=LogPriority.DEBUG)
        response = response.content
        new_message = None

        if response.startswith("Forward to:"):
            output("Model Action:", "Foward", color="purple", priority=LogPriority.LOW)
            new_dest = response.replace("Forward to:", "").strip()
            new_message = email.message.EmailMessage()
            new_message.set_content(message.get_content())
            new_message["To"] = new_dest
            new_message["From"] = message["To"]

        if response.startswith("Reply with:"):
            output("Model Action:", "Reply", color="purple", priority=LogPriority.LOW)
            response = response.replace("Reply with:", "")
            new_message = email.message.EmailMessage()
            new_message.set_content(response)
            new_message["To"] = message["From"]
            new_message["From"] = message["To"]

        if response.startswith("Send to"):
            output("Model Action:", "Send", color="purple", priority=LogPriority.LOW)
            response = response.replace("Send to", "")
            new_dest, response = response.strip().split(maxsplit=1)
            new_message = email.message.EmailMessage()
            new_message.set_content(response)
            new_message["From"] = message["To"]
            new_message["To"] = new_dest

        return new_message