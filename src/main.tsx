import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { projectId } from "./utils/supabase/info";

// Derived from info.tsx — stays in sync automatically if the project is migrated
const supabaseOrigin = `https://${projectId}.supabase.co`;
for (const rel of ['dns-prefetch', 'preconnect'] as const) {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = supabaseOrigin;
  if (rel === 'preconnect') link.crossOrigin = '';
  document.head.appendChild(link);
}

createRoot(document.getElementById("root")!).render(<App />);
