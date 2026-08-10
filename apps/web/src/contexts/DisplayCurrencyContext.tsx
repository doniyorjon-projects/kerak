import { createContext, useContext, useState, type ReactNode } from "react";

export type DisplayCurrency = "NATIVE" | "UZS" | "USD";

const STORAGE_KEY = "kerak_display_currency";

interface DisplayCurrencyValue {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
}

const DisplayCurrencyContext = createContext<DisplayCurrencyValue | null>(null);

function readStored(): DisplayCurrency {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "UZS" || stored === "USD" ? stored : "NATIVE";
}

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(readStored);

  const setDisplayCurrency = (currency: DisplayCurrency) => {
    setDisplayCurrencyState(currency);
    if (currency === "NATIVE") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, currency);
  };

  return (
    <DisplayCurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency }}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency(): DisplayCurrencyValue {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) throw new Error("useDisplayCurrency must be used within DisplayCurrencyProvider");
  return ctx;
}
