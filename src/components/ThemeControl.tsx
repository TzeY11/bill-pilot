"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "./ThemeProvider";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="block">
      <span className="form-label">Theme</span>
      <select
        className="form-input"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemePreference)}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ThemeIconToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Icon = resolvedTheme === "dark" ? Moon : Sun;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Icon size={19} />
    </button>
  );
}
