import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
// import logo from './logo.svg';
// import './App.css';

function App() {
  return (
    <>
      <header>
        <NavBar />
      </header>
      <Outlet />
    </>
  );
}

export default App;
