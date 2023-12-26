
function postItem(to, bodyObj, myState, setMyState) {
    return fetch(`${process.env.REACT_APP_API_URL}/${to}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (myState !== undefined && setMyState !== undefined) {
            setMyState(myState => [...myState, data]);
        }
        console.log(`POST to ${to}: `, data);
    });
}

async function postItemSync(to, bodyObj, myStateCopy) {
    return await fetch(`${process.env.REACT_APP_API_URL}/${to}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (myStateCopy !== undefined) {
            myStateCopy.push(data);
        }
        console.log(`POST to ${to}: `, data);
    });
}

function patchItem(item, to, bodyObj, myState, setMyState) {
    return fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (myState !== undefined && setMyState !== undefined) {
            setMyState(myState.map(sItem => sItem.id === data.id ? data : sItem));
        }
        console.log(`PATCH to ${to}: `, data);
    });
}

async function patchItemSync(item, to, bodyObj, myStateCopy) {
    return await fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (myStateCopy !== undefined) {
            myStateCopy.forEach((item, i) => {
                if (item.id === data.id)
                    myStateCopy[i] = data;
            });
        }
        console.log(`PATCH to ${to}: `, data);
    });
}

function deleteItem(item, from, myState, setMyState) {
    return fetch(`${process.env.REACT_APP_API_URL}/${from}/${item.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(resp => resp.json())
    .then(data => {
        if (myState !== undefined && setMyState !== undefined) {
            setMyState(myState => myState.filter(sItem => sItem.id !== item.id));
        }
        console.log(`DELETE from ${from}: `, item);
    });
}

async function deleteItemSync(item, from) {
    return await fetch(`${process.env.REACT_APP_API_URL}/${from}/${item.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(resp => resp.json())
    .then(data => console.log(`DELETE from ${from}: `,item));
}

function handleAddTo(item, to, myState, setMyState) {
    return fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`)
    .then(resp => resp.json())
    .then(data => {
        if (Object.keys(data).length === 0) {
            postItem(to, 
                {
                    id: item.id,
                    quantity: 1
                }, 
                myState, setMyState);
        }
        else {
            patchItem(item, to, 
                {
                    quantity: data.quantity + 1
                }, 
                myState, setMyState);
        }
    });
}

export { postItem, postItemSync, patchItem, patchItemSync, deleteItem, deleteItemSync, handleAddTo };