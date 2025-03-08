import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Settings, 
  LogOut, 
  Moon, 
  Sun 
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    { name: 'แดชบอร์ด', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'รายการใบเสร็จ', path: '/receiptsList', icon: <Receipt className="w-5 h-5" /> },
    { name: 'ตั้งค่า IMAP', path: '/imapSetting', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="bg-sidebar w-64 p-4 hidden md:block">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-2xl font-bold text-sidebar-foreground flex items-center"
          >
            <Receipt className="mr-2 w-6 h-6" />
            Receipt Manager
          </Link>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-4 py-3 text-sm rounded-md transition-colors
                ${isActive(item.path) 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
              `}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 w-56">
          <div className="border-t border-sidebar-border pt-4 mt-4">
            <button className="flex items-center px-4 py-3 text-sm rounded-md transition-colors w-full hover:bg-sidebar-accent text-sidebar-foreground">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-card border-b h-16 flex items-center px-4 md:px-6">
          <div className="flex-1 flex">
            <span className="md:hidden mr-2">
              {/* Mobile menu button would go here */}
            </span>
            <h1 className="text-xl font-semibold">Receipt Manager</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md hover:bg-accent">
              <Moon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-medium">
                U
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;