from fastapi import FastAPI

app = FastAPI(title="BI Software Backend")

@app.get("/")
def root():
    return {"message": "BI Software Backend is running"}
