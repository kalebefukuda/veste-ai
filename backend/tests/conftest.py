import os

# Importing `app.main` builds the CORS middleware at module level, which calls
# `get_settings()`. Without DATABASE_URL that call raises during collection, so the
# suite dies before a single test runs and the error talks about configuration
# rather than tests.
#
# The field stays required on `Settings` on purpose: a deployment that forgets the
# secret must still fail loudly at boot instead of connecting somewhere unintended.
# This fallback only applies when nothing else set the variable, so CI can point the
# suite at a real database just by exporting it.
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://vesteai:vesteai@localhost:5432/vesteai_test",
)
