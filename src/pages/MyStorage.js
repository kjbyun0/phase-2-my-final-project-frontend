import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Divider, Card, Image, Checkbox, Input, Button, Icon, Segment, ItemMeta } from 'semantic-ui-react';

const indexToCat = ['vegetables', 'fruits', 'meatSeafood', 'dairyEggs', 'pentry', 'beverages'];
const indexToPrintableCat = ['Vegetables', 'Fruits', 'Meat & Seafood', 'Dairy & Eggs', 'Pentry', 'Beverages'];


function MyStorage() {
    const {grocery, idToIndexGrocery, myCart, setMyCart} = useOutletContext();
    // console.log(
    //     'grocery: ', grocery, 
    //     'idToIndexGrocery: ', idToIndexGrocery,
    //     'myCart: ', myCart,
    //     'setMyCart: ', setMyCart
    // );

    const [myStorage, setMyStorage] = useState([]);
    const catToIndex = {};
    indexToCat.forEach((cat, i) => {
        catToIndex[cat] = i;
    });
    // console.log('catToIndex', catToIndex);

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

    if (grocery.length > 0) {
        myStorage.forEach(stoItem => myStorageByCat[catToIndex[grocery[idToIndexGrocery[stoItem.id]].category]].push(stoItem));
    }
    // console.log('myStorageByCat: ',

    function handleCurQuantityChange(e, item) {
        if (e.target.value < 0) 
            return;

        fetch(`http://localhost:3000/myStorage/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                quantity: e.target.value === '' ? 0 : parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyStorage(myStorage => 
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
    }

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
        .then(data => setMyStorage(myStorage => 
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
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
        .then(data => setMyStorage(myStorage => 
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
    }

    function handleItemAddToCartClick(item) {
        fetch(`http://localhost:3000/myCart/${item.id}`)
        .then(resp => resp.json())
        .then(itemInCart => {
            if (Object.keys(itemInCart).length === 0) {
                fetch('http://localhost:3000/myCart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: item.id,
                        quantity: item.optQuantity - item.quantity
                    })
                })
                .then(resp => resp.json())
                .then(data => {
                    console.log('Added to myCart', data);
                    setMyCart(myCart => [...myCart, data]);
                });
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
                    .then(data => {
                        console.log('Edited item in myCart', data);
                        setMyCart(myCart => myCart.map(item => item.id === data.id ? data : item));
                    });
                }
                else {
                    alert(`This item with more than or equal to ${item.optQuantity - item.quantity} / each is already in the cart`);
                }
            }
        })
    }

    async function handleAllAddToCartClick() {
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
                            body: JSON.stringify({
                                id: stoItem.id,
                                quantity: lackInQuantity
                            })
                        })
                        .then(resp => resp.json())
                        .then(data => {
                            console.log('Added a new item to myCart: ', data);
                            setMyCart(myCart => [...myCart, data]);
                        });
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
                            .then(data => {
                                console.log('Edited an existing item in myCart: ', data);
                                setMyCart(myCart => myCart.map(item => item.id === data.id ? data : item));
                            });
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
    const displayMyStorageByCat = 
        grocery.length === 0 ?
        '' : 
        myStorageByCat.map((stoItemsByCat, i) => {
            if (stoItemsByCat.length === 0)
                return '';

            return (
                <div key={indexToCat[i]}>
                    <h1>{indexToPrintableCat[i]}</h1>
                    <Card.Group itemsPerRow={4}>
                    {
                        stoItemsByCat.map(stoItem => {
                            const lackInQuantity = (stoItem.isStaple && stoItem.optQuantity - stoItem.quantity > 0 ? stoItem.optQuantity - stoItem.quantity : 0)
                            lackQuantityTotal += lackInQuantity;
                            lackSubTotal += (grocery[idToIndexGrocery[stoItem.id]].productPrice * lackInQuantity);

                            return (
                                <Card key={stoItem.id}>
                                    <Image src={grocery[idToIndexGrocery[stoItem.id]].thumbnail} wrapped ui={false} />
                                    <Card.Content>
                                        <Card.Header style={{fontSize: 'medium'}}>
                                            {`${grocery[idToIndexGrocery[stoItem.id]].name}, ${grocery[idToIndexGrocery[stoItem.id]].productUnit}`}
                                        </Card.Header>
                                        <Card.Description>{`$${grocery[idToIndexGrocery[stoItem.id]].productPrice} each`}</Card.Description>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <label htmlFor='curQty'
                                                style={{flex: 1, fontSize: 'medium', fontWeight: 'bolder', color: 'teal'}}>
                                                Quantity: 
                                            </label>
                                            <Input type='number' id='curQty' style={{flex: 0.6, width: '30%'}} 
                                                value={stoItem.quantity} onChange={(e) => handleCurQuantityChange(e, stoItem)} />
                                        </div>
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
                                            <Input type='number' id='optQty' style={{flex: 0.6, width: '30%'}} 
                                                disabled={!stoItem.isStaple}
                                                value={stoItem.optQuantity} onChange={(e) => handleOptQuantityChange(e, stoItem)} />
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
            <Segment inverted color='teal'>
                <h1>Storage at home</h1>
            </Segment>
            <Segment raised style={{display: 'flex'}}>
                <div style={{flex: 1, marginLeft: '80px'}}>
                    <h1>Add to cart to fulfill optimal quantities?</h1>
                    <h2>{`Subtotal (${lackQuantityTotal} items): $${Math.floor(lackSubTotal * 100) / 100}`}</h2>
                </div>
                <Button style={{flex: 0.3, marginTop: '15px', marginBottom: '15px', marginRight: '80px'}} 
                    disabled={lackQuantityTotal === 0}color='red' size='massive' onClick={() => handleAllAddToCartClick()} >
                    <Icon name='shopping cart' />
                    Add to cart
                </Button>
            </Segment>
            {displayMyStorageByCat}
        </>
    );
}

/*
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
    // console.log('myStorageByCat: ',
    
    function handleCurQuantityChange(e, item) {
        if (e.target.value < 0) 
            return;

        fetch(`http://localhost:3000/myStorage/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                quantity: e.target.value === '' ? 0 : parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyStorage(
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
    }

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
        .then(data => setMyStorage(
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
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
        if (stoItemsByCat.length === 0)
            return '';

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
                                    // <Card.Header style={{fontSize: 'medium', color: 'blue'}}>
                                    //    {`Current Quantity: ${stoItem.quantity}`}
                                    // </Card.Header> 
                                    <Card.Header style={{fontSize: 'medium'}}>
                                        {`${stoItem.name}, ${stoItem.productUnit}`}
                                    </Card.Header>
                                    <Card.Description>{`$${stoItem.productPrice} each`}</Card.Description>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <label htmlFor='curQty'
                                            style={{flex: 1, fontSize: 'medium', fontWeight: 'bolder', color: 'teal'}}>
                                            Quantity: 
                                        </label>
                                        <Input type='number' id='curQty' style={{flex: 0.6, width: '30%'}} 
                                            value={stoItem.quantity} onChange={(e) => handleCurQuantityChange(e, stoItem)} />
                                    </div>
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
                                        <Input type='number' id='optQty' style={{flex: 0.6, width: '30%'}} 
                                            disabled={!stoItem.isStaple}
                                            value={stoItem.optQuantity} onChange={(e) => handleOptQuantityChange(e, stoItem)} />
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
            <Segment inverted color='teal'>
                <h1>Storage at home</h1>
            </Segment>
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
}
*/

export default MyStorage;