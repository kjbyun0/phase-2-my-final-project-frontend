import { useState, useEffect } from 'react';
import { List, Image, Button, Icon, Input, Checkbox, Divider } from 'semantic-ui-react';

function MyList() {
    const [myList, setMyList] = useState([]);
    const [checkedState, setCheckedState] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3000/myList')
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
        setCheckedState(newCheckedState);

        const isAllTrue = newCheckedState.reduce((res, state) => res &&= state, true);
        // console.log('isAllTrue: ', isAllTrue);
        setIsAllChecked(isAllTrue);

    }
    // console.log('checkedState: ', checkedState);

    function handleAllCheckboxChange() {
        setIsAllChecked(!isAllChecked);
        setCheckedState(new Array(checkedState.length).fill(!isAllChecked));
    }

    function handleDeleteClick(item) {
        // console.log('handleDeleteClick');
        fetch(`http://localhost:3000/myList/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        // .then(data => setMyList(myList.filter(listItem => listItem.id !== item.id)));
        .then(data => {
            const newMyList = [];
            const newCheckedState = [];
            myList.forEach((listItem, i) => {
                if (listItem.id !== item.id) {
                    newMyList.push(listItem);
                    newCheckedState.push(checkedState[i]);
                }
            });
            setMyList(newMyList);
            setCheckedState(newCheckedState);
        });
    }

    function handleMinusClick(item) {
        // console.log("handleMinusClick");
        fetch(`http://localhost:3000/myList/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                count: item.count - 1
            })
        })
        .then(resp => resp.json())
        .then(data => setMyList(
            myList.map(listitem => listitem.id === data.id ? data : listitem)
        ));
    }
    
    function handlePlusClick(item) {
        // console.log("handlePlusClick");
        fetch(`http://localhost:3000/myList/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                count: item.count + 1
            })
        })
        .then(resp => resp.json())
        .then(data => setMyList(
            myList.map(listitem => listitem.id === data.id ? data : listitem)
        ));
    }

    // When changing a item count, I need to erase and enter a new count. 
    // So, I decided to update the count only to its useState.
    // And I will update it in json-server when input element is out of focus(onBlur event)
    // Perhaps, it is a good idea to apply this to other buttons, too. It will reduce number of fetch calls.
    function handleCountChange(e, item) {
        setMyList(myList.map(listItem => 
            listItem.id === item.id ? {...listItem, count: e.target.value} : listItem));
    }
    // console.log('myList: ', myList);

    function handleCountBlur(e, item) {
        // console.log('handleCountBlur');
        fetch(`http://localhost:3000/myList/${item.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                count: e.target.value === '' ? 1 : parseInt(e.target.value)
            })
        })
        .then(resp => resp.json())
        .then(data => setMyList(
            myList.map(listitem => listitem.id === data.id ? data : listitem)
        ));
    }

    async function handleAddToCardClick() {
        // const [myList, setMyList] = useState([]);
        // const [checkedState, setCheckedState] = useState([]);

        for (let i = 0; i < checkedState.length; i++) {
            if (checkedState[i]) {
                // console.log('Start fetch - GET: ', i);
                await fetch(`http://localhost:3000/myCart/${myList[i].id}`)
                .then(resp => resp.json())
                .then(async data => {
                    // console.log('End fetch - GET: ', i);
                    if (Object.keys(data).length === 0) {
                        // console.log('Start fetch - POST: ', i);
                        await fetch('http://localhost:3000/myCart', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(myList[i])
                        })
                        .then(resp => resp.json())
                        .then(data => {
                            // console.log('End fetch - POST: ', i);
                            console.log('Added a new item to myCart: ', data);
                        });
                    } 
                    else {
                        // console.log('Start fetch - PATCH: ', i);
                        await fetch(`http://localhost:3000/myCart/${myList[i].id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                ...myList[i],
                                count: data.count + myList[i].count
                            })
                        })
                        .then(resp => resp.json())
                        .then(data => {
                            // console.log('End fetch - PATCH: ', i);
                            console.log('Edited an existing item in myCart: ', data)
                        });
                    }
                })
            }
        }

        // console.log('initializing checkState');
        setCheckedState(new Array(checkedState.length).fill(false));
        setIsAllChecked(false);
    }

    const displayMyList = myList.map((item, index) => {
        return (
            <List.Item key={item.id} style={{display: 'flex', alignItems: 'center'}}>
                <Checkbox style={{flex: 0.01, marginLeft: '30px', marginRight: '10px'}} 
                    checked={checkedState[index]} 
                    onChange={() => handleItemCheckboxChange(index)} />
                <Image style={{flex: 0.15, marginRight: '40px'}} size='small' src={item.thumbnail} />
                <h3 style={{flex: 1}}>{`${item.name}, ${item.productUnit}`}</h3>
                <div style={{flex: 0.5}}>
                    {
                        item.count === 1 ? 
                            <Button icon='trash alternate' onClick={() => handleDeleteClick(item)} /> : 
                            <Button icon='minus' onClick={() => handleMinusClick(item)} />
                    }
                    <Input type='text' value={item.count} 
                        onChange={(e) => handleCountChange(e, item)} 
                        onBlur={(e) => handleCountBlur(e, item)} 
                        style={{width: '60px', textAlign: 'center', marginRight: '3px'}}/>
                    <Button icon='plus' onClick={(e) => handlePlusClick(item)} />
                </div>
            </List.Item>
        );
    });

    const isAnyTrue = checkedState.reduce((res, state) => res ||= state, false);

    return (
        <>
            <h1>MyList!!</h1>
            <Checkbox style={{marginLeft: '30px', marginRight: '10px'}} 
                checked={isAllChecked} 
                onChange={handleAllCheckboxChange} />
            <Button color={isAnyTrue ? 'red' : 'grey'} disabled={!isAnyTrue} 
                onClick={handleAddToCardClick}>
                <Icon name='shopping cart' />Add to cart
            </Button>
            <Divider fitted />
            <List divided verticalAlign='middle'>
                {displayMyList}
            </List>
        </>
    );
};

export default MyList;