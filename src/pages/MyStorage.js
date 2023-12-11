import { useState, useEffect } from 'react';
import { Divider, Card, Image, Checkbox, Input, Button, Icon, Segment } from 'semantic-ui-react';

const indexToCat = ['vegetables', 'fruits', 'meatSeafood', 'dairyEggs', 'pentry', 'beverages'];
const indexToPrintableCat = ['Vegetables', 'Fruits', 'Meat & Seafood', 'Dairy & Eggs', 'Pentry', 'Beverages'];

function MyStorage() {
    const [myStorage, setMyStorage] = useState([]);
    const catToIndex = {};

    indexToCat.forEach((cat, i) => {
        catToIndex[cat] = i;
    });
    // console.log('catToIndex', catToIndex);
    // console.log('indexToCat', indexToCat);

    const myStorageByCat = indexToCat.map(cat => []);

    useEffect(() => {
        fetch('http://localhost:3000/myStorage')
        .then(resp => resp.json())
        .then(data => {
            // I can't fill myStorageByCat from data here. 
            // It's bacause all items I push will disappear in out of this scope. Why??? 
            // Aren't the items objects????
            setMyStorage(data);
        });
    }, []);

    myStorage.forEach(stoItem => myStorageByCat[catToIndex[stoItem.category]].push(stoItem));
    // console.log('myStorage: ', myStorage);
    // console.log('myStorageByCat: ', myStorageByCat);

    function handleStapleCheck(item) {
        fetch(`http://localhost:3000/myStorage/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item, 
                isStaple: !item.isStaple
            })
        })
        .then(resp => resp.json())
        .then(data => {
            setMyStorage(myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem));
        })
    }

    function handleOptQuantityChange(e, item) {
        if (e.target.value < 0) 
            return;

        fetch(`http://localhost:3000/myStorage/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                optQuantity: e.target.value === '' ? '' : parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyStorage(
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
    }

    function handleItemAddToCartClick(item) {
        fetch(`http://localhost:3000/myCart/${item.id}`)
        .then(resp => resp.json())
        .then(itemInCart => {
            if (Object.keys(itemInCart).length === 0) {
                const itemCopy = {...item};
                itemCopy.quantity = item.optQuantity - item.quantity;
                delete itemCopy.isStaple;
                delete itemCopy.optQuantity;
                fetch('http://localhost:3000/myCart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemCopy)
                })
                .then(resp => resp.json())
                .then(data => console.log('Added to myCart', data));
            }
            else {
                if (itemInCart.quantity < item.optQuantity - item.quantity) {
                    fetch(`http://localhost:3000/myCart/${item.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...itemInCart,
                            quantity: item.optQuantity - item.quantity
                        })
                    })
                    .then(resp => resp.json())
                    .then(data => console.log('Edited item in myCart', data));
                }
                else {
                    alert(`This item with more than or equal to ${item.optQuantity - item.quantity} / each is already in the cart`);
                }
            }
        })
    }

    async function handleAddToCartClick() {
        //bkj - do this from now on....
        for (const stoItem of myStorage) {
            const lackInQuantity = stoItem.optQuantity - stoItem.quantity;
            if (stoItem.isStaple && lackInQuantity > 0) {
                await fetch(`http://localhost:3000/myCart/${stoItem.id}`)
                .then(resp => resp.json())
                .then(async data => {
                    if (Object.keys(data).length === 0) {
                        await fetch('http://localhost:3000/myCart/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            // bkj - use reduce later....
                            body: JSON.stringify({
                                id: stoItem.id,
                                category: stoItem.category,
                                thumbnail: stoItem.thumbnail,
                                image: stoItem.image,
                                name: stoItem.name,
                                productUnit: stoItem.productUnit,
                                productPrice: stoItem.productPrice,
                                unit: stoItem.unit,
                                unitPrice: stoItem.unitPrice,
                                description: stoItem.description,
                                quantity: lackInQuantity
                            })
                        })
                        .then(resp => resp.json())
                        .then(data => console.log('Added a new item to myCart: ', data));
                    }
                    else {
                        if (lackInQuantity > data.quantity) {
                            await fetch(`http://localhost:3000/myCart/${stoItem.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    ...data,
                                    quantity: lackInQuantity
                                })
                            })
                            .then(resp => resp.json())
                            .then(data => console.log('Edited an existing item in myCart: ', data));
                        }
                        else {
                            console.log('Item quantity in myCart is already bigger than insufficient quantitiy.');
                        }
                    }
                });
            }
            else {
                console.log(`Nothing done for id: ${stoItem.id}`);
            }
        }
    }

    let lackSubTotal = 0, lackQuantityTotal = 0;
    const displayMyStorageByCat = myStorageByCat.map((stoItemsByCat, i) => {
        return (
            <div key={indexToCat[i]}>
                <h1>{indexToPrintableCat[i]}</h1>
                <Card.Group itemsPerRow={4}>
                {
                    stoItemsByCat.map(stoItem => {
                        const lackInQuantity = (stoItem.isStaple && stoItem.optQuantity - stoItem.quantity > 0 ? stoItem.optQuantity - stoItem.quantity : 0)
                        lackQuantityTotal += lackInQuantity;
                        lackSubTotal += (stoItem.productPrice * lackInQuantity);

                        return (
                            <Card key={stoItem.id}>
                                <Image src={stoItem.thumbnail} wrapped ui={false} />
                                <Card.Content>
                                    {/* <Card.Header style={{fontSize: 'medium', color: 'blue'}}>
                                        {`Current Quantity: ${stoItem.quantity}`}
                                    </Card.Header> */}
                                    <Card.Header style={{fontSize: 'medium'}}>
                                        {`${stoItem.name}, ${stoItem.productUnit}`}
                                    </Card.Header>
                                    <Card.Description>{`$${stoItem.productPrice} each`}</Card.Description>
                                    {/* <div>
                                        <label htmlFor='curCnt'>
                                            Quantity: 
                                        </label>
                                        <Input type='number' id='curCnt'
                                    </div> */}
                                </Card.Content>
                                <Card.Content>
                                    <Checkbox toggle label='Staple Item' checked={stoItem.isStaple} 
                                        onChange={() => handleStapleCheck(stoItem)} />
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <label htmlFor='optQty' 
                                            style={stoItem.isStaple ? 
                                                    {flex: 1, fontSize: 'small'} : 
                                                    {flex: 1, fontSize: 'small', color: 'lightgray'}}>
                                            Optimal Quantity: 
                                        </label>
                                        <Input type='number' id='optQty' style={{flex: 1, width: '30%'}} 
                                            disabled={!stoItem.isStaple}
                                            value={stoItem.optQuantity} onChange={(e) => handleOptQuantityChange(e, stoItem)}/>
                                    </div>
                                    <Button color='red' style={{width: '100%', marginTop: '5px'}} 
                                        disabled={!stoItem.isStaple || stoItem.optQuantity - stoItem.quantity <= 0}
                                        onClick={() => handleItemAddToCartClick(stoItem)}>
                                        <Icon name='shopping cart' />
                                        {stoItem.isStaple && stoItem.optQuantity - stoItem.quantity > 0 ? `Add ${lackInQuantity} / each to cart` : ''}
                                    </Button>
                                </Card.Content>
                            </Card>
                        );
                    })
                }
                </Card.Group>
                <Divider />
            </div>
        );
    });

    return (
        <>
            <h1>MyStorage!!</h1>
            <Segment raised style={{display: 'flex'}}>
                <div style={{flex: 1, marginLeft: '80px'}}>
                    <h1>Add to cart to fulfill optimal quantities?</h1>
                    <h2>{`Subtotal (${lackQuantityTotal} items): $${Math.floor(lackSubTotal * 100) / 100}`}</h2>
                </div>
                <Button style={{flex: 0.3, marginTop: '15px', marginBottom: '15px', marginRight: '80px'}} 
                    color='red' size='massive' onClick={() => handleAddToCartClick()} >
                    <Icon name='shopping cart' />
                    Add to cart
                </Button>
            </Segment>
            {displayMyStorageByCat}
        </>
    );
};

export default MyStorage;