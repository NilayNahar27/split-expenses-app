# Split Expense App

A simple full-stack application to manage shared expenses, calculate balances, and suggest settlements among participants.

---

## Live Demo

Link: https://split-expenses-app-9bw7.onrender.com/


---

## Features

* Add and view shared expenses
* Equal split among participants
* Dynamic calculation of balances
* Optimized settlement summary (who pays whom)
* Fully functional API with EJS frontend
* MongoDB Atlas for cloud-hosted database

---

## Tech Stack

* Backend: Node.js, Express
* Frontend: EJS Templates, HTML/CSS/JS
* Database: MongoDB Atlas (via Mongoose)
* Hosting: Render (free tier)

---

## Setup Instructions (Local Development)

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/split-expense-app.git
cd split-expense-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/splitapp?retryWrites=true&w=majority
```

### 4. Run the App

```bash
node server.js
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## API Documentation

Base URL: /api

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| GET    | /expenses      | List all expenses        |
| POST   | /expenses      | Add a new expense        |
| PUT    | /expenses/\:id | Update an expense        |
| DELETE | /expenses/\:id | Delete an expense        |
| GET    | /people        | Get all people involved  |
| GET    | /balances      | Get net balance per user |
| GET    | /settlements   | Get who owes whom        |

---

## Settlement Logic

1. Track total paid and share per participant.
2. Calculate each user’s net balance.
3. Divide users into debtors and creditors.
4. Use greedy matching to minimize number of transactions.

Example:

```
Shantanu: +450
Sanket: -365
Om: -85

=> Sanket pays Shantanu 365
=> Om pays Shantanu 85
```

---

## Postman Collection

Link: [https://gist.github.com/your-gist-id](https://gist.github.com/your-gist-id)

* All API endpoints tested
* Test data: Dinner, Groceries, Petrol, Movie Tickets
* Includes invalid request examples

---

## Known Limitations

* No user login/authentication
* Equal splitting only
* No concurrency or rate limiting
* UI is minimal (but functional)

---

## Demo Video (Optional)

Coming soon or replace with your YouTube link

---

## License

MIT License © 2024 Nilay Nahar
