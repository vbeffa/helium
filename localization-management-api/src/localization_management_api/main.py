from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import psycopg2
import os
from pydantic import BaseModel

origins = [
    "http://localhost:3000"
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

## This is the endpoint to get the localizations for a project and locale
## It returns a JSON object with the localizations for the project and locale
@app.get("/localizations/{project_id}/{locale}")
async def get_localizations(project_id: str, locale: str):
    conn = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM localizations WHERE locale = %s", [locale])
    rows = cursor.fetchall()
    for row in rows:
        print(row[0], row[1])
    mapped = map(lambda row: { row[0]: row[1] }, rows)
    localizations = list(mapped)
    print(localizations)
    conn.close()

    resp = {
        "project_id": project_id,
        "locale": locale,
        "localizations": { row[0]: row[1] for row in rows }
    }
    print(resp)
    return resp

class Body(BaseModel):
    type: str
    value: str

@app.put("/localizations/{project_id}/{locale}/{key}")
async def put_localizations(project_id: str, locale: str, key: str, body: Body):
    print(project_id, locale, key, body)
    conn = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    cursor = conn.cursor()

    if (body.type == "key"):
        print("key")
        cursor.execute("UPDATE localizations SET key = %s WHERE key = %s", [body.value, key])
    else:
        print("value")
        cursor.execute("UPDATE localizations SET value = %s WHERE key = %s", [body.value, key])
    conn.commit()
    return 200;
