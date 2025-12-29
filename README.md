# EcoSync 🌱

EcoSync is a hyperlocal peer-to-peer marketplace designed to foster community trust and sustainability. It allows users to lend, borrow, rent, or auction items they don't frequently use, reducing waste and connecting neighbors.

## 🚀 Features

- **User Authentication**: Secure login/signup with profile management and trust scores.
- **Map-Based Discovery**: Interactive map to find items available nearby.
- **Item Listings**: Easily list items for lending, renting, or selling.
- **Search & Filters**: Filter items by category (Tools, Kitchen, Electronics, etc.) and distance.
- **Transaction Management**: Request items and manage borrowing/renting flows.
- **Responsive Design**: Built with a mobile-first approach.

## 🛠️ Tech Stack

### Frontend (`ecosync-app`)
- **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: [Iconify](https://iconify.design/)

### Backend (`ecosync-backend`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **CORS**: Cross-Origin Resource Sharing enabled

## 📂 Project Structure

```
Hackxios/
├── ecosyc/
│   ├── ecosync-app/       # Frontend React Application
│   └── ecosync-backend/   # Backend Node.js/Express API
└── README.md              # Project Documentation
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (Local or Atlas connection string)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd ecosyc/ecosync-backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `ecosync-backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd ecosyc/ecosync-app
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🔌 API Endpoints

The backend provides the following main API routes:

- **Auth**: `/api/auth` (Login, Register)
- **Users**: `/api/users` (Profile management)
- **Items**: `/api/items` (CRUD operations for items)
- **Requests**: `/api/requests` (Borrow/Rent requests)
- **Transactions**: `/api/transactions` (Transaction history)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
