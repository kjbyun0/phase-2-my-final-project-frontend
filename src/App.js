import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
// import logo from './logo.svg';
import './App.css';

function App() {
  const [grocery, setGrocery] = useState([]);
  // mapping table from item's id to grocery index
  const idToIndexGrocery = {};
  const [myCart, setMyCart] = useState([]);

  useEffect(() => {
    const groceryResp = fetch('http://localhost:3000/groceryStore')
      .then(resp => resp.json());

    const myCartResp = fetch('http://localhost:3000/myCart')
      .then(resp => resp.json());

    Promise.all([groceryResp, myCartResp])
    .then(data => {
      // console.log('Result', data);
      setGrocery(data[0]);
      setMyCart(data[1]);
    })
  }, []);

  grocery.forEach((item, i) => idToIndexGrocery[item.id] = i);
  // console.log("outside useEffect, idToIndexGrocery: ", idToIndexGrocery);

  return (
    <div style={{marginLeft: '1%', marginRight: '1%'}}>
      <header>
        <NavBar />
      </header>
      <Outlet context={{
        grocery: grocery, 
        setGrocery: setGrocery, 
        idToIndexGrocery: idToIndexGrocery,
        myCart: myCart,
        setMyCart: setMyCart
      }}/>
    </div>
  );
}

export default App;
