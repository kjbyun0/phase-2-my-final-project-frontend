import { useOutletContext, useParams } from 'react-router-dom';
import { Image, Header, Label, Button } from 'semantic-ui-react';

function Item() {
    const {grocery, idToIndexGrocery, myCart, setMyCart} = useOutletContext();
    // console.log(
    //     'grocery: ', grocery, 
    //     'idToIndexGrocery: ', idToIndexGrocery,
    //     'myCart: ', myCart,
    //     'setMyCart: ', setMyCart
    // );

    const params = useParams();
    // console.log('params: ', params);
    const id = parseInt(params.id);

    function handleAddTo(item, to) {
        fetch(`http://localhost:3000/${to}/${item.id}`)
        .then(resp => resp.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                fetch(`http://localhost:3000/${to}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: item.id,
                        quantity: 1
                    })
                })
                .then(resp => resp.json())
                .then(data => {
                    if (to === 'myCart') {
                        setMyCart(myCart => [...myCart, data]);
                    }
                    console.log(`POST to ${to}: `, data);
                });
            }
            else {
                fetch(`http://localhost:3000/${to}/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quantity: data.quantity + 1
                    })
                })
                .then(resp => resp.json())
                .then(data => {
                    if (to === 'myCart') {
                        setMyCart(myCart.map(cartItem => cartItem.id === data.id ? data : cartItem));
                    }
                    console.log(`PATCH to ${to}: `, data);
                });
            }
        });
    }

    if (grocery.length === 0)
        return ('');

    const myCartItem = myCart.find(item => item.id === id);
    // console.log('myCartItem: ' , myCartItem);
    const groceryItem = grocery[idToIndexGrocery[id]];

    return (
        <>
            <div style={{display: 'flex', marginTop: '100px'}}>
                <div style={{flex: 1, marginLeft: '10vw', marginRight: '3vw'}}>
                    <Image className='img' size='large' src={groceryItem.image} />
                    <Header as='h2'>Description</Header>
                    <p style={{fontSize: 'large'}}>{groceryItem.description}</p>
                </div>
                <div style={{flex: 0.8, marginRight: '10vw'}}>
                    <Header as='h1'>{groceryItem.name}</Header>
                    <Label circular color='grey' size='big'>{groceryItem.productUnit}</Label>
                    <Header as='h2'>{`$${groceryItem.productPrice} / Each`}</Header>
                    <p>{`($${groceryItem.unitPrice} / ${groceryItem.unit})`}</p>
                    <Button color='red' style={{width: '80%', marginBottom: '10px'}}
                        onClick={() => handleAddTo(groceryItem, 'myCart')}>
                        {myCartItem === undefined ? 'Add to cart' : `${myCartItem.quantity} in cart`}
                    </Button>
                    <Button basic color='black' style={{width: '80%'}} 
                        onClick={() => handleAddTo(groceryItem, 'myList')}>
                        Add to list
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Item;