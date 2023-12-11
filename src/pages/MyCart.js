import { useState, useEffect } from 'react';
import { List, Button, Image, Input, Segment } from 'semantic-ui-react';

function MyCart() {
    const [myCart, setMyCart] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/myCart`)
        .then(resp => resp.json())
        .then(data => setMyCart(data));
    }, []);

    function handleDeleteClick(item) {
        fetch(`http://localhost:3000/myCart/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => setMyCart(myCart.filter(cartItem => cartItem.id !== item.id)));
    }
    
    function handleMinusClick(item) {
        fetch(`http://localhost:3000/myCart/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                quantity: item.quantity - 1
            })
        })
        .then(resp => resp.json())
        .then(data => setMyCart(
            myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)
        ));
    }

    function handlePlusClick(item) {
        fetch(`http://localhost:3000/myCart/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                quantity: item.quantity + 1
            })
        })
        .then(resp => resp.json())
        .then(data => setMyCart(myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)
        ));
    }

    function handleQuantityChange(e, item) {
        setMyCart(myCart.map(cartItem => 
            cartItem.id === item.id ? {...cartItem, quantity: e.target.value} : cartItem));
    }

    function handleQuantityBlur(e, item) {
        fetch(`http://localhost:3000/myCart/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                quantity: e.target.value === '' ? 1 : parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyCart(
            myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)
        ));
    }

    async function handleOrderClick() {
        for (let i = 0; i < myCart.length; i++) {
            await fetch(`http://localhost:3000/myStorage/${myCart[i].id}`)
            .then(resp => resp.json())
            .then(async data => {
                if (Object.keys(data).length === 0) {
                    await fetch('http://localhost:3000/myStorage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...myCart[i],
                            isStaple: false,
                            optQuantity: 0
                        })
                    })
                    .then(resp => resp.json())
                    .then(data => console.log('Added a new item to myStorage: ', data));
                }
                else {
                    await fetch(`http://localhost:3000/myStorage/${myCart[i].id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...myCart[i],
                            quantity: data.quantity + myCart[i].quantity
                        })
                    })
                    .then(resp => resp.json())
                    .then(data => console.log('Edited an existing item in myStorage: ', data))
                }
            });
        }

        for (let i = 0; i < myCart.length; i++) {
            await fetch(`http://localhost:3000/myCart/${myCart[i].id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(resp => resp.json())
            .then(data => console.log('Deleted an item from myCart: ', myCart[i]))
            .catch(error => {
                console.error('Error deleting myCart Item: ', myCart[i]);
                alert('Error deleting myCart Item');
            });
        }

        //Initializing myCart after placing order
        //I didn't delete one by one after each DELETE fetch.
        setMyCart([]);
    }

    let subTotal = 0, itemQuantityTotal = 0;
    const displayMyCart = myCart.map(item => {
        const itemTotal = Math.floor(item.productPrice * item.quantity * 100) / 100;
        subTotal += itemTotal;
        itemQuantityTotal += item.quantity;
        return (
            <List.Item key={item.id} style={{display: 'flex', alignItems: 'center'}}>
                <Button circular icon='cancel' size='mini' 
                    style={{flex: 0.01, marginLeft: '30px', marginRight: '10px'}} 
                    onClick={() => handleDeleteClick(item)} />
                <Image style={{flex: 0.15, marginRight: '40px'}} size='small' src={item.thumbnail} />
                <h3 style={{flex: 1}}>{`${item.name}, ${item.productUnit}`}</h3>
                <div style={{flex: 0.5}}>
                    {
                        item.quantity === 1 ? 
                            <Button icon='trash alternate' onClick={() => handleDeleteClick(item)}/> : 
                            <Button icon='minus' onClick={() => handleMinusClick(item)}/>
                    }
                    <Input type='text' value={item.quantity} 
                        onChange={(e) => handleQuantityChange(e, item)} 
                        onBlur={(e) => handleQuantityBlur(e, item)} 
                        style={{width: '60px', textAlign: 'center', marginRight: '3px'}}/>
                    <Button icon='plus' onClick={() => handlePlusClick(item)}/>
                </div>
                <div style={{flex: 0.25}}>
                    <h2>{`$${itemTotal}`}</h2>
                    {
                        item.quantity > 1 ? <p>{`${item.productPrice} / each`}</p> : ''
                    }
                </div>
            </List.Item>
        );
    })

    return (
        <>
            <Segment inverted color='yellow'>
                <h1>Items in cart</h1>
            </Segment>
            <Segment raised style={{display: 'flex'}}>
                <div style={{flex: 1, marginLeft: '80px'}}>
                    <h1>Order Summary</h1>
                    <h2>{`Subtotal (${itemQuantityTotal} items): $${Math.floor(subTotal * 100) / 100}`}</h2>
                </div>
                <Button style={{flex: 0.3, marginTop: '15px', marginBottom: '15px', marginRight: '80px'}} 
                    disabled={myCart.length === 0} color='red' size='massive' 
                    onClick={() => handleOrderClick()}>Place order
                </Button>
            </Segment>
            <List divided verticalAlign='middle'>
                {displayMyCart}
            </List>
        </>
    );
};

export default MyCart;