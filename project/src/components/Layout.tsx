import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  BarChart, 
  Settings,
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

function Layout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Roommates', path: '/roommates', icon: <Users size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
            <div className="flex items-center space-x-2">
              <Receipt className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-semibold text-gray-900">RoomSplit</span>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`mr-3 ${
                    location.pathname === item.path
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center mt-1"
                >
                  <LogOut size={12} className="mr-1" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between w-full bg-white border-b border-gray-200 p-4 fixed top-0 z-10">
        <div className="flex items-center space-x-2">
          <Receipt className="h-6 w-6 text-primary-500" />
          <span className="text-lg font-semibold text-gray-900">RoomSplit</span>
        </div>
        <button onClick={toggleMobileMenu} className="text-gray-500 focus:outline-none">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 z-20 bg-gray-900 bg-opacity-50"
          onClick={closeMobileMenu}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-6 w-6 text-primary-500" />
                  <span className="text-lg font-semibold text-gray-900">RoomSplit</span>
                </div>
                <button onClick={closeMobileMenu} className="text-gray-500 focus:outline-none">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.path);
                        closeMobileMenu();
                      }}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                        location.pathname === item.path
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className={`mr-3 ${
                        location.pathname === item.path
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      {currentUser?.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center mt-1"
                    >
                      <LogOut size={12} className="mr-1" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 ${
                location.pathname === item.path
                  ? 'text-primary-500'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Expense floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/expenses/add')}
        className="fixed right-6 bottom-24 md:bottom-6 bg-primary-500 text-white rounded-full p-4 shadow-lg z-10 flex items-center justify-center"
      >
        <Plus size={24} />
      </motion.button>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-16 pt-16 md:pt-0">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;