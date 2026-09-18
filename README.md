# Solo Leveling — API Server

REST API for the [Solo Leveling habit tracker](https://github.com/PrabhandhV/solo-leveling-system) — a gamified habit and quest tracker. Handles authentication, per-user data scoping, and persistence for quests, habits, rewards, and player progression.

**Live API:** https://solo-leveling-api-zzka.onrender.com
**Frontend repo:** https://github.com/PrabhandhV/solo-leveling-system
**Live app:** https://solo-leveling-system-pied.vercel.app

---

## Tech stack

- **Node.js** + **Express** — REST API
- **MongoDB Atlas** — cloud-hosted document database
- **Mongoose** — schemas, validation, queries
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT issuing and verification
- **cors**, **dotenv**

Deployed on Render.

---

## API endpoints

### Authentication (public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account. Returns a JWT and the user. |
| `POST` | `/auth/login` | Authenticate. Returns a JWT and the user. |

### Data (require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/player` | Fetch the authenticated user's progression; creates it on first request |
| `PUT` | `/player` | Update progression |
| `GET` | `/quests` `/habits` `/rewards` `/taskLog` | List the user's records |
| `POST` | `/quests` `/habits` `/rewards` `/taskLog` | Create a record |
| `PUT` | `/quests/:id` etc. | Update a record |
| `DELETE` | `/quests/:id` etc. | Delete a record |

`GET /` returns a status object and the endpoint list — useful as a health check.

---

## Security decisions

**Passwords are hashed with bcrypt**, never stored in plain text. The cost factor is 10, which is deliberately slow to make brute-forcing expensive, and bcrypt salts automatically so identical passwords produce different hashes.

**The password hash never leaves the server.** The User schema's `toJSON` transform deletes it, so no route can accidentally return it regardless of how the user object is sent.

**Login gives the same error for an unknown email and a wrong password.** Distinguishing them would let an attacker discover which addresses are registered — this prevents user enumeration.

**Every data route is scoped by owner.** Queries filter on `{ owner: req.userId }`, and updates and deletes use `findOneAndUpdate({ _id, owner })` rather than looking up by ID alone. Filtering by ID only would let any authenticated user modify another user's records by guessing an ID — an IDOR vulnerability. A mismatched owner matches nothing and returns 404, which also avoids revealing that the record exists.

**Validation runs on both client and server.** The client checks are for immediate feedback; the server checks are for integrity, since anyone can bypass the UI and post directly.

---

## Architecture notes

**A route generator instead of repetition.** Four resources each need the same four CRUD handlers. Rather than sixteen near-identical blocks, `crudRoutes(path, Model)` generates them, with auth middleware and owner scoping applied consistently by construction.

**Auth as middleware.** `requireAuth` verifies the JWT, attaches `req.userId`, and calls `next()` — or returns 401 and stops the chain. Protecting a route is one argument.

**Data shaped at the boundary.** Each schema's `toJSON` transform exposes MongoDB's `_id` as a string `id` and strips internal fields. The frontend never handles `_id`, so ID handling isn't scattered through the client.

**The server starts only after the database connects.** `app.listen` sits inside the Mongoose connection's `.then()`, so no request can arrive before the database is reachable.

---

## Running locally

```bash
git clone https://github.com/PrabhandhV/solo-leveling-server.git
cd solo-leveling-server
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/soloLeveling
PORT=3001
JWT_SECRET=<a long random string>
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then:

```bash
npm run dev     # nodemon, auto-restarts on change
npm start       # plain node, used in production
npm run seed    # wipes and repopulates collections with defaults
```

**Note:** MongoDB Atlas requires your IP in its Network Access list. For deployment on platforms without static outbound IPs, `0.0.0.0/0` is necessary.

---

## Project structure

```
middleware/auth.js       JWT verification
models/
  User.js                account credentials
  Player.js              XP, level, credits, streak
  index.js               Quest, Reward, TaskLog, Habit schemas
routes/auth.js           register and login
server.js                app setup, routes, database connection
seed.js                  development data seeding
```

---

## Known limitations

- **Game logic runs client-side.** The API accepts whatever XP and credit values it's sent rather than computing them. Moving the rules server-side is the most important improvement.
- **No password reset flow.** Would require single-use, expiring tokens and an email service.
- **No rate limiting** on the auth endpoints, which leaves them open to brute-force attempts.
- **CORS is open to all origins**, appropriate for development but should be restricted to the deployed frontend.
- **No refresh tokens.** JWTs last seven days and simply expire; the client clears the session on a 401.
- **No automated tests.**