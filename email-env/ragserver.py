from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.chat_models import ChatOpenAI

class FAISSRagServer:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model='models/embedding-001')
        self.recieved = {}

    def add_message(self, message, message_id):
        reciever = message['To']
        if reciever not in self.recieved:
            self.recieved[reciever] = FAISS(self.embeddings)
        self.recieved[reciever].add_texts([message.as_string()], ids=[message_id])

    def search(self, user, message):
        documents = self.recieved[user].similarity_search(message.as_string())
