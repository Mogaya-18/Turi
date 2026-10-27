# Turi: User (React) Setup Guide

For the teammate working on the **User** folder (Patient Dashboard, Book Appointment, Doctor Consultation).

The React app lives in the `client` folder. You will move your `User` folder into it and build your pages there.

---

## 1. Get the latest code

Open PowerShell in the Turi repo folder (`dir` should show `README.md`, `Admin`, `Server`, `User`, `client`).

```powershell
git pull
```

## 2. Install and run the React app

```powershell
cd client
npm install
npm run dev
```

Open the address it prints (usually `http://localhost:5173`). You should see the default Vite + React page.

> `npm install` is required on every computer because `node_modules` is not stored in git.

Press **Ctrl+C** to stop the dev server.

## 3. Move your User folder into React

From the **Turi root** (not inside `client`):

```powershell
cd ..
Move-Item User client\src\User
git add .
git commit -m "Move User into React client"
git push
```

If `git push` is rejected, run `git pull` and then `git push` again.

## 4. Where your files go

```
Turi/
├── client/src/
│   ├── Admin/     (Admin teammate)
│   ├── Login/
│   ├── User/      <- your work goes here
│   ├── App.jsx    (routes)
│   └── main.jsx
└── Server/        (stays outside client)
```

Suggested files inside `client/src/User/`:

- `Dashboard.jsx` (Patient Dashboard)
- `BookAppointment.jsx`
- `Consultation.jsx` (Doctor Consultation)

## 5. Add your pages to the routes

Open `client/src/App.jsx` and add a route for each of your pages:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./User/Dashboard";
import BookAppointment from "./User/BookAppointment";
import Consultation from "./User/Consultation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/consultation" element={<Consultation />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Several people edit `App.jsx`, so run `git pull` before editing it and commit small changes often to avoid merge conflicts.

## 6. Talking to the server

The server runs on port 5000. Calls starting with `/api` are forwarded to it automatically:

```jsx
fetch("/api/health")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

Start the server in a second terminal (see `SETUP-SERVER.md`) while testing.

## 7. Daily workflow

```powershell
git pull                      # get teammates' changes
cd client
npm run dev                   # work on your pages
cd ..
git add client/src/User
git commit -m "Describe what you changed"
git push
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `cd client` says path not found | You are in the wrong folder. Use `cd` until `dir` shows `client` |
| `npm run dev` says command not found | Run `npm install` inside `client` first |
| `git push` rejected | Run `git pull`, then `git push` |
| "not a git repository" | You are outside the Turi folder |
| Blank page after adding a route | Check the import path and that the component has `export default` |
