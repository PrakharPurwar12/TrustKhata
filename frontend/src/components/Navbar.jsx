import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 text-slate-600 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          to="/"
          className="text-inherit text-xl font-bold tracking-tight text-slate-950 transition hover:text-emerald-600"
        >
          TrustKhata
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-inherit md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-inherit transition hover:text-slate-950">
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          to="/register"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
