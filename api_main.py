from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from api.routes.process import router 

app = FastAPI(title="NeuraAI API")

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)