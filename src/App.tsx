import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ChainProvider } from "@/context/ChainContext";
import { WalletProvider } from "@/context/WalletContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChainRouteHandler } from "@/components/ChainRouteHandler";
import Dashboard from "@/components/Dashboard";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Validators from "./pages/Validators";
import Uptime from "./pages/Uptime";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <ChainProvider>
          <WalletProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ChainRouteHandler>
                <Layout>
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/validators" element={<Validators />} />
                  <Route path="/uptime" element={<Uptime />} />
                  
                  {/* Chain-specific routes */}
                  <Route path="/:chainId/dashboard" element={<Dashboard />} />
                  <Route path="/:chainId/transactions" element={<Transactions />} />
                  <Route path="/:chainId/validators" element={<Validators />} />
                  <Route path="/:chainId/staking" element={<Validators />} />
                  <Route path="/:chainId/staking/:validatorAddress" element={<Validators />} />
                  <Route path="/:chainId/uptime" element={<Uptime />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ChainRouteHandler>
            </BrowserRouter>
          </WalletProvider>
        </ChainProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
