# ARVEO Feedback — Full Stack Project

A restaurant feedback form (frontend) connected to a Node.js/Express REST API
(backend) backed by a MySQL database. The frontend UI/UX (HTML, CSS,
animations, QR code, progress bar) is untouched — only `script.js` was
updated so that clicking **Submit Feedback** sends the form data to the
backend via `fetch()` instead of simulating a submission.

## Project Folder Structure

```
ARVEO-FEEDBACK/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   └── feedbackRoutes.js
│   ├── controllers/
│   │   └── feedbackController.js
│   ├── models/
│   │   └── feedbackModel.js
│   └── middleware/
│       └── validation.js
│
├── database/
│   └── arveo_feedback.sql
│
└── README.md
```

## 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MySQL](https://dev.mysql.com/downloads/) (v8 recommended) running locally
- A MySQL client of your choice (MySQL CLI, MySQL Workbench, phpMyAdmin, etc.)

## 2. Create the MySQL Database

1. Open your MySQL client and log in:
   ```bash
   mysql -u root -p
   ```
2. Import the SQL script (this creates the `arveo_feedback` database and the
   `feedbacks` table, plus two optional sample rows):
   ```bash
   mysql -u root -p < database/arveo_feedback.sql
   ```
   Or, from inside the MySQL shell:
   ```sql
   SOURCE /full/path/to/ARVEO-FEEDBACK/database/arveo_feedback.sql;
   ```

## 3. Configure & Run the Backend

1. Move into the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   This installs: `express`, `cors`, `dotenv`, `mysql2`, `express-validator`.
3. Check the `.env` file and update it with your own MySQL credentials if
   needed:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=arveo_feedback
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```
   You should see:
   ```
   ✅ Connected to MySQL database: arveo_feedback
   🚀 ARVEO Feedback API listening on http://localhost:5000
   ```

## 4. Run the Frontend

The frontend is a static site — no build step required.

- **Option A (simplest):** open `frontend/index.html` directly in your
  browser.
- **Option B (recommended, avoids any browser file:// quirks):** serve it
  with a lightweight static server, e.g.:
  ```bash
  cd frontend
  npx serve .
  ```
  then open the printed local URL (e.g. `http://localhost:3000`).

Make sure the backend (Step 3) is running on `http://localhost:5000` — the
frontend's `script.js` sends form submissions there.

Filling out the form and clicking **Submit Feedback** will:
1. Run the existing client-side validation.
2. Send the data via `fetch()` (`POST`, JSON) to `http://localhost:5000/api/feedback`.
3. Show the existing success popup and reset the form on success.
4. Show "Unable to submit feedback. Please try again." if the request fails.

## 5. API Endpoints

Base URL: `http://localhost:5000/api/feedback`

| Method | Endpoint             | Description                       |
|--------|-----------------------|-----------------------------------|
| POST   | `/api/feedback`       | Submit new feedback               |
| GET    | `/api/feedback`       | Get all feedback records          |
| GET    | `/api/feedback/:id`   | Get a single feedback record      |
| DELETE | `/api/feedback/:id`   | Delete a feedback record          |

### POST /api/feedback

Request body (matches what the frontend sends):
```json
{
  "fullName": "Ananya Rao",
  "phone": "9876543210",
  "email": "ananya.rao@example.com",
  "overall": 5,
  "ratings": {
    "Food Quality": 5,
    "Taste": 5,
    "Service": 4,
    "Staff Behaviour": 5,
    "Cleanliness": 5,
    "Ambience": 4,
    "Waiting Time": 3,
    "Value for Money": 4
  },
  "emojiReaction": "happy",
  "visitAgain": "Yes",
  "recommend": "Definitely",
  "menuItems": ["Starters", "Main Course", "Desserts"],
  "experience": "Wonderful evening!",
  "suggestions": "More vegetarian desserts please."
}
```

Success response — `201 Created`:
```json
{
  "success": true,
  "message": "Feedback submitted successfully."
}
```

Validation error response — `422 Unprocessable Entity`:
```json
{
  "success": false,
  "message": "Validation failed. Please check the highlighted fields.",
  "errors": [
    { "field": "phone", "message": "Phone number must contain exactly 10 digits." }
  ]
}
```

### GET /api/feedback

Returns all records:
```json
{
  "success": true,
  "count": 2,
  "data": [ { "id": 1, "full_name": "Ananya Rao", ... }, ... ]
}
```

### GET /api/feedback/:id

Returns a single record, or `404` if not found.

### DELETE /api/feedback/:id

Deletes a record and returns:
```json
{ "success": true, "message": "Feedback deleted successfully." }
```

## 6. Validation Rules

Enforced server-side with `express-validator` (in addition to the existing
client-side checks):

- `fullName` — required, minimum 2 characters
- `phone` — required, exactly 10 digits
- `email` — required, valid email format
- `overall` — required, integer between 1 and 5
- `visitAgain` — required, one of `Yes` / `Maybe` / `No`
- `recommend` — required, one of `Definitely` / `Maybe` / `No`

## 7. Architecture Notes

- **MVC pattern:** routes → controllers → models, with a separate `config/`
  for the database connection and `middleware/` for validation.
- **Database access:** `mysql2/promise` connection pool, parameterized
  queries (`pool.execute`) to prevent SQL injection.
- **Menu items:** stored as a `JSON` column, sent/read as a plain JS array.
- **Error handling:** every controller uses `async/await` with `try/catch`
  and returns proper HTTP status codes (`200`, `201`, `404`, `422`, `500`).
