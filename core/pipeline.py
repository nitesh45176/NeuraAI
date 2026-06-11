
from dotenv import load_dotenv
load_dotenv()
from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain, ask_question


def run_pipeline(source: str, language:str = "english")->dict:

    chunks = process_input(source)
    transcript = transcribe_all(chunks, language=language)

    print(f"raw transcript {transcript[:300]}")

    title = generate_title(transcript)
    summary = summarize(transcript)

    action_item = extract_action_items(transcript)
    decisions = extract_key_decisions(transcript)
    questions = extract_questions(transcript)

    knowledge = f"""
TITLE:
{title}

SUMMARY:
{summary}

ACTION ITEMS:
{action_item}

KEY DECISIONS:
{decisions}

OPEN QUESTIONS:
{questions}

TRANSCRIPT:
{transcript}
"""

    rag_chain = build_rag_chain(knowledge)      

    return {
        "title": title,
        "transcript": transcript,
        "summary": summary,
        "action_items": action_item,
        "key_decisions": decisions,
        "open_questions": questions,
    }
    
    ## RAG chain is not returned because:-
     #  Your pipeline should return only the information the frontend needs:
     #  The RAG chain is an internal implementation detail, not API data.