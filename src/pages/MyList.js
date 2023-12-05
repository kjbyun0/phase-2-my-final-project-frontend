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
        .then(data => setMyList(
            myList.filter(listItem => listItem.id !== item.id)
        ));
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
            myList.map(item => item.id === data.id ? data : item)
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
            myList.map(item => item.id === data.id ? data : item)
        ));
    }

    function handleCountChange(e, index) {
        // need to change its implementation --- fetch
    }
    console.log('myList: ', myList);

    const displayMyList = myList.map((item, index) => {
        return (
            <List.Item key={item.id} style={{display: 'flex', alignItems: 'center'}}>
                <Checkbox style={{flex: 0.05, marginLeft: '30px', marginRight: '10px'}} 
                    checked={checkedState[index]} 
                    onChange={() => handleItemCheckboxChange(index)} />
                <Image style={{flex: 0.15, marginRight: '40px'}} size='mini' src={item.thumbnail} />
                <h3 style={{flex: 1}} >{`${item.name}, ${item.productUnit}`}</h3>
                <div style={{flex: 0.5}}>
                    {
                        item.count === 1 ? 
                            <Button icon onClick={() => handleDeleteClick(item)}><Icon name='trash alternate'/></Button> : 
                            <Button icon onClick={() => handleMinusClick(item)}><Icon name='minus'/></Button>
                    }
                    <Input type='text' value={item.count} onChange={(e) => handleCountChange(e, index)}
                        style={{width: '60px', textAlign: 'center', marginRight: '3px'}}/>
                    <Button icon onClick={(e) => handlePlusClick(item)}><Icon name='plus'/></Button>
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
            <Button color={isAnyTrue ? 'red' : 'grey'} disabled={!isAnyTrue}>Add to cart</Button>
            <Divider fitted />
            <List divided verticalAlign='middle'>
                {displayMyList}
            </List>
        </>
    );
};

export default MyList;