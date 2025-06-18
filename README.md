Split Expense App
A simple full-stack application to manage shared expenses, calculate balances, and suggest settlements among participants, using Indian Rupees (₹).

Live Demo
Link: https://split-expense-app.onrender.com/ 

Features

Add shared expenses with description, amount, payer, and participants
Delete expenses with confirmation prompt
Equal split among participants
Dynamic calculation of balances
Optimized settlement summary (who pays whom)
Fully functional API with EJS frontend
MongoDB for persistent storage
Indian Rupees (₹) with Indian number formatting (e.g., ₹1,23,456.78)
Robust error handling for invalid inputs and corrupt data


Tech Stack

Backend: Node.js, Express
Frontend: EJS Templates, HTML/CSS/JavaScript
Database: MongoDB (via Mongoose)
Hosting: Render (free tier)


Setup Instructions (Local Development)
1. Clone the Repo
git clone https://github.com/NilayNahar27/split-expenses-app
cd split-expense-app

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root directory:
MONGODB_URI=mongodb://localhost:27017/splitexpense
PORT=3000

For MongoDB Atlas, use:
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/splitexpense?retryWrites=true&w=majority

4. Run the App
npm start

Or for development with auto-restart:
npm run dev

Visit: http://localhost:3000

API Documentation
Base URL: /api



Method
Endpoint
Description



GET
/expenses
List all expenses


POST
/expenses
Add a new expense


DELETE
/expenses/:id
Delete an expense by ID


GET
/balances
Get settlement transactions


Example POST /expenses Body:
{
  "description": "Dinner",
  "amount": 5000,
  "paidBy": "Amit",
  "participants": [
    { "user": "Amit" },
    { "user": "Neha" },
    { "user": "Rahul" }
  ]
}


Settlement Logic

Track total amount paid and share per participant.
Calculate each user’s net balance (amount paid minus share owed).
Divide users into debtors (negative balance) and creditors (positive balance).
Use greedy matching to minimize the number of settlement transactions.

Example:
Amit: +5000
Neha: -1666.67
Rahul: -1666.67

=> Neha pays Amit ₹1666.67
=> Rahul pays Amit ₹1666.67


Postman Collection
(Optional: Create and link a Postman collection for testing)Placeholder: https://gist.github.com/yourusername/your-postman-collection (Replace with your actual link if created)

Test data: Lunch, Groceries, Movie Tickets
Includes invalid request examples (e.g., negative amount, empty participants)


Known Limitations

No user login/authentication
Equal splitting only (no custom splits)
No expense update functionality
No concurrency or rate limiting
Minimal UI (functional but basic)
No endpoint to list all unique participants


Future Improvements

Add user authentication
Support unequal expense splits
Implement expense editing (PUT endpoint)
Add endpoint to list all participants
Enhance UI with responsive design
Add success notifications for add/delete actions
Implement transaction history


