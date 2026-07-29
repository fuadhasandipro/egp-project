
swager ui = http://localhost:3000/api/docs


# Inspections Module

**Owner:** Member 4 (Mozahid) — Inspections, Student Stats, Teacher Training.

All endpoints require a login token:
```
Authorization: Bearer <accessToken>
```
Get a token from `POST /api/auth/login`.

---

## Entities used (4)

- `Inspection`
- `StudentStatistic`
- `TeacherTraining`
- `TrainingProgram`

---

## All endpoints (3 tasks, 8 endpoints total)

**Task 1 — Inspections**
- POST /api/inspections
- GET /api/inspections

**Task 2 — Student Stats (CRUD)**
- POST /api/student-stats
- GET /api/student-stats
- GET /api/student-stats/:id
- PATCH /api/student-stats/:id
- DELETE /api/student-stats/:id

**Task 3 — Training Assign**
- POST /api/training/assign

---

## 1. POST /api/inspections

- Role required: **officer**
- Body:
```json
{ "institutionId": "string", "score": 85, "notes": "string" }
```
- `inspectorId` is auto-filled from the logged-in user — not sent by the client.

---

## 2. GET /api/inspections

- Role required: any logged-in user
- Query params: `page`, `limit`, `sortBy`, `order`, `institutionId`, `inspectorId`
- Visibility: **admin** sees all institutions, **head_teacher** sees only their own institution (automatic, no param needed).

---

## 3. POST /api/student-stats

- Role required: **head_teacher**
- Body:
```json
{ "institutionId": "string", "academicYear": "2026", "totalBoys": 120, "totalGirls": 110 }
```

## 4. GET /api/student-stats

- Role required: any logged-in user
- No input needed — returns all stats.

## 5. GET /api/student-stats/:id

- Role required: any logged-in user
- Input: `id` in the URL.

## 6. PATCH /api/student-stats/:id

- Role required: **head_teacher**
- Input: `id` in the URL + body:
```json
{ "academicYear": "2026", "totalBoys": 130, "totalGirls": 110 }
```

## 7. DELETE /api/student-stats/:id

- Role required: **head_teacher**
- Input: `id` in the URL.

---

## 8. POST /api/training/assign

- Role required: **admin** or **officer**
- Body:
```json
{ "userId": "string", "trainingId": "string", "completionDate": "2026-07-20" }
```
- Creates a `TeacherTraining` record linking the teacher to the training program.

---

## Files in this folder

```
inspections.module.ts        -> wires everything together
inspections.controller.ts    -> /api/inspections routes
student-stats.controller.ts  -> /api/student-stats routes
training.controller.ts       -> /api/training/assign route
inspections.service.ts       -> all business logic (DB save/find/update/delete)
dto/                          -> request validation rules
```

---

## Known issue found and fixed

The JWT token does not include `institutionId` (`src/auth/jwt.strategy.ts` — not touched, out of scope). Because of this, the `head_teacher` visibility rule in `GET /api/inspections` could not read `institutionId` directly from the token.

**Fix:** In `inspections.service.ts`, the service does an extra DB lookup (`userRepo.findOne`) to get the logged-in user's real `institutionId`, without touching any file outside `src/inspections/`.

**Also note:** the `officer` role did not exist in the project (only `admin, to, ato, head_teacher, teacher` were seeded). It was added manually to the database for testing — team should be informed.
