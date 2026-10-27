# Turi: Server (Express) Setup Guide

For the teammate working on the **Server** folder.

The server is a separate Node.js app. It stays in `Server/` and is **not** moved into `client`.

---

## 1. Get the latest code

Open PowerShell in the Turi repo folder (`dir` should show `README.md`, `Admin`, `Server`, `User`, `client`).

```powershell
git pull
```

## 2. Check whether the server is already set up

```powershell
dir Server
```

- If you see `package.json`, skip to **Step 4**.
- If not, continue to Step 3.

## 3. First-time setup (only if there is no package.json)

```powershell
cd Server
npm init -y
npm install express cors dotenv
cd ..
```

| Package | Purpose |
| --- | --- |
| `express` | The server framework |
| `cors` | Lets the React app call the server |
| `dotenv` | Loads secrets from a `.env` file |

If `Server` has no code yet, create a starter file:

```powershell
@"
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(5000, () => console.log('Server running on port 5000'));
"@ | Set-Content Server\index.js
```

If a main file already exists (`server.js`, `index.js`, `app.js`), do **not** overwrite it.

## 4. Install and run

```powershell
cd Server
npm install
node index.js
```

Use your actual main file name if it is different. You should see:

```
Server running on port 5000
```

## 5. Test it

Open `http://localhost:5000/api/health` in a browser. You should see:

```json
{"status":"ok"}
```

## 6. Rules for the API

- Start every route with `/api` (for example `/api/appointments`). The React app forwards `/api` calls to port 5000.
- Keep the server on port **5000** so the React proxy keeps working.
- Never commit secrets. Put them in a `.env` file inside `Server/`:

```
PORT=5000
DB_URL=your-database-url-here
```

Load it at the top of your main file:

```js
require('dotenv').config();
```

## 7. Make sure the root .gitignore exists

From the Turi root:

```powershell
dir .gitignore
```

It should contain:

```
node_modules/
.env
dist/
```

If it is missing:

```powershell
@"
node_modules/
.env
dist/
"@ | Set-Content .gitignore
```

## 8. Upload your work

```powershell
git pull
git add Server .gitignore
git commit -m "Describe what you changed"
git push
```

If `git push` is rejected, run `git pull` and then `git push` again.

## 9. Running everything together

Use two terminals:

| Terminal | Commands |
| --- | --- |
| 1 (server) | `cd Server` then `node index.js` |
| 2 (React) | `cd client` then `npm run dev` |

React runs at `http://localhost:5173` and forwards `/api` requests to the server at port 5000 (configured in `client/vite.config.js`).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot find module 'express'` | Run `npm install` inside `Server` |
| `Port 5000 already in use` | Close the other terminal running the server, or change `PORT` |
| React gets a network or CORS error | Make sure `app.use(cors())` is in your main file and the server is running |
| `node index.js` file not found | Check the main file name with `dir Server` |
| `git push` rejected | Run `git pull`, then `git push` |
