# Genrify — workshop setup

Genrify has two parts. The **frontend** is the React page with the sliders and chart; it uses **Node.js and npm**. The **backend** is the Python API that answers prediction requests; it uses its own **virtual environment (`.venv`)**. Installing one does not install the other. Keep two terminals open while using the app.

## 1. Install the tools once

- Install the current **Node.js LTS** from [nodejs.org](https://nodejs.org/en/download). npm comes with Node. Reopen VS Code and its terminals after installing. Supported Node 22.12+ or a newer LTS is suitable; avoid Node 18 and 20 for this workshop.
- Install standard **Python 3.13** from [Python's downloads](https://www.python.org/downloads/). Choose the latest 3.13 patch release and the normal installer for your computer, rather than the free-threaded or embeddable build. Python 3.12 also works. The pinned scientific packages in `requirements.txt` are older, so use 3.12 or 3.13 for this checkout instead of the newest Python 3.14/3.15.
- Extract the repository ZIP completely, or clone the workshop branch. Open the folder containing this file, `requirements.txt`, `backend`, and `frontend` in VS Code. Do not run commands from inside the ZIP or from the parent folder.

On **Windows**, check in a new PowerShell or Command Prompt terminal:

```powershell
node --version
npm.cmd --version
py -3.13 --version
```

On **macOS/Linux**:

```sh
node --version
npm --version
python3.13 --version
```

If you already have Python 3.12, use `py -3.12` or `python3.12` in the environment-creation command below. The remaining commands stay the same. Installing 3.13 alongside another Python version is fine; the explicit version selects the right one.

## 2. Terminal 1: create a fresh Python environment and start the API

Start at the **repository root**, where `requirements.txt` lives. Create your own environment on this computer. Do not copy someone else's `.venv` or reuse one from a different extracted folder.

**Windows — PowerShell or Command Prompt:**

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

**macOS/Linux:**

```sh
python3.13 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Wait for `Application startup complete`. Leave this terminal running. Open [the health check](http://127.0.0.1:8000/health); it should show `{"status":"ok","source":"mock"}`. The API's interactive docs are at [127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

These commands call the environment's Python directly, so **activation is unnecessary**. You do not need to change PowerShell's execution policy.

## 3. Terminal 2: install frontend packages and start the page

Open a **second terminal at the repository root**.

**Windows:**

```powershell
cd frontend
npm.cmd ci
copy .env.example .env.local
npm.cmd run dev
```

**macOS/Linux:**

```sh
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

The copy command works in both PowerShell and Command Prompt on Windows. If `.env.local` already exists, check its contents instead of overwriting other settings: it must contain `VITE_API_URL=/api` for this local setup. Restart Vite after changing it. This setting is required: without it, this checkout tries to call the backend directly and the browser can block the request.

Leave this terminal running too. Open **[http://localhost:5173](http://localhost:5173)**. With `VITE_API_URL=/api`, the frontend forwards prediction requests through Vite to the API on port 8000.

For later sessions, repeat only the API start command in Terminal 1 and `cd frontend` / `npm.cmd run dev` (or `npm run dev`) in Terminal 2. Reinstall dependencies after their dependency files change. Press **Ctrl+C** in each terminal to stop its server.

## 4. Check that you are ready

1. The API health check says `ok` and `mock`.
2. The page loads at port 5173 with five main audio-feature sliders and ten additional inputs.
3. After a prediction request, the current workshop backend returns **Pop, 50% confidence**. It always returns this mock result, even when sliders change. No trained model or dataset download is required.
4. In a third terminal, run `cd frontend` then `npm.cmd run build` (Windows) or `npm run build` (macOS/Linux). It should finish without TypeScript errors.

Main contains the completed Workshop 6 radar implementation. See the [frontend walkthrough](frontend/README.md) for the data flow and checks. The solid track polygon updates immediately as sliders change; the dashed Pop reference returns after each API response. To run the original fill-in-the-blank exercise, use the separate [student starter branch](https://github.com/sjayan009/genrify-workshop/tree/radar-student-starter-pack), which retains all twelve exercise markers.

## Recover a broken `.venv`

An environment can break when its folder is moved, its original Python is removed, or it was created on another computer. Reinstalling npm cannot repair a Python environment.

Stop the API with Ctrl+C, close old terminals, and open a new terminal at the repository root. Keep your source files. If `.venv` exists, rename it as a backup:

**Windows PowerShell:**

```powershell
Rename-Item -LiteralPath .venv -NewName .venv-backup
```

**Windows Command Prompt:**

```bat
ren .venv .venv-backup
```

**macOS/Linux:**

```sh
mv .venv .venv-backup
```

If `.venv-backup` already exists, choose a different unused backup name such as `.venv-backup-2`. If `.venv` does not exist, skip the rename. Then repeat **step 2**, beginning with `py -3.13 -m venv .venv` or `python3.13 -m venv .venv`. This creates a new environment and installs the packages from `requirements.txt`. In VS Code, use **Python: Select Interpreter** and choose the new `.venv` interpreter if you edit Python files.

## Common errors

| What you see | What to do |
| --- | --- |
| `node` / `npm` is not recognized | Install Node LTS, then restart VS Code and its terminals. Verify both version commands in step 1. |
| `npm.ps1 cannot be loaded` / scripts are disabled | On Windows use `npm.cmd ci` and `npm.cmd run dev`. No execution-policy change is needed. |
| `react/jsx-runtime` missing / `JSX.IntrinsicElements` missing | From **frontend**, run `npm.cmd ci` (Windows) or `npm ci`. Wait for it to finish, then run the build. In VS Code choose **TypeScript: Select TypeScript Version → Use Workspace Version**, then **TypeScript: Restart TS Server** if red underlines persist. The React packages and their types are already declared; do not install random global types. |
| npm cannot find `package.json` / `ENOENT` | You are in the wrong folder. The npm commands belong in `frontend`. |
| `py` / `python3.13` missing, or `No suitable Python runtime found` | Install Python 3.13 and reopen the terminal. On Windows run `py -0p` to list installed interpreters; select 3.12 or 3.13 explicitly. If the launcher is absent, use the installed Python executable's full path to create the environment. |
| pip tries to compile NumPy/scikit-learn, asks for C++ tools, or says no matching distribution | Check the environment version: Windows `.\.venv\Scripts\python.exe --version`; macOS/Linux `.venv/bin/python --version`. Recreate it with standard Python 3.12/3.13, then retry step 2. Do not install a compiler as the first fix. On Windows ARM, ask the instructor about the x64 Python build supported by these pinned wheels. |
| `No module named uvicorn` / `fastapi` | Install `requirements.txt` with the **same `.venv` Python** used to launch the API, as in step 2. |
| `Could not import module "app.main"` | Start the API from the root with `--app-dir backend`, using the exact command above. |
| `Address already in use` / port 5173 or 8000 busy | Stop the earlier server with Ctrl+C in its terminal, then restart. The workshop expects these ports; changing one requires matching the proxy configuration. |
| Page loads but prediction fails / Vite `ECONNREFUSED` | Keep both servers running. Check port 8000's health URL first, and check `VITE_API_URL` if you have an old `.env.local`. |
| `npm ci` reports lockfile mismatch | Confirm you have `package.json` **and** `package-lock.json` from the same workshop branch. Ask the instructor before replacing the lockfile. |
| Certificate, proxy, or network errors during install | Check your network and try again. Keep HTTPS certificate verification enabled; ask the instructor if a campus proxy is required. |

Commit source code and dependency files. `.venv`, environment backups, `node_modules`, generated `dist`, and local `.env` files are ignored and should stay on each person's computer.

Setup background: [Python virtual environments](https://docs.python.org/3/library/venv.html), [pip requirements files](https://pip.pypa.io/en/stable/user_guide/#requirements-files). Python package compatibility: [NumPy 2.2.1](https://pypi.org/project/numpy/2.2.1/) and [scikit-learn 1.6.1](https://pypi.org/project/scikit-learn/1.6.1/).
