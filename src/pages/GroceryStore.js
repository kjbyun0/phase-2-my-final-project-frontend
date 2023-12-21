import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, Image, Button, Segment, Dropdown, Input } from 'semantic-ui-react';
import { handleAddTo } from './commonLib';

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

    const filterGroceryByCat = grocery.filter(item => displayByCat === 'all' || displayByCat === item.category);
    const searchGroceryByName = filterGroceryByCat.filter(item => item.name.toLowerCase().includes(searchName.toLowerCase()));

    const displayGrocery = searchGroceryByName.map((item) => {
        const usDollar = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        return (
            <Card key={item.id}>
                <Link to={`/item/${item.id}`}>
                    <Image className='img' src={item.thumbnail} />
                </Link>
                <Card.Content>
                    <Card.Header>{`${usDollar.format(item.productPrice)} each`}</Card.Header>
                    <Card.Meta>{`(${usDollar.format(item.unitPrice)} / ${item.unit})`}</Card.Meta>
                    <Card.Description>
                        {`${item.name}, ${item.productUnit}`}
                    </Card.Description>
                </Card.Content>
                <Button color='red' onClick={() => handleAddTo(item, 'myCart', myCart, setMyCart)}>
                    {idToIndexMyCart[item.id] === undefined ? 'Add to cart' : `${myCart[idToIndexMyCart[item.id]].quantity} in cart`}
                </Button>
                <Button basic color='black' onClick={() => handleAddTo(item, 'myList', myCart, setMyCart)}>Add to list</Button>
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
                            value={displayByCat} onChange={handleCatChange} /> 
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

export default GroceryStore;