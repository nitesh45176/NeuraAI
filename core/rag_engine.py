import os
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from core.vectore_store import build_vector_Store, load_vector_Store, get_retriever


def get_llm():
    return ChatMistralAI(
        model = "mistral-small-latest",
        mistral_api_key = os.getenv("MISTRAL_API_KEY"),
        temperature=0.3)

def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])

def format_chat_history(history):
    return "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in history[-6:]]
    )

def build_rag_chain(knowledge: str):
    vector_Store = build_vector_Store(knowledge)
    retriever = get_retriever(vector_Store, k=4)

    
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an expert meeting assistant.

Use the previous conversation only to understand follow-up questions.
Use the meeting transcript context as the source of truth.

If the answer is not found in the meeting transcript context, say:
"I could not find this information in the meeting transcript."

Be concise, precise, and do not make up information.

Previous conversation:
{chat_history}

Meeting transcript context:
{context}
"""
    ),
    ("human", "{question}")
])

    ## full LCEL Rag pipeline
    rag_chain = (
        {
            "context": RunnableLambda(lambda x:x ["question"]) |  retriever| RunnableLambda(format_docs),    ## Ab runnableLambda me do chije hai :- question and chat_history and we want to give only question to the llm so will send question specifically using RunnableLambda
            "question": RunnableLambda(lambda x:x ["question"]),
             "chat_history": RunnableLambda(lambda x:  format_chat_history(x["chat_history"]))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


def load_rag_chain():
   
    vector_store = load_vector_Store()
    retriever = get_retriever(vector_store, k=4)     ## Then it creates a retriever that fetches the top 4 relevant chunks. 

    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an expert meeting assistant.

Use the previous conversation only to understand follow-up questions.
Use the meeting transcript context as the source of truth.

If the answer is not found in the meeting transcript context, say:
"I could not find this information in the meeting transcript."

Be concise, precise, and do not make up information.

Previous conversation:
{chat_history}

Meeting transcript context:
{context}
"""
    ),
    ("human", "{question}")
])

    rag_chain = (
        {
            "context": RunnableLambda(lambda x:x ["question"]) |  retriever| RunnableLambda(format_docs),    ## Ab runnableLambda me do chije hai :- question and chat_history and we want to give only question to the llm so will send question specifically using RunnableLambda
            "question": RunnableLambda(lambda x:x ["question"]),
             "chat_history": RunnableLambda(lambda x:  format_chat_history(x["chat_history"]))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


def ask_question(rag_chain, question:str, chat_history: list) -> str:
    print(f"Question : {question}")
    answer = rag_chain.invoke({
        "question": question,
        "chat_history": chat_history}
    )
    print(f"answer :{answer}")
    return answer