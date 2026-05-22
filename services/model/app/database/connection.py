import asyncpg
from asyncpg import Pool
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    pool: Optional[Pool] = None

    @classmethod
    async def connect(cls, database_url: str) -> Pool:
        """Create database connection pool"""
        try:
            cls.pool = await asyncpg.create_pool(
                database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("Database connection pool created successfully")
            return cls.pool
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise

    @classmethod
    async def disconnect(cls):
        """Close database connection pool"""
        if cls.pool:
            await cls.pool.close()
            cls.pool = None
            logger.info("Database connection pool closed")

    @classmethod
    async def get_connection(cls):
        """Get a database connection from the pool"""
        if not cls.pool:
            raise RuntimeError("Database pool not initialized")
        return cls.pool
    @classmethod    
    async def get_db_schema(cls) -> str:
        # 1. Fetch tables and views
        tables_query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'product_service' AND table_type IN ('BASE TABLE', 'VIEW');
        """
        tables = await cls.pool.fetch(tables_query)
        
        # 2. Fetch columns and their data types
        columns_query = """
            SELECT table_name, column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'product_service'
            ORDER BY table_name, ordinal_position;
        """
        columns = await cls.pool.fetch(columns_query)
        
        # 3. Fetch foreign key constraints to establish relationships
        fk_query = """
            SELECT 
                kcu.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name, 
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'product_service';
        """
        foreign_keys = await cls.pool.fetch(fk_query)
        
        # Organize into a dictionary for formatting
        schema_dict = {}
        for table in tables:
            schema_dict[table['table_name']] = {'columns': [], 'foreign_keys': []}
            
        for col in columns:
            if col['table_name'] in schema_dict:
                schema_dict[col['table_name']]['columns'].append({
                    'name': col['column_name'],
                    'type': col['data_type'],
                    'nullable': col['is_nullable']
                })
                
        for fk in foreign_keys:
            if fk['table_name'] in schema_dict:
                schema_dict[fk['table_name']]['foreign_keys'].append({
                    'column': fk['column_name'],
                    'references': f"{fk['foreign_table_name']}({fk['foreign_column_name']})"
                })

        # 4. Format into a clean text block
        schema_str = "Database Schema:\n"
        for table_name, details in schema_dict.items():
            schema_str += f"Table: {table_name}\n"
            for col in details['columns']:
                null_flag = "" if col['nullable'] == 'YES' else " NOT NULL"
                schema_str += f"  - {col['name']} ({col['type']}){null_flag}\n"
            for fk in details['foreign_keys']:
                schema_str += f"  - FOREIGN KEY ({fk['column']}) REFERENCES {fk['references']}\n"
            schema_str += "\n"
            
        return schema_str

async def init_db():
    """Initialize database connection"""
    from app.config import settings
    await Database.connect(settings.DATABASE_URL)

async def get_db():
    """Dependency to get database connection"""
    return await Database.get_connection()


async def get_schema():
    """Dependency to get database schema"""
    return await Database.get_db_schema()