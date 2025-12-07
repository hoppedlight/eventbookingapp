import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Favorites from './pages/Favorites';
import MyEvents from './pages/MyEvents';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import Login from "./pages/Login";
import Register from "./pages/Register";


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event" element={<Layout><EventDetails /></Layout>} />
          <Route path="/create" element={<Layout><CreateEvent /></Layout>} />
          <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
          <Route path="/my-events" element={<Layout><MyEvents /></Layout>} />
          <Route path="/search" element={<Layout><SearchResults /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
    </Router>
  );
}

export default App;