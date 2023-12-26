import { NavLink } from 'react-router-dom';

function NavBar() {
    return (
        <nav>
            <NavLink to='/' className='nav-link'>Grocery Shop</NavLink>
            <NavLink to='/mylist' className='nav-link'>My List</NavLink>
            <NavLink to='/mycart' className='nav-link'>My Cart</NavLink>
            <NavLink to='/mystorage'  className='nav-link'>My Storage</NavLink>
        </nav>
    );
}

export default NavBar;