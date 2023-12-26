import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Divider, Card, Image, Checkbox, Input, Button, Icon, Segment } from 'semantic-ui-react';
import { postItem, postItemSync, patchItem, patchItemSync, deleteItem } from './commonLib';

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
    const navigate = useNavigate();

    const [myStorage, setMyStorage] = useState([]);
    const catToIndex = {};
    indexToCat.forEach((cat, i) => {
        catToIndex[cat] = i;
    });
    // console.log('catToIndex', catToIndex);

    const myStorageByCat = indexToCat.map(cat => []);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/myStorage`)
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

    function handleCurQuantityChange(e, item) {
        if (e.target.value < 0) 
            return;

        patchItem(item, 'myStorage', {
                quantity: e.target.value === '' ? 0 : parseInt(e.target.value)
            }, myStorage, setMyStorage);
    }

    function handleDeleteItemClick(stoItem) {
        deleteItem(stoItem, 'myStorage', myStorage, setMyStorage);
    }

    function handleStapleCheck(item) {
        patchItem(item, 'myStorage', {
                isStaple: !item.isStaple
            }, myStorage, setMyStorage);
    }

    function handleOptQuantityChange(e, item) {
        if (e.target.value < 0) 
            return;

        patchItem(item, 'myStorage', {
                optQuantity: e.target.value === '' ? 0 : parseInt(e.target.value)
            }, myStorage, setMyStorage);
    }

    function handleItemAddToCartClick(item) {
        fetch(`${process.env.REACT_APP_API_URL}/myCart/${item.id}`)
        .then(resp => resp.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                postItem('myCart', 
                    {
                        id: item.id,
                        quantity: item.optQuantity - item.quantity
                    }, 
                    myCart, setMyCart);
            }
            else {
                if (data.quantity < item.optQuantity - item.quantity) {
                    patchItem(item, 'myCart', 
                        {
                            quantity: item.optQuantity - item.quantity
                        }, 
                        myCart, setMyCart);
                }
                else {
                    alert(`This item with more than or equal to ${item.optQuantity - item.quantity} / each is already in the cart`);
                }
            }
        })
    }

    async function handleAllAddToCartClick() {
        // myCartTemp is the up-to-date copy of myCart as any items in myCart are added or updated.
        // It is to call setMyCart at once after all items are added to myCart.
        const myCartTemp = [...myCart];

        for (const stoItem of myStorage) {
            const lackInQuantity = stoItem.optQuantity - stoItem.quantity;
            if (stoItem.isStaple && lackInQuantity > 0) {
                await fetch(`${process.env.REACT_APP_API_URL}/myCart/${stoItem.id}`)
                .then(resp => resp.json())
                .then(async data => {
                    if (Object.keys(data).length === 0) {
                        await postItemSync('myCart', 
                            {
                                id: stoItem.id,
                                quantity: lackInQuantity
                            }, 
                            myCartTemp);
                    }
                    else {
                        if (lackInQuantity > data.quantity) {
                            await patchItemSync(stoItem, 'myCart', 
                                {
                                    quantity: lackInQuantity
                                }, 
                                myCartTemp);
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
        setMyCart(myCartTemp);

        navigate('/mycart');
    }

    const usDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
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
                    <Card.Group itemsPerRow={5}>
                    {
                        stoItemsByCat.map(stoItem => {
                            const lackInQuantity = (stoItem.isStaple && stoItem.optQuantity - stoItem.quantity > 0 ? stoItem.optQuantity - stoItem.quantity : 0)
                            lackQuantityTotal += lackInQuantity;
                            lackSubTotal += (grocery[idToIndexGrocery[stoItem.id]].productPrice * lackInQuantity);

                            return (
                                <Card key={stoItem.id}>
                                    <Image className='img' src={grocery[idToIndexGrocery[stoItem.id]].thumbnail}  />
                                    <Card.Content>
                                        <Card.Header style={{fontSize: 'medium'}}>
                                            {`${grocery[idToIndexGrocery[stoItem.id]].name}, ${grocery[idToIndexGrocery[stoItem.id]].productUnit}`}
                                        </Card.Header>
                                        <Card.Description>{`${usDollar.format(grocery[idToIndexGrocery[stoItem.id]].productPrice)} each`}</Card.Description>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <label htmlFor='curQty'
                                                style={{flex: 1, fontSize: 'medium', fontWeight: 'bolder', color: 'teal'}}>
                                                Quantity: 
                                            </label>
                                            <Input type='number' id='curQty' style={{flex: 0.6, width: '30%'}} 
                                                value={stoItem.quantity} onChange={(e) => handleCurQuantityChange(e, stoItem)} />
                                            {
                                                !stoItem.isStaple && stoItem.quantity === 0 ? 
                                                <Button circular icon='trash alternate outline' style={{flex: 0.15, width: '10%', marginLeft: '5px'}}
                                                    onClick={() => handleDeleteItemClick(stoItem)} /> : 
                                                ''
                                            }
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
                    <h2>{`Subtotal (${lackQuantityTotal} items): ${usDollar.format(lackSubTotal)}`}</h2>
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

export default MyStorage;