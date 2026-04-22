import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/AppShell";
import Dashboard from "./pages/Dashboard";
import Saksflyt from "./pages/Saksflyt";
import Fordeling from "./pages/Fordeling";
import Oppfolging from "./pages/Oppfolging";
import Varsler from "./pages/Varsler";
import Statistikk from "./pages/Statistikk";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/saksflyt" element={<Saksflyt />} />
            <Route path="/fordeling" element={<Fordeling />} />
            <Route path="/oppfolging" element={<Oppfolging />} />
            <Route path="/varsler" element={<Varsler />} />
            <Route path="/statistikk" element={<Statistikk />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
