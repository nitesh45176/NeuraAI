import uuid

jobs ={}

def create_job():
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "pending",
        "result": None,
        "error": None,
        "chat_history": []
    }

    return job_id


def get_job(job_id):
    return jobs.get(job_id)
    

def update_job(job_id, status=None, result=None, error=None, chat_history=None):
    
    job = jobs.get(job_id)

    if not job:
        return 
    
    if status is not None:
        job["status"] = status

    if error is not None:
        job["error"] = error

    if result is not None:
        job["result"] = result

    if chat_history is not None:
        job["chat_history"] = chat_history


    