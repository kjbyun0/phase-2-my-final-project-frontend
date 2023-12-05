import App from './App'
import GroceryStore from './pages/GroceryStore';
import MyList from './pages/MyList';
import MyCart from './pages/MyCart';
import MyStorage from './pages/MyStorage';
// import ErrorPage from './pages/ErrorPage';

const routes = [
    {
        path: '/',
        element: <App />,
        // errorElement: ,
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
            }
        ]
    }
];

export default routes;