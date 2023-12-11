import { useParams } from 'react-router-dom';

function Item() {
    const params = useParams();
    // console.log('params: ', params);
    const id = params.id;

    return (
        <>
            <p>You are in the Item component.</p>
        </>
    );
}

export default Item;