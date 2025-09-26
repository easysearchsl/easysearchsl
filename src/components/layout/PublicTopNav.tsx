import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { fetchMenu } from '@/lib/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Item { label: string; path: string }

export function PublicTopNav() {
  const [items, setItems] = useState<Item[]>([]);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    fetchMenu('public').then((res) => { if (mounted) setItems(res); });
    return () => { mounted = false; };
  }, []);

  const linkClass = (active: boolean) =>
    active
      ? 'text-primary font-medium underline underline-offset-8'
      : 'text-foreground/80 hover:text-primary';

  return (
    <nav aria-label="Primary" className="flex items-center gap-4">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        {items.map((it) => (
          <NavLink
            key={it.path}
            to={it.path}
            className={({ isActive }) => linkClass(isActive)}
            aria-current={location.pathname === it.path ? 'page' : undefined}
          >
            {it.label}
          </NavLink>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-3/4">
            <div className="mt-8 flex flex-col gap-3" role="menu" aria-label="Primary mobile">
              {items.map((it) => (
                <NavLink
                  key={it.path}
                  to={it.path}
                  className={({ isActive }) => linkClass(isActive)}
                  aria-current={location.pathname === it.path ? 'page' : undefined}
                  role="menuitem"
                >
                  {it.label}
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
