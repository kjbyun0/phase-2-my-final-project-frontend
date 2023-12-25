import App from './App'
import GroceryStore from './pages/GroceryStore';
import MyList from './pages/MyList';
import MyCart from './pages/MyCart';
import MyStorage from './pages/MyStorage';
import Item from './pages/Item';
import ErrorPage from './pages/ErrorPage';

const routes = [
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <GroceryStore />
            },
            {
                path: '/mylist',
                element: <MyList />
            },
            {
                path: '/mycart',
                element: <MyCart />
            },
            {
                path: '/mystorage',
                element: <MyStorage />
            },
            {
                path: '/item/:id',
                element: <Item />
            }
        ]
    }
];

export default routes;