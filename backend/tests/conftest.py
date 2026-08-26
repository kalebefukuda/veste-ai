import os

# Importing app.main calls get_settings(), which fails collection without this.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://vesteai:vesteai@localhost:5432/vesteai_test",
)
