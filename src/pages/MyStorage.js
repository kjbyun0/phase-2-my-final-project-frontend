import { useState, useEffect } from 'react';

function MyStorage() {
    const [myStorage, setMyStorage] = useState([]);
    const myStorageByCat = {
        vegetables: [],
        fruits: [],
        meatSeafood: [],
        dairyEggs: [],
        pentry: [],
        beverages: []
    };

    useEffect(() => {
        fetch('http://localhost:3000/myStorage')
        .then(resp => resp.json())
        .then(data => {
            setMyStorage(data);
            myStorage.forEach(stoItem => {
                switch(stoItem.category) {
                    case 'vegetables': 
                        myStorageByCat.vegetables.push(stoItem);
                        break;
                    case 'fruits':
                        myStorageByCat.fruits.push(stoItem);
                        break;
                    case 'meatSeafood':
                        myStorageByCat.meatSeafood.push(stoItem);
                        break;
                    case 'dairyEggs':
                        myStorageByCat.dairyEggs.push(stoItem);
                        break;
                    case 'pentry':
                        myStorageByCat.pentry.push(stoItem);
                        break;
                    case 'beverages':
                        myStorageByCat.beverages.push(stoItem);
                        break;
                }
            });
        });
    }, []);

    console.log('MyStorage: ', MyStorage);

    return (
        <>
            <h1>MyStorage!!</h1>
        </>
    );
};

export default MyStorage;