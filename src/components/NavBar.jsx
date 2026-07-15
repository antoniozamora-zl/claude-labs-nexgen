import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/ordenes', label: 'Ordenes' },
  { to: '/menu', label: 'Menu' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/ajustes', label: 'Ajustes' },
];

export default function NavBar() {
  return (
    <nav className="bg-[#1a1a2e] px-5 py-3 flex gap-2">
      <span className="text-white font-bold text-lg mr-4">EasyOrder</span>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `text-sm px-3 py-1.5 rounded-md transition-colors ${
              isActive
                ? 'bg-[#e94560] text-white'
                : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
