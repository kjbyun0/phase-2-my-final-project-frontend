import NavBar from '../components/NavBar';
import { useRouteError } from 'react-router-dom';

function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <>
            <header>
                <NavBar />
            </header>
            <main>
                <br />
                <h1>This is not a valid URL!</h1>
                <h1>Please, use one of the links above.</h1>
            </main>
        </>
    );
}

export default ErrorPage;