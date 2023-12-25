
function postItem(to, bodyObj, myState, setMyState) {
    // fetch(`http://localhost:3000/${to}/`, {
    fetch(`${process.env.REACT_APP_API_URL}/${to}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (to === 'myCart') {
            setMyState(myState => [...myState, data]);
        }
        console.log(`POST to ${to}: `, data);
    });
}

async function postItemSync(to, bodyObj, myStateCopy) {
    // await fetch(`http://localhost:3000/${to}/`, {
    await fetch(`${process.env.REACT_APP_API_URL}/${to}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (to === 'myCart') {
            myStateCopy.push(data);
        }
        console.log(`POST to ${to}: `, data);
    });
}

function patchItem(item, to, bodyObj, myState, setMyState) {
    // fetch(`http://localhost:3000/${to}/${item.id}`, {
    fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (to === 'myCart') {
            setMyState(myState.map(sItem => sItem.id === data.id ? data : sItem));
        }
        console.log(`PATCH to ${to}: `, data);
    });
}

async function patchItemSync(item, to, bodyObj, myStateCopy) {
    // await fetch(`http://localhost:3000/${to}/${item.id}`, {
        await fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(resp => resp.json())
    .then(data => {
        if (to === 'myCart') {
            myStateCopy.forEach((item, i) => {
                if (item.id === data.id)
                    myStateCopy[i] = data;
            });
        }
        console.log(`PATCH to ${to}: `, data);
    });
}

function handleAddTo(item, to, myState, setMyState) {
    // fetch(`http://localhost:3000/${to}/${item.id}`)
    fetch(`${process.env.REACT_APP_API_URL}/${to}/${item.id}`)
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

export { postItem, postItemSync, patchItem, patchItemSync, handleAddTo };