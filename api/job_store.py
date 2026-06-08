import uuid

jobs ={}

def create_job():
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "pending",
        "result": None,
        "error": None
    }

    return job_id

def update_job(job_id, status, result=None, error=None):
    jobs[job_id] = {
        "status": status,
        "result": result,
        "error": error
    }

def get_job(job_id):
    return jobs.get(job_id)
    
