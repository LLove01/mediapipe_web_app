import logo from './assets/TPhead.png';

const Navbar = () => {
    return (
        <nav className="navbar">
            <img src={logo} alt="Training Point Logo" className="logo" />

            <div className="links">
                <a href="/">Sign Up</a>
                <a href="/create" style={{
                    color: 'white',
                    backgroundColor: '#1EB980',
                    borderRadius: '8px'
                }}>Login</a>
            </div>
        </nav>
    );
}

export default Navbar;