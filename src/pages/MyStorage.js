import { useState, useEffect } from 'react';
import { Divider, Card, Image, Checkbox, Input, Button, Icon } from 'semantic-ui-react';

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

    function handleOptCountChange(e, item) {
        fetch(`http://localhost:3000/myStorage/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...item,
                optCount: parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyStorage(
            myStorage.map(stoItem => stoItem.id === data.id ? data : stoItem)
        ));
    }

    function handleItemAddToCartClick(item) {

    }

    const displayMyStorageByCat = myStorageByCat.map((stoItemsByCat, i) => {
        return (
            <>
                <h1>{indexToPrintableCat[i]}</h1>
                <Card.Group itemsPereRow={5}>
                {
                    stoItemsByCat.map(stoItem => {
                        return (
                            <Card key={stoItem.id}>
                                <Image src={stoItem.thumbnail} wrapped ui={false} />
                                <Card.Content>
                                    <Card.Header style={{fontSize: 'medium', color: 'blue'}}>
                                        {`Current Quantity: ${stoItem.count}`}
                                    </Card.Header>
                                    <Card.Header style={{fontSize: 'medium'}}>
                                        {`${stoItem.name}, ${stoItem.productUnit}`}
                                    </Card.Header>
                                    <Card.Description>{`$${stoItem.productPrice} each`}</Card.Description>
                                    {/* <Card.Meta>{`($${stoItem.unitPrice} / ${stoItem.unit})`}</Card.Meta> */}
                                </Card.Content>
                                <Card.Content>
                                    <Checkbox toggle label='Staple Item' checked={stoItem.isStaple} 
                                        onChange={() => handleStapleCheck(stoItem)} />
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <label for='optCnt' 
                                            style={stoItem.isStaple ? 
                                                    {flex: 1, fontSize: 'small'} : 
                                                    {flex: 1, fontSize: 'small', color: 'lightgray'}}>
                                            Optimal Count: 
                                        </label>
                                        <Input type='text' id='optCnt' style={{flex: 1, width: '30%'}} 
                                            disabled={stoItem.isStaple ? '' : 'disabled'} 
                                            value={stoItem.optCount} onChange={(e) => handleOptCountChange(e, stoItem)}/>
                                    </div>
                                    <Button color='red' style={{width: '100%', marginTop: '5px'}} 
                                        disabled={stoItem.isStaple ? '' : 'disabled'}
                                        onClick={() => handleItemAddToCartClick(stoItem)}>
                                        <Icon name='shopping cart' />
                                        {stoItem.isStaple ? `Add ${stoItem.optCount - stoItem.count} / each to cart` : ''}
                                    </Button>
                                </Card.Content>
                            </Card>
                        );
                    })
                }
                </Card.Group>
                <Divider />
            </>
        );
    });

    return (
        <>
            <h1>MyStorage!!</h1>
            {displayMyStorageByCat}
        </>
    );
};

export default MyStorage;