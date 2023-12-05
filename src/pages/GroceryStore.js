import { useState, useEffect } from 'react';
import { Card, Image, Button } from 'semantic-ui-react';

function GroceryStore() {
    const [grocery, setGrocery] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/groceryStore')
        .then(resp => resp.json())
        .then(data => setGrocery(data));
    }, []);

    function addToMyList(e,item) {
        fetch(`http://localhost:3000/myList/${item.id}`)
        .then(resp => resp.json())
        .then(data => {
            if (Object.keys(data).length === 0) {
                fetch(`http://localhost:3000/myList/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...item,
                        count: 1
                    })
                })
                .then(resp => resp.json())
                .then(data => console.log('POST to myList: ', data));
            }
            else {
                fetch(`http://localhost:3000/myList/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        count: data.count + 1
                    })
                })
                .then(resp => resp.json())
                .then(data => console.log('PATCH to myList: ', data));
            }
        });
    }

    const displayGrocery = grocery.map(item => {
        return (
            <Card key={item.id}>
                <Image src={item.thumbnail} wrapped ui={false} />
                <Card.Content>
                    <Card.Header>{`$${item.productPrice} each`}</Card.Header>
                    <Card.Meta>{`($${item.unitPrice} / ${item.unit})`}</Card.Meta>
                    <Card.Description>
                        {`${item.name}, ${item.productUnit}`}
                    </Card.Description>
                </Card.Content>
                {/* <Card.Content extra> */}
                    <Button color='red'>Add to cart</Button>
                    <Button basic color='black' onClick={(e) => addToMyList(e, item)}>Add to list</Button>
                {/* </Card.Content> */}
            </Card>
        );
    });

    console.log('displayGrocery', displayGrocery);

    return (
        <>
            <h1>GroceryStore!!</h1>
            <Card.Group itemsPerRow={5}>
                {displayGrocery}
            </Card.Group>
        </>
    );
};

export default GroceryStore;