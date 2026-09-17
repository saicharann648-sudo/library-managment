// Layout — clean, simple student project application layout
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  BarChart3, LogOut, Sun, Moon, History, Settings,
  GraduationCap, Menu, X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth }  from "../context/AuthContext";
import { getTransactions, getSettings } from "../db/localDB";
import toast from "react-hot-toast";

const Layout = ({ children }) => {
  const [overdueCount, setOverdueCount] = useState(0);
  const [libraryName, setLibraryName]   = useState("School Library");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();

  useEffect(() => {
    const txns = getTransactions();
    const count = txns.filter(
      (t) => t.status === "issued" && new Date(t.dueDate) < new Date()
    ).length;
    setOverdueCount(count);
    setLibraryName(getSettings().libraryName || "School Library");
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const navItems = [
    { to: "/",             icon: LayoutDashboard, label: "Dashboard"    },
    { to: "/books",        icon: BookOpen,         label: "Books"        },
    { to: "/members",      icon: Users,            label: "Members"      },
    { to: "/transactions", icon: ArrowLeftRight,   label: "Issue / Return", badge: overdueCount > 0 ? overdueCount : null },
    { to: "/reports",      icon: BarChart3,        label: "Reports"      },
    { to: "/activity",     icon: History,          label: "Activity Log" },
    { to: "/settings",     icon: Settings,         label: "Settings"     },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
      
      {/* ── Top Header Navigation Bar ── */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo & Title */}
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-lg hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span>{libraryName}</span>
          </NavLink>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-white/20 text-white shadow-inner font-semibold" : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white shadow">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
              <span className="text-xs font-medium text-blue-100 truncate max-w-[140px]">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white text-blue-100 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-blue-700 px-4 py-3 space-y-1">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? "bg-white/20 text-white font-semibold" : "text-blue-100 hover:bg-white/10"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
              <span>Logged in as {currentUser?.email}</span>
              <button onClick={handleLogout} className="text-white font-bold underline">Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {libraryName} Management System — School Web Project</p>
          <p>Built with React & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
