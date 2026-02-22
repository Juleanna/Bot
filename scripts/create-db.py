"""Create the botplatform database if it doesn't exist."""
import sys

try:
    import psycopg
except ImportError:
    print("[ERROR] psycopg not installed. Run install.bat first.")
    sys.exit(1)

# Read from environment or use defaults
import os
host = os.environ.get("POSTGRES_HOST", "localhost")
port = os.environ.get("POSTGRES_PORT", "5432")
user = os.environ.get("POSTGRES_USER", "postgres")
password = os.environ.get("POSTGRES_PASSWORD", "123456")
dbname = os.environ.get("POSTGRES_DB", "botplatform")

try:
    conn = psycopg.connect(
        f"host={host} port={port} user={user} password={password} dbname=postgres"
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
    if cur.fetchone():
        print(f'Database "{dbname}" already exists.')
    else:
        cur.execute(f'CREATE DATABASE "{dbname}"')
        print(f'Database "{dbname}" created successfully!')

    conn.close()
except Exception as e:
    print(f"[ERROR] Could not connect to PostgreSQL: {e}")
    print()
    print("Make sure PostgreSQL is running and credentials are correct.")
    print(f"  Host: {host}:{port}  User: {user}")
    print()
    print("You can create the database manually in pgAdmin or psql:")
    print(f"  CREATE DATABASE {dbname};")
    sys.exit(1)
