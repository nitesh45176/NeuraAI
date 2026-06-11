from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from api.job_store import update_job, create_job, get_job
from core.rag_engine import load_rag_chain, ask_question

from core.pipeline import run_pipeline

router = APIRouter()

class ProcessRequest(BaseModel):
    source: str
    language: str = "english"

class ChatRequest(BaseModel):
    query: str
    

def process_in_background(job_id: str, source: str, language: str):

    try:
        update_job(job_id, status="processing")

        result = run_pipeline(
            source=source,
            language=language,
        )

        update_job(job_id, status="completed", result=result)

    except Exception as e:
         update_job(
            job_id,
            status="failed",
            error=str(e)
        )


@router.post("/transcribe")
def transcribe_meeting(data: ProcessRequest, background_tasks: BackgroundTasks):

    job_id = create_job()

    background_tasks.add_task(
        process_in_background,
        job_id,
        data.source,
        data.language
    )

    return {
        "job_id": job_id,
        "status": "pending"
    }


@router.get("/transcribe/{job_id}")
def get_status(job_id: str):

    job = get_job(job_id)

    if not job:
        raise HTTPException(
        status_code=404,
        detail="Job Not Found"
)
    
    return {
        "job_id": job_id,
        "status": job["status"]
    }


@router.get("/summary/{job_id}")
def get_summary(job_id: str):

    job = get_job(job_id)

    if not job:
        raise HTTPException(
        status_code=404,
        detail="Job Not Found"
)
    
    if job["status"] != 'completed':
        return {
            "status": job["status"]
        }
    
    print(job["result"].keys())
    
    return job["result"]


@router.post("/chat/{job_id}")
def chat_with_meeting(
    job_id: str,
    data: ChatRequest
):

    job = get_job(job_id)

    if not job:
        raise HTTPException(
        status_code=404,
        detail="Job Not Found"
)

    if job["status"] != "completed":
        return {
            "error": "Meeting processing not completed"
        }

    history = job.get("chat_history", [])

    rag_chain = load_rag_chain()

    answer = ask_question(
        rag_chain,
        data.query,
        history
    )
    
    history.append({"role": "user", "content": data.query})
    history.append({"role": "assistant", "content": answer})

    update_job(job_id, chat_history=history)

    return {
        "answer": answer,
        "chat_history": history
    }


@router.get("/chat/${job_id}")
def get_chat_history(job_id: str):

    job = get_job(job_id)

    if not job:
        raise HTTPException(
            status_code= 404,
            detail="Job not found"
        )
    
    return {"chat_history": job.get("chat_history", [])}