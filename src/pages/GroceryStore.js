import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, Image, Button, Segment, Dropdown, Input } from 'semantic-ui-react';

function GroceryStore() {
    const {grocery, myCart, setMyCart} = useOutletContext();
    // console.log(
    //     'grocery: ', grocery, 
    //     'myCart: ', myCart,
    //     'setMyCart: ', setMyCart
    // );
    const idToIndexMyCart = {};
    myCart.forEach((item, i) => idToIndexMyCart[item.id] = i);

    const catOptions = [
        { key: 0, value: 'all', text: 'All'},
        { key: 1, value: 'vegetables', text: 'Vegetables'},
        { key: 2, value: 'fruits', text: 'Fruits'},
        { key: 3, value: 'meatSeafood', text: 'Meat & Seafood'},
        { key: 4, value: 'dairyEggs', text: 'Dairy & Eggs'},
        { key: 5, value: 'pentry', text: 'Pentry'},
        { key: 6, value: 'beverages', text: 'Beverages'}
    ];
    const [displayByCat, setDisplayByCat] = useState(catOptions[0].value);
    const [searchName, setSearchName] = useState('');

    function handleCatChange(event, data) {
        setDisplayByCat(data.value);
    }

    function handleSearchChange(event, data) {
        // console.log('handleSearchChange, event: ', event);
        // console.log('handleSearchChange, data: ', data);

        setSearchName(event.target.value);
    }

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

    const filterGroceryByCat = grocery.filter(item => displayByCat === 'all' || displayByCat === item.category);
    const searchGroceryByName = filterGroceryByCat.filter(item => item.name.toLowerCase().includes(searchName.toLowerCase()));

    const displayGrocery = searchGroceryByName.map((item) => {
        return (
            <Card key={item.id}>
                <Link to={`/item/${item.id}`}>
                    <Image className='img' src={item.thumbnail} />
                </Link>
                <Card.Content>
                    <Card.Header>{`$${item.productPrice} each`}</Card.Header>
                    <Card.Meta>{`($${item.unitPrice} / ${item.unit})`}</Card.Meta>
                    <Card.Description>
                        {`${item.name}, ${item.productUnit}`}
                    </Card.Description>
                </Card.Content>
                <Button color='red' onClick={() => handleAddTo(item, 'myCart')}>
                    {idToIndexMyCart[item.id] === undefined ? 'Add to cart' : `${myCart[idToIndexMyCart[item.id]].quantity} in cart`}
                </Button>
                <Button basic color='black' onClick={() => handleAddTo(item, 'myList')}>Add to list</Button>
            </Card>
        );
    });
    // console.log('displayGrocery', displayGrocery);

    return (
        <>
            <Segment inverted color='red' style={{display: 'flex', alignItems: 'center'}}>
                <h1 style={{flex: 1}}>Grocery</h1>
                <span style={{flex: 0.3}}>
                    <h4>
                        Display By:{' '}
                        <Dropdown inline options={catOptions} 
                            defaultValue={catOptions[0].value} onChange={handleCatChange} /> 
                    </h4>
                    <Input action={{ icon: 'search'}} placeholder='Search...' 
                        value={searchName} onChange={handleSearchChange} />
                </span>
            </Segment>
            <Card.Group itemsPerRow={5}>
                {displayGrocery}
            </Card.Group>
        </>
    );
}

/*
function GroceryStore() {
    const [grocery, setGrocery] = useState([]);
    const [myCart, setMyCart] = useState([]);
    const idToIndex = {};

    const catOptions = [
        { key: 0, value: 'all', text: 'All'},
        { key: 1, value: 'vegetables', text: 'Vegetables'},
        { key: 2, value: 'fruits', text: 'Fruits'},
        { key: 3, value: 'meatSeafood', text: 'Meat & Seafood'},
        { key: 4, value: 'dairyEggs', text: 'Dairy & Eggs'},
        { key: 5, value: 'pentry', text: 'Pentry'},
        { key: 6, value: 'beverages', text: 'Beverages'}
    ];
    const [displayByCat, setDisplayByCat] = useState(catOptions[0].value);
    const [searchName, setSearchName] = useState('');

    // useEffect(() => {
    //     fetch('http://localhost:3000/groceryStore')
    //     .then(resp => resp.json())
    //     .then(data => {
    //         setGrocery(data);
    //     });
    // }, []);

    useEffect(() => {
        const groceryResp = 
            fetch('http://localhost:3000/groceryStore')
            .then(resp => resp.json());

        const myCartResp = 
            fetch('http://localhost:3000/myCart')
            .then(resp => resp.json());

        Promise.all([groceryResp, myCartResp])
        .then(data => {
            // console.log('Result', data);
            setGrocery(data[0]);
            setMyCart(data[1]);
        });
    }, []);

    function handleCatChange(event, data) {
        setDisplayByCat(data.value);
    }

    function handleSearchChange(event, data) {
        console.log('handleSearchChange, event: ', event);
        console.log('handleSearchChange, data: ', data);

        setSearchName(event.target.value);

    }

    function handleAddTo(item, i, to) {
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
                        ...item,
                        quantity: 1
                    })
                })
                .then(resp => resp.json())
                .then(data => {
                    if (to === 'myCart') {
                        setMyCart([...myCart, data]);
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

    // console.log('grocery: ', grocery);
    // console.log('myCart: ', myCart);

    // Creating a id to index mapping table.
    myCart.forEach((item, i) => idToIndex[item.id] = i);
    // console.log('idToIndex: ', idToIndex);

    const filterGroceryByCat = grocery.filter(item => displayByCat === 'all' || displayByCat === item.category);
    const searchGroceryByName = filterGroceryByCat.filter(item => item.name.toLowerCase().includes(searchName.toLowerCase()));

    const displayGrocery = searchGroceryByName.map((item, i) => {
        return (
            <Card key={item.id}>
                <Link to={`/item/${item.id}`}>
                    <Image src={item.thumbnail} wrapped ui={false} />
                </Link>
                <Card.Content>
                    <Card.Header>{`$${item.productPrice} each`}</Card.Header>
                    <Card.Meta>{`($${item.unitPrice} / ${item.unit})`}</Card.Meta>
                    <Card.Description>
                        {`${item.name}, ${item.productUnit}`}
                    </Card.Description>
                </Card.Content>
                <Button color='red' onClick={() => handleAddTo(item, i, 'myCart')}>
                    {idToIndex[item.id] === undefined ? 'Add to cart' : `${myCart[idToIndex[item.id]].quantity} in cart`}
                </Button>
                <Button basic color='black' onClick={() => handleAddTo(item, i, 'myList')}>Add to list</Button>
            </Card>
        );
    });
    // console.log('displayGrocery', displayGrocery);

    return (
        <>
            <Segment inverted color='red' style={{display: 'flex', alignItems: 'center'}}>
                <h1 style={{flex: 1}}>Grocery</h1>
                <span style={{flex: 0.3}}>
                    <h4>
                        Display By:{' '}
                        <Dropdown inline options={catOptions} 
                            defaultValue={catOptions[0].value} onChange={handleCatChange} /> 
                    </h4>
                    <Input action={{ icon: 'search'}} placeholder='Search...' 
                        value={searchName} onChange={handleSearchChange} />
                </span>
            </Segment>
            <Card.Group itemsPerRow={5}>
                {displayGrocery}
            </Card.Group>
        </>
    );
};
*/

export default GroceryStore;