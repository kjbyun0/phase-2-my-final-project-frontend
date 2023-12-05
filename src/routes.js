import App from './App'
import GroceryStore from './pages/GroceryStore';
import MyList from './pages/MyList';
import MyCart from './pages/MyCart';
import MyInventory from './pages/MyInventory';
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
                path: '/myinventory',
                element: <MyInventory />
            }
        ]
    }
];

export default routes;