import './App.css';
import LandingPage from './pages/LandingPage';
import Items from './pages/Items';
import About from './pages/about';
import ItemDetail from './pages/ItemDetail';
import ListItem from './pages/ListItem';
import Profile from './pages/profile';
import RequestMap from './pages/RequestMap';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './components/Chatbot';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/list" element={<ListItem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/request-map" element={<RequestMap />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;
