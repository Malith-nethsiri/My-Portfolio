import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
# Use the async engine creator instead of the synchronous one
from sqlalchemy.ext.asyncio import async_engine_from_config

# 1. IMPORT YOUR CONFIG AND BASE WITH CORRECT PATHS
from app.config import settings
from app.database import Base

# 2. IMPORT ALL YOUR MODELS SO ALEMBIC CAN DETECT THEM
# (This ensures the money_entries table is tracked)
from app.models import user, portfolio, project, blog, money  # noqa: F401

# This is the Alembic Config object
config = context.config

# 3. DYNAMICALLY SET THE DATABASE URL FROM YOUR APP SETTINGS
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Helper function to run migrations synchronously within the async loop."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using an AsyncEngine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # Run the migrations using the async connection wrapper
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # Use asyncio to execute the async migration framework
    asyncio.run(run_migrations_online())
