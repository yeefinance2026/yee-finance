import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeColorProvider } from "./contexts/ThemeColorContext";
import { FinancialProvider } from "./state/FinancialContext";
import Home from "./pages/Home";
import Investimentos from "./pages/Investimentos";
import Dividendos from "./pages/Dividendos";
import Simulacao from "./pages/Simulacao";
import Configuracoes from "./pages/Configuracoes";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import { BottomNav } from "./components/BottomNav";
import PlanoPago from "./pages/PlanoPago";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

function Router() {
  const [location, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setLocation("/");
  };
  const [loading, setLoading] = useState(true);

  // 🔎 Auth + listener
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔁 Redirecionamentos e Verificação de Perfil
  useEffect(() => {
    if (loading) return;

    const isAppRoute = [
      "/app", "/investimentos", "/dividendos", "/simulacao", "/configuracoes", "/perfil", "/onboarding"
    ].includes(location);

    // Se não estiver logado e tentar acessar páginas do app, manda para a landing
    if (!session && isAppRoute) {
      setLocation("/");
      return;
    }

    // Se estiver logado, verifica o onboarding
    if (session) {
      const checkOnboarding = async () => {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .maybeSingle();

          const onboardingComplete = profile?.onboarding_completed || false;

          // Se não completou e não está no onboarding, manda pra lá
          if (!onboardingComplete && location !== "/onboarding") {
            setLocation("/onboarding");
          }
          // Se já completou e está no onboarding ou landing, manda pro app
          else if (onboardingComplete && (location === "/onboarding" || location === "/")) {
            setLocation("/app");
          }
        } catch (err) {
          console.error("Erro ao verificar onboarding:", err);
        }
      };

      checkOnboarding();
    }
  }, [session, loading, location, setLocation]);

  // ⏳ Loading inicial
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-primary font-bold">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        Carregando...
      </div>
    );
  }

  // Rotas que exibem o BottomNav
  const showBottomNav = [
    "/app",
    "/investimentos",
    "/dividendos",
    "/simulacao",
    "/configuracoes",
    "/perfil"
  ].includes(location);

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/perfil" component={Profile} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/app" component={Home} />
        <Route path="/investimentos" component={Investimentos} />
        <Route path="/dividendos" component={Dividendos} />
        <Route path="/simulacao" component={Simulacao} />
        <Route path="/configuracoes" component={Configuracoes} />
        <Route path="/premium" component={PlanoPago} />
        <Route path="/politica-privacidade" component={PrivacyPolicy} />
        <Route path="/termos-uso" component={TermsOfUse} />
        <Route component={NotFound} />
      </Switch>

      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeColorProvider defaultColorTheme="dark-green">
        <ThemeProvider defaultTheme="light">
          <FinancialProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </FinancialProvider>
        </ThemeProvider>
      </ThemeColorProvider>
    </ErrorBoundary>
  );
}

export default App;