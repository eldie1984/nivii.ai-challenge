from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID
import logging
import os

from ollama import chat
from ollama import Client

from app.database.connection import get_db,get_schema
from app.metrics import record_portfolio_operation

from app.config import settings
ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
client = Client(host=ollama_host)

router = APIRouter()
logger = logging.getLogger(__name__)

class query(BaseModel):
    query: str

class QueryExplain(BaseModel):
    prompt: str
    query: str
    result: str

def ask_ollama(prompt: str) -> str:
    """Función auxiliar para interactuar con Ollama de forma limpia"""
    response = client.chat(
        model='sqlcoder:7b',
        messages=[{'role': 'user', 'content': prompt}]
    )
    return response['message']['content'].strip()

@router.post(
    "/query",
    status_code=201,
    summary="Execute model",
    response_description="The result of the model execution.",
)
async def create_portfolio(
    query: query,
    db=Depends(get_db)
):
    """Create a new portfolio for the authenticated user."""
    #schema = await get_schema()
    current_schema = settings.DB_SCHEMA
    
    if not current_schema:
        raise HTTPException(
            status_code=500, 
            detail="El esquema de la base de datos no está disponible en memoria."
        )
    prompt_template = (
        f"### Task\n"
        f"Generate a SQL query to answer the following question based on the schema provided.\n\n"
        f"### Database Schema\n"
        f"{current_schema}\n\n"
        f"### Rules\n"
        f"- Respond ONLY with the executable SQL query.\n"
        f"- Do not use markdown blocks (```sql) or any explanations.\n"
        f"- Only use the table 'product' and its exact columns.\n\n"
        f"### Question\n"
        f"{query.query} (Note: 'expensive' refers to unitary_price, 'best sold' refers to quantity)\n\n"
        f"### SQL Query\n"
    )
    # Primer intento
    sql_query = clean_sql_string(ask_ollama(prompt_template))
    try:
        # Intentamos validar con EXPLAIN en Postgres
        await db.execute(f"EXPLAIN {sql_query.rstrip(';')};")
        return {"sql": sql_query, "attempts": 1, "corrected": False}
        
    except Exception as first_error:
        # ¡El primer intento falló! Iniciamos el bucle de feedback
        error_message = str(first_error)
        logger.warning(f"Primer intento fallido. Error: {error_message}. Reintentando con feedback...")
        
        # 2. Construimos el prompt de feedback con el error real de Postgres
        feedback_prompt = (
            f"### Task\n"
            f"The previous SQL query you generated is invalid and caused a PostgreSQL syntax error. "
            f"Fix the query based on the error message and the schema provided.\n\n"
            f"### Database Schema\n{current_schema}\n\n"
            f"### Your Previous Invalid SQL\n"
            f"```sql\n{sql_query}\n```\n\n"
            f"### PostgreSQL Error Message\n"
            f"\"{error_message}\"\n\n"
            f"### Rules\n"
            f"- Fix the syntax error immediately.\n"
            f"- Remove any illegal characters, loose dashes, or markdown tags.\n"
            f"- Respond ONLY with the corrected, executable SQL query.\n\n"
            f"### Corrected SQL Query\n"
        )
        
        try:
            # Segundo intento: Ollama procesa su propio error
            corrected_sql = clean_sql_string(ask_ollama(feedback_prompt))
            
            # Volvemos a validar la nueva consulta con EXPLAIN
            await db.execute(f"EXPLAIN {corrected_sql.rstrip(';')};")
            
            logger.info("El modelo corrigió exitosamente la consulta en el segundo intento.")
            return {"sql": corrected_sql, "attempts": 2, "corrected": True}
            
        except Exception as second_error:
            # Si vuelve a fallar, levantamos la excepción para proteger los buffers de red
            logger.error(f"El segundo intento de auto-corrección también falló: {second_error}")
            raise HTTPException(
                status_code=422,
                detail=f"SQL generation failed after self-correction. Original error: {error_message}. Correction error: {str(second_error)}"
            )
    # try:
    #     response = client.chat(
    #         model='sqlcoder:7b',
    #         messages=[
    #             {'role': 'user', 'content': prompt_template}
    #         ]
    #     )
        
    #     sql_content = response['message']['content'].strip()
        
    #     # 1. Limpieza de tokens especiales del tokenizador (como <s> o </s>)
    #     sql_content = sql_content.replace("<s>", "").replace("</s>", "").strip()
    #     if sql_content.startswith("-"):
    #         sql_content = sql_content.lstrip("-").strip()
    #     elif sql_content.startswith("."):
    #         sql_content = sql_content.lstrip(".").strip()
    #     # 2. Limpieza de bloques markdown por seguridad
    #     if "```" in sql_content:
    #         sql_content = sql_content.replace("```sql", "").replace("```", "").strip()
    #     index = sql_content.find("SELECT")
    #     if index != -1:
    #         sql_content = sql_content[index:]
    #     if "SELECT" not in sql_content:
    #         logger.error("Error executing model: SELECT not found in query")
    #         record_portfolio_operation("parse sql", "error")
    #         raise HTTPException(status_code=504, detail="query")
    #     is_valid = await validate_and_clean_sql(sql_clean, db)
    
    #     if not is_valid:
    #         # Opción A: Lanzar un error controlado (Evita el problema del Content-Length)
    #         raise HTTPException(
    #             status_code=422,
    #             detail="El modelo generó una consulta SQL inválida para el esquema actual."
    #         )
            
    #     # 3. Si es válida, se retorna con total seguridad de que no romperá el backend
    #     return {"sql": sql_clean}
            
    #     #result = await db.fetchrow(sql_content)
    #     return{
    #         "query": sql_content,
    #         "response": "Query generated successfully"
    #     }
        
    # except Exception as e:
    #     logger.error(f"Error getting query: {e}")
    #     record_portfolio_operation("get query", "error")
    #     raise HTTPException(status_code=500, detail="query")


