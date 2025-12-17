'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const MenuContext = createContext<{
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}>({
  menuOpen: false,
  setMenuOpen: () => {},
});

export const useMenuContext = () => useContext(MenuContext);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MenuContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </MenuContext.Provider>
  );
}

