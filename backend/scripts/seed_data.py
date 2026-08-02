import asyncio
import uuid
from datetime import date

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import BlogPost, MoneyEntry, Portfolio, Project, User


async def create_seed_data():
    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(User).where(User.email == 'demo@example.com'))
        if existing.scalar_one_or_none():
            print('Seed already exists')
            return

        user = User(
            google_id='seed-google-id',
            email='demo@example.com',
            display_name='Demo User',
            avatar_url='https://example.com/avatar.png',
        )
        session.add(user)
        await session.flush()

        portfolio = Portfolio(
            user_id=user.id,
            bio='<p>Full-stack developer building digital experiences.</p>',
            skills='Python, FastAPI, React, PostgreSQL',
            design_settings={'theme': 'dark', 'primary_color': '#4f46e5'},
            social_links={'github': 'https://github.com/demo', 'linkedin': 'https://linkedin.com/in/demo'},
        )
        session.add(portfolio)
        await session.flush()

        project = Project(
            portfolio_id=portfolio.id,
            user_id=user.id,
            title='MyPortfolio Platform',
            description='<p>Built a portfolio platform using FastAPI and React.</p>',
            github_url='https://github.com/demo/myportfolio',
            deployed_url='https://demo.example.com',
            tech_stack=['Python', 'FastAPI', 'React', 'PostgreSQL'],
            is_featured=True,
            order_index=1,
        )
        session.add(project)

        post = BlogPost(
            user_id=user.id,
            title='Shipping my portfolio platform',
            content='<p>This is a sample public post.</p>',
            is_public=True,
            visibility='public',
        )
        session.add(post)

        session.add(MoneyEntry(
            user_id=user.id,
            type='INCOME',
            amount=3500.00,
            category='Freelance',
            note='Project payment',
            date=date(2026, 7, 15),
        ))

        session.add(MoneyEntry(
            user_id=user.id,
            type='CREDIT',
            amount=1200.00,
            category='Client Advance',
            note='Credits owed to me',
            counterparty='Acme Studio',
            credit_status='active',
            date=date(2026, 7, 20),
        ))

        await session.commit()
        print('Seeded demo user and sample data')


if __name__ == '__main__':
    asyncio.run(create_seed_data())
