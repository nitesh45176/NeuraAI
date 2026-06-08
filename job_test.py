from api.job_store import*

job_id = create_job()
print("job_id =", job_id)

print("before update =", get_job(job_id))

update_job(job_id, status="processing")

print(get_job(job_id))

update_job(
    job_id,
    status="completed",
    result={"summary": "Meeting summary"}
)

print(get_job(job_id))