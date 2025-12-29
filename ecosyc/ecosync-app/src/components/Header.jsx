import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const pages = [
    { label: 'Home', path: '/' },
    { label: 'Items', path: '/items' },
    { label: 'About', path: '/about' },
    { label: 'Items' , path: '/ItemDetail' },
    { label: 'List', path: '/list' },
    { label: 'Profile', path: '/profile' },
    { label: 'Chat', path: '/chat/1' },
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gray-800 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <h1 className="text-2xl font-bold mb-2 md:mb-0">EcoSync</h1>
      <nav>
        <div className="flex flex-row gap-4">
          {pages.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded hover:bg-gray-700 transition ${isActive(item.path) ? 'bg-gray-700 font-semibold' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;