@router.post(
    "/execute",
    status_code=201,
    summary="Execute model",
    response_description="The result of the model execution.",
)
async def create_portfolio(
    query: query,
    db=Depends(get_db)
):
    try:    
        result = await db.fetchrow(query.query)
        return{
            "response": result
        }
        
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        record_portfolio_operation("execute query", "error")
        raise HTTPException(status_code=500, detail="query")


@router.post(
    "/explain",
    status_code=201,
    summary="Explain query results",
    response_description="The explanation of the query results.",
)
async def explain_query_results(query_explain: QueryExplain):
    """
    Toma la pregunta original del usuario y el JSON devuelto por Postgres
    para generar una respuesta humana y natural.
    """

    if not query_explain.result:
        return {"explanation": "No encontré ningún registro que coincida con tu consulta."}

    prompt_template = (
        f"### Task\n"
        f"You are a business intelligence assistant. Your job is to return a JSON object explaining the database results "
        f"to the user based on their original question.\n\n"
        f"### User Original Question\n"
        f"\"{query_explain.prompt}\"\n\n"
        f"### Database Result (JSON format)\n"
        f"{query_explain.result}\n\n"
        f"### Rules\n"
        f"1. Respond ONLY with a valid JSON object matching the exact template below.\n"
        f"2. Replace \"product_name\" with the actual product name found in the Database Result.\n"
        f"3. Do NOT include markdown blocks (```json), explanations, or extra text outside the JSON.\n\n"
        f"### JSON Output Template\n"
        f"{{\n"
        f"    \"explanation\": \"The most expensive product in our database is \\\"product_name\\\"\"\n"
        f"}}\n\n"
        f"### Final JSON Response\n"
        f"{{\n"
        f"    \"explanation\":" # <--- Dejamos el prompt abierto aquí para forzar el inicio de su respuesta
    )

    try:
        response = client.chat(
            model='sqlcoder:7b',
            messages=[{'role': 'user', 'content': prompt_template}]
        )
        
        # Recuperamos la respuesta completa reconstruyendo la llave de apertura del JSON
        raw_output = response['message']['content'].strip()
        
        # Por seguridad si el modelo repitió la llave de apertura o si solo completó el string
        if not raw_output.startswith("{"):
            full_json_str = f'{{\n    "explanation": {raw_output}'
            if not full_json_str.endswith("}"):
                full_json_str += "\n}"
        else:
            full_json_str = raw_output

        # Cargamos el string como JSON real de Python para validar que sea correcto
        import json
        json_data = json.loads(full_json_str)
        return json_data
        
    except Exception as e:
        # Fallback de seguridad por si el JSON falla al parsearse
        logger.error(f"JSON parsing failed: {e}")
        # Intentamos limpiar caracteres extraños del texto si el LLM metió ruido
        clean_text = response['message']['content'].replace("{", "").replace("}", "").replace('"explanation":', '').strip()
        return {"explanation": clean_text}


async def validate_and_clean_sql(sql_query: str, db_connection):
    """
    Valida si la consulta SQL es sintácticamente correcta usando EXPLAIN
    antes de enviarla al servicio que la ejecuta.
    """
    # Evitamos ejecutar strings vacíos
    if not sql_query:
        raise ValueError("La consulta generada está vacía.")

    # Limpiamos punto y coma final temporalmente para que calce bien con EXPLAIN si fuera necesario
    clean_query = sql_query.rstrip(";").strip()
    
    # Construimos la sentencia de validación
    explain_query = f"EXPLAIN {clean_query};"
    
    try:
        # Ejecutamos el EXPLAIN en Postgres. 
        # Si la consulta tiene errores de sintaxis, asyncpg lanzará una excepción aquí.
        await db_connection.execute(explain_query)
        
        # Si pasó el execute sin lanzar excepción, la consulta es 100% válida para Postgres
        return True
        
    except Exception as e:
        logger.error(f"SQL sintácticamente inválido detectado: {e} | Query: {clean_query}")
        return False


def clean_sql_string(raw_sql: str) -> str:
    """Tu función de limpieza (remoción de <s>, guiones iniciales y bloques ```)"""
    sql = raw_sql.replace("<s>", "").replace("</s>", "").strip()
    if sql.startswith("-"): sql = sql.lstrip("-").strip()
    if sql.startswith("."): sql = sql.lstrip(".").strip()
    if "```" in sql: sql = sql.replace("```sql", "").replace("```", "").strip()
    return sql

