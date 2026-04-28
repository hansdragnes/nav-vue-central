import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@navikt/ds-css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "@fontsource/source-sans-3/700.css";

createRoot(document.getElementById("root")!).render(<App />);
