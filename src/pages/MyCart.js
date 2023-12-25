import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { List, Button, Image, Input, Segment } from 'semantic-ui-react';
import { postItemSync, patchItemSync } from './commonLib';

function MyCart() {
    const {grocery, idToIndexGrocery, myCart, setMyCart} = useOutletContext();
    // console.log(
    //     'grocery: ', grocery, 
    //     'idToIndexGrocery: ', idToIndexGrocery,
    //     'myCart: ', myCart,
    //     'setMyCart: ', setMyCart
    // );
    const navigate = useNavigate();

    function handleDeleteClick(item) {
        // fetch(`http://localhost:3000/myCart/${item.id}`, {
        fetch(`${process.env.REACT_APP_API_URL}/myCart/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => setMyCart(myCart => myCart.filter(cartItem => cartItem.id !== item.id)));
    }

    function handleMinusClick(item) {
        //bkj - I can replace it with patchItem in commonLib
        // fetch(`http://localhost:3000/myCart/${item.id}`, {
        fetch(`${process.env.REACT_APP_API_URL}/myCart/${item.id}`, {
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
        .then(data => setMyCart(myCart => myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)));
    }

    function handlePlusClick(item) {
        //bkj - I can replace it with patchItem in commonLib
        // fetch(`http://localhost:3000/myCart/${item.id}`, {
        fetch(`${process.env.REACT_APP_API_URL}/myCart/${item.id}`, {
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
        .then(data => setMyCart(myCart => myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)));
    }

    function handleQuantityChange(e, item) {
        setMyCart(myCart => myCart.map(cartItem => cartItem.id === item.id ? {...cartItem, quantity: e.target.value} : cartItem));
    }

    function handleQuantityBlur(e, item) {
        //bkj - I can replace it with patchItem in commonLib
        // fetch(`http://localhost:3000/myCart/${item.id}`, {
        fetch(`${process.env.REACT_APP_API_URL}/myCart/${item.id}`, {
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
        .then(data => setMyCart(myCart => myCart.map(cartItem => cartItem.id === data.id ? data : cartItem)));
    }

    async function handlePlaceOrderClick() {
        for (let i = 0; i < myCart.length; i++) {
            // await fetch(`http://localhost:3000/myStorage/${myCart[i].id}`)
            await fetch(`${process.env.REACT_APP_API_URL}/myStorage/${myCart[i].id}`)
            .then(resp => resp.json())
            .then(async data => {
                if (Object.keys(data).length === 0) {
                    await postItemSync('myStorage', 
                        {
                            ...myCart[i],
                            isStaple: false,
                            optQuantity: 0
                        });
                }
                else {
                    await patchItemSync(myCart[i], 'myStorage',
                        {
                            quantity: data.quantity + myCart[i].quantity
                        });
                }
            });
        }

        for (let i = 0; i < myCart.length; i++) {
            // await fetch(`http://localhost:3000/myCart/${myCart[i].id}`, {
            await fetch(`${process.env.REACT_APP_API_URL}/myCart/${myCart[i].id}`, {
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
        setMyCart(myCart => []);

        navigate(`/mystorage`);
    }

    const usDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    let subTotal = 0, itemQuantityTotal = 0;
    const displayMyCart = myCart.map(item => {
        const itemTotal = grocery[idToIndexGrocery[item.id]].productPrice * item.quantity;
        subTotal += itemTotal;
        itemQuantityTotal += item.quantity;
        return (
            <List.Item key={item.id} style={{display: 'flex', alignItems: 'center'}}>
                <Button circular icon='cancel' size='mini' 
                    style={{flex: 0.01, marginLeft: '30px', marginRight: '10px'}} 
                    onClick={() => handleDeleteClick(item)} />
                <Image style={{flex: 0.15, marginRight: '40px'}} size='small' 
                    src={grocery[idToIndexGrocery[item.id]].thumbnail} />
                <Link to={`/item/${item.id}`} style={{flex: 1, color: 'black'}}>
                    <h3>{`${grocery[idToIndexGrocery[item.id]].name}, ${grocery[idToIndexGrocery[item.id]].productUnit}`}</h3>
                </Link>
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
                    <h2>{usDollar.format(itemTotal)}</h2>
                    {
                        item.quantity > 1 ? <p>{`${usDollar.format(grocery[idToIndexGrocery[item.id]].productPrice)} / each`}</p> : ''
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
                    <h2>{`Subtotal (${itemQuantityTotal} items): ${usDollar.format(subTotal)}`}</h2>
                </div>
                <Button style={{flex: 0.3, marginTop: '15px', marginBottom: '15px', marginRight: '80px'}} 
                    disabled={myCart.length === 0} color='red' size='massive' 
                    onClick={() => handlePlaceOrderClick()}>Place order
                </Button>
            </Segment>
            <List divided verticalAlign='middle'>
                {displayMyCart}
            </List>
        </>
    );
}

export default MyCart;