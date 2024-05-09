import email

from langchain_community.embeddings import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain_community.chat_models import ChatOpenAI

class FakeRagServer:
    def __init__(self):
        self.recieved = {}

    def add_message(self, message, message_id):
        self.recieved.setdefault(message.recipient, []).append(message_id)

    def search(self, user, message, num_documents=10):
        return self.recieved.get(user, [])


class FAISSRagServer:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(model='models/embedding-001')
        self.recieved = {}

    def add_message(self, message, message_id):
        reciever = message.recipient
        embedding = self.embeddings.embed_query(message.as_string())
        if reciever not in self.recieved:
            self.recieved[reciever] = FAISS.from_embeddings(
                    [('', embedding)],
                    metadatas=[dict(id=message_id)],
                    embedding=self.embeddings)
        else:
            self.recieved[reciever].add_embeddings(
                    [('', embedding)],
                    metadatas=[dict(id=message_id)])

    def search(self, user, message, num_documents=10):
        if user not in self.recieved:
            return []
        documents = self.recieved[user].similarity_search(message.as_string(), k=num_documents)
        ids = [doc.metadata['id'] for doc in documents]
        return ids

"""
rag = FAISSRagServer()

for i in range(10, 100, 10):
    message = email.message.EmailMessage()
    message.set_content(' '.join(str(j) for j in range(i+1)))
    message.recipient = 'hello@gmail.com'
    message.sender = 'bro@gmail.com'
    rag.add_message(message, i)

message = email.message.EmailMessage()
message.set_content('50')
message.recipient = 'hello@gmail.com'
message.sender = 'bro@gmail.com'
print (rag.search('hello@gmail.com', message))
"""

