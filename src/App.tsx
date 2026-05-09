import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Provider as AkselProvider } from "@navikt/ds-react";
import { nb } from "date-fns/locale";

// Aksel locale-objekt for norsk bokmål
const akselNb = {
  global: {
    dateLocale: nb,
    showMore: "Vis mer",
    showLess: "Vis mindre",
    readOnly: "Skrivebeskyttet",
    close: "Lukk",
    error: "Feil",
    info: "Informasjon",
    success: "Suksess",
    warning: "Advarsel",
    announcement: "Kunngjøring",
  },
};
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/AppShell";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import LederDashboard from "./pages/LederDashboard";
import LederDashboard2 from "./pages/LederDashboard2";
import Saksoversikt from "./pages/Saksoversikt";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <AkselProvider locale={akselNb}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard2" element={<Dashboard2 />} />
            <Route path="/leder" element={<LederDashboard />} />
            <Route path="/leder2" element={<LederDashboard2 />} />
            <Route path="/saksoversikt" element={<Saksoversikt />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AkselProvider>
);

export default App;
