import './App.css';
import Home from './pages/home';
import Items from './pages/Items';
import About from './pages/about';
import ItemDetail from './pages/ItemDetail';
import ListItem from './pages/ListItem';
import Profile from './pages/profile';
import RequestMap from './pages/RequestMap';
import Header from './components/header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/list" element={<ListItem />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/request-map" element={<RequestMap/>} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
