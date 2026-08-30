# Vidyesh Backend

This folder contains the new Node.js + Postgres REST API that will replace the current Nhost GraphQL backend in phases.

## Scope for Phase 1

- Postgres schema for the current app data
- REST API for murti inventory, bookings, delivery updates, images, and advertisement messages
- No file upload/storage migration yet

## 1. Create the database

Use one of these commands after replacing the placeholders with your real credentials.

### Option A: if your Postgres user can create databases

```bash
createdb -h <DB_HOST> -p <DB_PORT> -U <DB_USER> vidyesh_db
```

### Option B: with `psql`

```bash
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d postgres -c "CREATE DATABASE vidyesh_db;"
```

If the database already exists, skip this step.

## 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Update `.env` with your Postgres credentials.

You can either set:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/vidyesh_db
```

or the individual `DB_*` values.

## 3. Install packages

```bash
cd backend
npm install
```

## 4. Create tables

```bash
cd backend
npm run db:schema
```

## 5. Start the API

```bash
cd backend
npm run dev
```

## API Base URL

```text
http://localhost:4000/api
```

## Endpoints

### Health

- `GET /health`

### Auth

- `GET /auth/users`
- `POST /auth/users`
- `POST /auth/login`

### Murtis

- `GET /murtis`
- `GET /murtis/:id`
- `POST /murtis`
- `PATCH /murtis/:id`
- `DELETE /murtis/:id`
- `PATCH /murtis/:id/booking`
- `PATCH /murtis/:id/delivery`

### Murti Images

- `GET /murtis/:id/images`
- `POST /murtis/:id/images`
- `DELETE /murtis/:id/images/:imageId`

### Advertisements

- `GET /advertisements`
- `GET /advertisements/latest`
- `POST /advertisements`
- `PATCH /advertisements/:id`
- `DELETE /advertisements/:id`

## Notes for Phase 2

- We will import and map your existing Nhost export data from the linked `.xlsx` and `.csv` files.
- We will also decide whether `image_ref` stores a file ID, a URL, or a new local/cloud storage key.

## Create an admin user

After the backend is running, create a user with:

```bash
curl -X POST http://localhost:4000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```
