# 🔐 Password Cracking Lab

A hands-on cybersecurity learning environment where students learn how password attacks work — so they can build stronger defenses. Built with React, FastAPI, PostgreSQL, and Docker.

> ⚠️ **For educational purposes only.** All techniques learned here must not be used on any unauthorized system, network, or account.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Difficulty Levels](#difficulty-levels)
- [How the Lab Works](#how-the-lab-works)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

Password Cracking Lab is a controlled, isolated cybersecurity training platform. Each user gets a dedicated Docker container running Kali Linux with a randomly generated password hash to crack using real tools (John the Ripper, Hashcat). Sessions are time-limited, scored, and tracked on a leaderboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Database | PostgreSQL 15 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Container Management | Docker SDK for Python 6.1.3 |
| Lab Environment | Kali Linux, John the Ripper, Hashcat, POCL OpenCL |
| ORM | SQLAlchemy 2.0 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│              React Frontend (Vite, port 5173)           │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / REST API
┌─────────────────────▼───────────────────────────────────┐
│              FastAPI Backend (port 8000)                 │
│   Auth │ Lab │ Terminal │ Submission │ Leaderboard       │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │ Docker SDK
┌──────────▼──────────┐  ┌───────▼──────────────────────┐
│  PostgreSQL 15       │  │  Lab Runtime Containers       │
│  (port 5432)         │  │  Kali Linux + john + hashcat  │
│  Users, sessions,    │  │  network=none, mem=512MB      │
│  scores, leaderboard │  │  auto-destroyed after 10 min  │
└─────────────────────┘  └──────────────────────────────┘
```

---

## Project Structure

```
Password_cracking_lab/
│
├── backend/                          
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py           # SQLAlchemy + PostgreSQL setup
│   │   │   └── security.py           # JWT auth, bcrypt password hashing
│   │   ├── models/
│   │   │   ├── user.py               # User model
│   │   │   ├── lab_session.py        # Lab session model
│   │   │   ├── submission.py         # Password submission model
│   │   │   ├── leaderboard.py        # Leaderboard model
│   │   │   ├── analytics.py          # Analytics model
│   │   │   ├── command_log.py        # Terminal command log
│   │   │   └── disclaimer.py         # Consent model
│   │   ├── routers/
│   │   │   ├── auth.py               # /register, /login, /me
│   │   │   ├── lab.py                # /lab/start, /status, /hint, /reset
│   │   │   ├── terminal.py           # /terminal/exec (async)
│   │   │   ├── submission.py         # /submission/submit
│   │   │   ├── leaderboard.py        # /leaderboard/top, /my-position
│   │   │   ├── session.py            # /session/me
│   │   │   ├── difficulty.py         # /difficulty
│   │   │   └── overview.py           # /overview
│   │   ├── services/
│   │   │   ├── docker_service.py     # Container lifecycle management
│   │   │   ├── difficulty_service.py # Difficulty level configuration
│   │   │   ├── scoring_service.py    # Score calculation logic
│   │   │   ├── hash_service.py       # MD5/SHA-256/bcrypt generation
│   │   │   └── command_policy.py     # Command whitelist/blacklist
│   │   ├── generator.py              # Random password + hash generator
│   │   └── main.py                   # FastAPI app, CORS, router registration
│   ├── Dockerfile                    # Backend container image
│   ├── requirements.txt              # Python dependencies
│   └── intermediate.txt             # Wordlist for password generation
│
├── frontend/                         
│   ├── src/
│   │   ├── pages/
│   │   │   ├── welcome.jsx           # Public landing page (matrix rain bg)
│   │   │   ├── login.jsx             # Login page
│   │   │   ├── register.jsx          # Register page
│   │   │   ├── overview.jsx          # 11-card educational overview
│   │   │   ├── labinfo.jsx           # Consent + difficulty selection
│   │   │   ├── lab.jsx               # Main lab (terminal + timer + hints)
│   │   │   ├── result.jsx            # Session result + score breakdown
│   │   │   └── leaderboard.jsx       # Ranked leaderboard with filters
│   │   ├── components/
│   │   │   ├── navbar.jsx            # Top navigation bar
│   │   │   ├── sidepanel.jsx         # Permanent sticky left sidebar
│   │   │   ├── terminal.jsx          # In-browser terminal emulator
│   │   │   ├── instructionpanel.jsx  # Right-side steps/hints panel
│   │   │   ├── timer.jsx             # Countdown timer (server-synced)
│   │   │   ├── difficultycard.jsx    # Difficulty selection card
│   │   │   ├── scorecard.jsx         # Score display component
│   │   │   └── disclaimerbox.jsx     # Consent checkbox component
│   │   └── api/
│   │       ├── api.js                # Axios instance with JWT interceptor
│   │       ├── lab.js                # Lab API calls
│   │       ├── terminal.js           # Terminal API calls
│   │       ├── leaderboard.js        # Leaderboard API calls
│   │       └── overview.js           # Overview API calls
│   └── package.json
│
└── infrastructure/
    ├── docker-compose.yml            # db + backend services
    └── lab_runtime/
        ├── Dockerfile                # Kali Linux lab container image
        ├── entrypoint.sh             # Container startup script
        ├── policy.json               # Command restrictions config
        └── intermediate.txt          # Password generation wordlist
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine (Linux)
- [Node.js](https://nodejs.org/) v18+
- Git

---

## Setup & Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/priyanshitrivedi30/Password_cracking_lab.git
cd Password_cracking_lab
```

### Step 2 — Build the lab runtime image

This is the Kali Linux container where students crack passwords. Build it **once** before starting:

```bash
cd infrastructure/lab_runtime
docker build -t lab-runtime:latest .
cd ../..
```

> ⏳ Takes 2–3 minutes on first build — downloads Kali + john + hashcat + OpenCL drivers.

### Step 3 — Configure environment variables

```bash
cd infrastructure
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

### Step 4 — Start backend + database

```bash
cd infrastructure
docker compose up --build
```

- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### Step 5 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

---

## Environment Variables

Create `infrastructure/.env`:

```env
# PostgreSQL
POSTGRES_DB=password_lab
POSTGRES_USER=labuser
POSTGRES_PASSWORD=your_secure_password_here

# Backend
DATABASE_URL=postgresql://labuser:your_secure_password_here@db:5432/password_lab
SECRET_KEY=your_very_long_random_secret_key_here_minimum_32_chars
ALLOWED_ORIGINS=http://localhost:5173

# Optional
DEBUG_SQL=false
WORDLIST_DIR=/app
LAB_IMAGE_NAME=lab-runtime:latest
```

Generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Difficulty Levels

| | Beginner | Intermediate | Advanced |
|---|---|---|---|
| **Hash Algorithm** | MD5 (32 hex chars) | SHA-256 (64 hex chars) | bcrypt |
| **Tool** | John the Ripper | Hashcat | Your choice |
| **Attack Type** | Dictionary | Hybrid (word + 2 digits) | Brute force |
| **Guidance** | 4 locked steps | Up to 5 hints | No hints, no steps |
| **Max Score** | 50 pts | 100 pts | 200 pts |
| **Timer** | 10 minutes | 10 minutes | 10 minutes |
| **Hint Penalty** | None | -5 pts after 3rd hint | N/A |

### Beginner — Step by Step

```bash
ls                                                                              # Step 1: find hash.txt
cat hash.txt                                                                    # Step 2: view the MD5 hash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt     # Step 3: crack it
john --show --format=raw-md5 hash.txt                                           # Step 4: reveal password
```

### Intermediate — Hybrid Attack

```bash
cat hash.txt                                                                    # View SHA-256 hash
hashcat -m 1400 hash.txt /usr/share/wordlists/rockyou.txt -a 6 ?d?d           # word + 2 digits
hashcat --show --session=lab hash.txt                                           # Reveal cracked password
```

> The cracked password appears as `hash:password` — submit the part **after** the colon.

### Advanced — Free Mode

No steps. No hints. bcrypt is slow by design — brute force is impractical. Focus on smart dictionary attacks.

---

## How the Lab Works

```
1. Register / Login         → JWT token issued
2. Overview (11 cards)      → Learn about password attacks and hashing
3. Consent + Difficulty     → Accept terms, pick Beginner / Intermediate / Advanced
4. Lab Start                → Backend spawns a fresh Kali Linux Docker container
5. Hash Generated           → Random password picked, hashed, written to hash.txt
6. Terminal Commands        → User runs john/hashcat via browser terminal
7. Command Policy           → Dangerous commands blocked (rm, wget, curl, sudo, etc.)
8. Password Submitted       → Compared to correct_password stored in DB
9. Score Calculated         → Based on time taken, attempts used, hints used
10. Container Destroyed     → Auto-cleaned after 10 min OR on successful crack
11. Result + Leaderboard    → Score saved, rankings updated
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create a new account |
| POST | `/login` | Get JWT token |
| GET | `/me` | Current user info |

### Lab
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lab/start` | Start a session (spawns container) |
| GET | `/lab/status/{session_id}` | Session status + time remaining |
| POST | `/lab/hint` | Get next hint (intermediate only) |
| POST | `/lab/advance-step` | Advance step (beginner only) |
| POST | `/lab/reset` | Force-expire stuck sessions |

### Terminal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/terminal/exec` | Execute a command inside the container |

### Submission
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submission/submit` | Submit the cracked password |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard/top` | Top players (optional `?difficulty=` filter) |
| GET | `/leaderboard/my-position` | Current user's rank + score |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/difficulty` | Available difficulty configurations |
| GET | `/overview` | Educational overview card content |
| GET | `/session/me` | User's session history |
| GET | `/health` | Health check |

---

## Security

### Container Isolation
- Each container runs with `network_mode: none` — **zero internet access**
- Memory limited to **512MB**, CPU quota **50%**
- `security_opt: no-new-privileges` — prevents privilege escalation
- Runs as non-root `labuser`
- Auto-destroyed after 10 minutes

### Command Policy

**Blocked in all modes:**
`rm -rf`, `wget`, `curl`, `sudo`, `su`, `bash`, `python`, `perl`, `ruby`, `nc`, `netcat`, `ssh`, `chmod`, `chown`, `exec`, `eval`, pipes (`|`), output redirects (`>`), command chaining (`&&`, `;`), backtick substitution

**Allowed commands per difficulty:**

| Difficulty | Allowed |
|-----------|---------|
| Beginner | `john`, `ls`, `cat`, `cd`, `pwd`, `echo`, `clear`, `whoami` |
| Intermediate | + `hashcat` |
| Advanced | + `hashcat` |

### Authentication
- Passwords hashed with **bcrypt**
- **JWT tokens** for all authenticated routes
- Lab progress cleared on login/logout to prevent cross-user data leakage

---

## Troubleshooting

### `POST /lab/start` returns 500
```bash
docker logs password_lab_backend --tail 50
```
Common causes:
- **Wrong image name** — make sure you built as `lab-runtime:latest` in Step 2
- **Docker socket not mounted** — backend needs `/var/run/docker.sock`
- **Stale session** — click "Clear Old Session & Start Fresh" on the lab page

### `cat hash.txt` shows "No output" (empty file)
The hash was not written correctly to the container. Restart the backend and start a new lab session:
```bash
docker compose up --build backend
```

### Hashcat shows "Already an instance running"
A previous hashcat run is still active. Run `--show` to retrieve the already-cracked result:
```bash
hashcat --show --session=lab hash.txt
```
The output is `HASH:password` — submit the part **after** the colon.

### Hashcat shows "No devices found" / OpenCL error
OpenCL is missing from the lab runtime image. Rebuild it:
```bash
cd infrastructure/lab_runtime
docker build -t lab-runtime:latest .
```
The Dockerfile installs `pocl-opencl-icd` for CPU-based OpenCL (no GPU required).

### Leaderboard shows `users.map is not a function`
The frontend was calling `.map()` on the full API response object instead of the array inside it. Update `leaderboard.js` to extract `res.data.leaderboard` — this bug has been fixed in the latest version.

### Frontend shows CORS error
Make sure `ALLOWED_ORIGINS` in your `.env` exactly matches your frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:5173
```

---

## Scoring System

| Factor | Effect |
|--------|--------|
| Correct password on first try | Full points |
| Each wrong attempt | -2 pts (intermediate/advanced) |
| Time taken | Deducted proportionally |
| Hints 1–3 (intermediate) | No penalty |
| Hints 4–5 (intermediate) | -5 pts each |
| Session timeout (not cracked) | Score recorded as-is |

**Leaderboard ranking:** Highest score first → Fastest time as tiebreaker → One entry per user (best session only)

---

## License

This project is built for educational purposes as part of a cybersecurity training curriculum.
