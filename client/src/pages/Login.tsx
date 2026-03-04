import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, ShieldCheck, Mail, Lock, UserPlus, LogIn, Zap } from "lucide-react"; // Zap adicionado aqui
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/app"
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com Google");
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up logic
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: window.location.origin + "/auth"
          }
        });

        if (error) throw error;
        
        if (data.user && data.session) {
          toast.success("Conta criada com sucesso!");
          setLocation("/app");
        } else {
          toast.info("Verifique seu e-mail para confirmar o cadastro!");
        }
      } else {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Bem-vindo de volta!");
        setLocation("/app");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto shadow-lg shadow-primary/20 rotate-3">
            Y
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Yee Finance</h1>
        </div>

        {/* Card Principal */}
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-md rounded-[32px] overflow-hidden">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-xl font-bold">
              {isSignUp ? "Criar nova conta" : "Bem-vindo de volta!"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "Comece seu plano de liberdade hoje." : "Acesse sua conta para continuar."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8 space-y-6">
            {/* Google OAuth (Sempre no topo como opção rápida) */}
            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-transparent px-2 text-muted-foreground font-bold tracking-widest">Ou use seu e-mail</span>
              </div>
            </div>

            {/* Form de E-mail/Senha */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase ml-1 text-muted-foreground">Nome Completo</Label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                      id="name"
                      placeholder="Como podemos te chamar?"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-12 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase ml-1 text-muted-foreground">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-[10px] font-bold uppercase ml-1 text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="pass"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-2"
                disabled={loading}
              >
                {loading ? "Processando..." : (isSignUp ? "Criar Conta" : "Entrar")}
              </Button>
            </form>

            {/* Alternar entre Login/Cadastro */}
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-bold text-primary hover:underline transition-all"
              >
                {isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem conta? Crie uma agora"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios (Versão compacta) */}
        {!isSignUp && (
          <div className="flex justify-center gap-6 px-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Completo</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Rápido</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}