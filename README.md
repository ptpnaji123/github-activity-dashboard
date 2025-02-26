# **GitHub Activity Dashboard**

## **📌 Overview**
This **GitHub Activity Dashboard** is a full-stack web application that helps developers and teams monitor repository activity, track pull requests, visualize branch changes.

### **🚀 Features**
✅ **GitHub OAuth Authentication** – Users log in with their GitHub accounts.  
✅ **View Repositories** – Displays all repositories owned by the authenticated user.  
✅ **View Branches & PRs** – Fetches branches and pull requests for selected repositories.  
✅ **Dashboard with Graphs** – Visualizes PR trends, branch activity.
✅ **Multi-Repository Selection** – Allows selecting multiple repositories for side-by-side analysis.  
✅ **Dynamic Time Range** – Filters metrics by 3 months, 6 months, or custom dates.  
✅ **Optimized Performance** – Uses **Axios** for parallel API calls and **Recharts** for data visualization.

---

## **🛠 Tech Stack**
### **Frontend:**
- React.js (Next.js can be integrated for SSR)
- Tailwind CSS (for responsive UI)
- Axios (for API calls)
- Recharts (for graphs & visualizations)

### **Backend:**
- Node.js (Express.js for API routing)
- Passport.js (for GitHub OAuth authentication)
- Axios (for GitHub API integration)

---

## **💻 Installation & Setup**

### **1️⃣ Clone the Repository**
```sh
 git clone https://github.com/yourusername/github-activity-dashboard.git
 cd github-activity-dashboard
```

### **2️⃣ Backend Setup (Node.js Server)**
```sh
cd backend
npm install
```

### **3️⃣ Create a `.env` File**
Inside the `backend` directory, create a `.env` file and add:
```sh
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=random_secure_string
```

**🔹 Get GitHub OAuth Credentials:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Create a **new OAuth App**.
3. Set the callback URL as:
   ```sh
   http://localhost:5000/auth/github/callback
   ```
4. Copy the **Client ID** & **Client Secret** and paste them into your `.env` file.

### **4️⃣ Start the Backend Server**
```sh
npm start
```
Server will run at: `http://localhost:5000`

### **5️⃣ Frontend Setup (React.js App)**
```sh
cd ../frontend
npm install
```

### **6️⃣ Start the Frontend App**
```sh
npm start
```
Frontend will be available at: `http://localhost:3000`

---

## **📌 How to Use the Dashboard**

### **🔹 Step 1: Login with GitHub**
- Click **Login with GitHub** to authenticate your GitHub account.
- Allow access to your repositories.

### **🔹 Step 2: Fetch Repositories**
- Click **Fetch Repositories** to list all repositories owned by the user.
- Select one or multiple repositories to view their details.

### **🔹 Step 3: View Repository Details**
- Once a repository is selected, its **branches** and **pull requests** will be displayed.
- Each repository's details are shown in a separate **box-style container**.

### **🔹 Step 4: View the Dashboard**
- Click **View Dashboard** to open a graphical representation of repository metrics.
- Graphs include:
  - **PR Trends** (PRs merged per week/month)
  - **Branch Activity** (branch creation & deletion frequency)
  - **PR Merge Time** (average time from PR creation to merge)

### **🔹 Step 5: Compare Multiple Repositories**
- Select multiple repositories to compare branch activity and pull requests.
- The dashboard dynamically adjusts to show data side by side.

---

## **📞 Need Help?**
For any issues, feel free to open an issue in this repository.

📩 **Contact:** [ptpnaji123@gmail.com]

