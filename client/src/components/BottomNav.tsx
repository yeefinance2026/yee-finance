import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { 
  Home, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  User,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Escutar mudanças de autenticação para atualizar o menu em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const navItems = [
    {
      label: "Início",
      icon: Home,
      path: "/app",
    },
    {
      label: "Investir",
      icon: TrendingUp,
      path: "/investimentos",
    },
    {
      label: "Ganhos",
      icon: DollarSign,
      path: "/dividendos",
    },
    {
      label: "Simular",
      icon: Calculator,
      path: "/simulacao",
    },
    {
      // Alterna entre Perfil e Login baseado no estado do usuário
      label: user ? "Perfil" : "Login",
      icon: user ? User : LogIn,
      path: user ? "/perfil" : "/auth",
    },
  ];

  // Não renderiza nada enquanto carrega o estado inicial de auth para evitar "pulo" visual
  if (loading) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <nav className="max-w-md mx-auto bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[32px] px-2 h-16 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground/60 hover:text-primary/70"
              )}
            >
              {/* Indicador de item ativo (bolinha ou brilho sutil) */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
              )}
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-primary/5" : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  isActive ? "stroke-[2.5px]" : "stroke-[2px]"
                )} />
              </div>
              {/* Label minimalista apenas se estiver ativo ou muito sutil */}
              <span className={cn(
                "text-[9px] font-bold tracking-tight transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}