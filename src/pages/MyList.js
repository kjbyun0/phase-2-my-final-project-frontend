import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { List, Image, Button, Icon, Input, Checkbox, Divider, Segment } from 'semantic-ui-react';
import { postItemSync, patchItem, patchItemSync } from './commonLib';

function MyList() {
    const {grocery, idToIndexGrocery, myCart, setMyCart} = useOutletContext();
    // console.log(
    //     'grocery: ', grocery, 
    //     'idToIndexGrocery: ', idToIndexGrocery,
    //     'myCart: ', myCart,
    //     'setMyCart: ', setMyCart
    // );

    const [myList, setMyList] = useState([]);
    const [checkedState, setCheckedState] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/myList`)
        .then(resp => resp.json())
        .then(data => {
            setMyList(data);
            setCheckedState(new Array(data.length).fill(false));
        });
    }, []);

    function handleItemCheckboxChange(index) {
        const newCheckedState = [
            ...checkedState.slice(0, index),
            !checkedState[index],
            ...checkedState.slice(index+1)
        ]
        setCheckedState(checkedState => newCheckedState);

        const isAllTrue = newCheckedState.reduce((res, state) => res &&= state, true);
        // console.log('isAllTrue: ', isAllTrue);
        setIsAllChecked(isAllChecked => isAllTrue);
    }
    // console.log('checkedState: ', checkedState);

    function handleAllCheckboxChange() {
        setIsAllChecked(isAllChecked => !isAllChecked);
        setCheckedState(checkedState => new Array(checkedState.length).fill(!isAllChecked));
    }

    function handleDeleteClick(item) {
        // console.log('handleDeleteClick');
        fetch(`${process.env.REACT_APP_API_URL}/myList/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            setMyList(myList => myList.filter((listItem) => listItem.id !== item.id));

            const newCheckedState = [];
            myList.forEach((listItem, i) => {
                if (listItem.id !== item.id) {
                    newCheckedState.push(checkedState[i]);
                }
            });
            setCheckedState(checkedState => newCheckedState);
        });
    }

    function handleMinusClick(item) {
        // console.log("handleMinusClick");
        patchItem(item, 'myList', {
                quantity: item.quantity - 1
            }, myList, setMyList);
    }
    
    function handlePlusClick(item) {
        // console.log("handlePlusClick");
        patchItem(item, 'myList', {
                quantity: item.quantity + 1
            }, myList, setMyList);
    }

    // When changing an item's quantity, I need to erase and enter a new quantity. 
    // So, I decided to update the quantity only to its useState.
    // And I will update it in json-server when input element is out of focus(onBlur event)
    function handleQuantityChange(e, item) {
        const intVal = parseInt(e.target.value);
        if (e.target.value === '' || !isNaN(intVal)) {
            setMyList(myList => 
                myList.map(listItem => listItem.id === item.id ? 
                    {
                        ...listItem, 
                        quantity: e.target.value === '' ? '' : intVal
                    } : 
                    listItem)
            );
        }
    }
    // console.log('myList: ', myList);

    function handleQuantityBlur(e, item) {
        // console.log('handleQuantityBlur');
        patchItem(item, 'myList', {
                quantity: e.target.value === '' ? 1 : parseInt(e.target.value)
            }, myList, setMyList);
    }

    async function handleAllAddToCartClick() {
        // myCartTemp is the up-to-date copy of myCart as any items in myCart are added or updated.
        // It is to call setMyCart at once after all items are added to myCart.
        const myCartTemp = [...myCart];

        for (let i = 0; i < checkedState.length; i++) {
            if (checkedState[i]) {
                // console.log('Start fetch - GET: ', i);
                await fetch(`${process.env.REACT_APP_API_URL}/myCart/${myList[i].id}`)
                .then(resp => resp.json())
                .then(async data => {
                    // console.log('End fetch - GET: ', i);
                    if (Object.keys(data).length === 0) {
                        // console.log('Start fetch - POST: ', i);
                        await postItemSync('myCart', myList[i], myCartTemp);
                    } 
                    else {
                        // console.log('Start fetch - PATCH: ', i);
                        await patchItemSync(myList[i], 'myCart', 
                            {
                                quantity: data.quantity + myList[i].quantity
                            }, 
                            myCartTemp);
                    }
                })
            }
        }
        setMyCart(myCartTemp);

        // console.log('initializing checkState');
        setCheckedState(checkedState => new Array(checkedState.length).fill(false));
        setIsAllChecked(isAllChecked => false);
    }

    const displayMyList = 
        grocery.length === 0 ? 
        '' : 
        myList.map((item, index) => {
            return (
                <List.Item key={item.id} style={{display: 'flex', alignItems: 'center'}}>
                    <Checkbox style={{flex: 0.01, marginLeft: '30px', marginRight: '10px'}} 
                        checked={checkedState[index]} 
                        onChange={() => handleItemCheckboxChange(index)} />
                    <Image style={{flex: 0.15, marginRight: '40px'}} size='small' 
                        src={grocery[idToIndexGrocery[item.id]].thumbnail} />
                    <Link to={`/item/${item.id}`} style={{flex: 1, color: 'black'}}>
                        <h3>
                            {`${grocery[idToIndexGrocery[item.id]].name}, ${grocery[idToIndexGrocery[item.id]].productUnit}`}
                        </h3>
                    </Link>
                    <div style={{flex: 0.5}}>
                        {
                            item.quantity === 1 ? 
                                <Button icon='trash alternate' onClick={() => handleDeleteClick(item)} /> : 
                                <Button icon='minus' onClick={() => handleMinusClick(item)} />
                        }
                        <Input type='text' value={item.quantity} 
                            onChange={(e) => handleQuantityChange(e, item)} 
                            onBlur={(e) => handleQuantityBlur(e, item)} 
                            style={{width: '60px', textAlign: 'center', marginRight: '3px'}}/>
                        <Button icon='plus' onClick={(e) => handlePlusClick(item)} />
                    </div>
                </List.Item>
            );
        });

    const isAnyChecked = checkedState.reduce((res, state) => res ||= state, false);

    return (
        <>
            <Segment inverted color='orange'>
                <h1>List of favorite items</h1>
            </Segment>
            <Checkbox style={{marginLeft: '30px', marginRight: '10px'}} 
                checked={isAllChecked} 
                onChange={handleAllCheckboxChange} />
            <Button color='red' disabled={!isAnyChecked} 
                onClick={handleAllAddToCartClick}>
                <Icon name='shopping cart' />Add to cart
            </Button>
            <Divider fitted />
            <List divided verticalAlign='middle'>
                {displayMyList}
            </List>
        </>
    );
}

export default MyList;