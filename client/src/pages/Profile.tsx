import { useState, useEffect, ChangeEvent } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit2, Save, X, LogOut } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileData {
  name: string;
  monthly_income_goal: number;
  current_patrimony: number;
  monthly_contribution: number;
  expected_return_rate: number;
}

export default function Profile() {

  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    monthly_income_goal: 0,
    current_patrimony: 0,
    monthly_contribution: 0,
    expected_return_rate: 0,
  });

  // Carregar dados do perfil
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setLocation("/auth");
          return;
        }

        setUser(session.user);

        // Tenta buscar o perfil
        let { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle(); // Usar maybeSingle() para evitar erro se não existir

        // Se o perfil não existir (erro PGRST116 ou profileData nulo), cria um novo
        if (!profileData) {
          const newProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || "",
            monthly_income_goal: 5000,
            current_patrimony: 0,
            monthly_contribution: 1000,
            expected_return_rate: 8,
            onboarding_completed: false
          };

          const { data: createdProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();

          if (insertError) {
            console.error("Erro ao criar perfil inicial:", insertError);
            toast.error("Erro ao inicializar seu perfil.");
            return;
          }
          profileData = createdProfile;
        }

        if (profileData) {
          const mappedData: ProfileData = {
            name: profileData.name || "",
            monthly_income_goal: profileData.monthly_income_goal || 0,
            current_patrimony: profileData.current_patrimony || 0,
            monthly_contribution: profileData.monthly_contribution || 0,
            expected_return_rate: profileData.expected_return_rate || 0,
          };
          setProfile(mappedData);
          setFormData(mappedData);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Ocorreu um erro inesperado ao carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [setLocation]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          monthly_income_goal: formData.monthly_income_goal,
          current_patrimony: formData.current_patrimony,
          monthly_contribution: formData.monthly_contribution,
          expected_return_rate: formData.expected_return_rate,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Erro ao salvar perfil:", error);
        toast.error("Erro ao salvar seus dados.");
        return;
      }

      setProfile(formData);
      setEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar seus dados.");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
    }
    setEditing(false);
  };

  // Função de logout profissional
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast.error("Erro ao sair da conta.");
        setIsLoggingOut(false);
        return;
      }

      toast.success("Você saiu com sucesso!");
      // Redireciona para login após logout
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao sair da conta.");
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar perfil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation("/app")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <div className="w-10" />
        </div>

        {/* Perfil Card */}
        <Card className="border-none bg-accent/30 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informações Pessoais</CardTitle>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 focus:ring-2 ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 opacity-50 cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 bg-accent text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-lg font-bold">{profile.name || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-bold">{user?.email}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metas Card */}
        <Card className="border-none bg-accent/30 mb-6">
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Meta de Renda Mensal (R$)
                  </label>
                  <input
                    type="number"
                    name="monthly_income_goal"
                    value={formData.monthly_income_goal}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 focus:ring-2 ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Patrimônio Atual (R$)
                  </label>
                  <input
                    type="number"
                    name="current_patrimony"
                    value={formData.current_patrimony}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 focus:ring-2 ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Aporte Mensal (R$)
                  </label>
                  <input
                    type="number"
                    name="monthly_contribution"
                    value={formData.monthly_contribution}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 focus:ring-2 ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rentabilidade Anual Esperada (%)
                  </label>
                  <input
                    type="number"
                    name="expected_return_rate"
                    value={formData.expected_return_rate}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-accent/50 border-none rounded-lg py-3 px-4 focus:ring-2 ring-primary outline-none transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Meta de Renda Mensal</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(profile.monthly_income_goal || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patrimônio Atual</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(profile.current_patrimony || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aporte Mensal</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(profile.monthly_contribution || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rentabilidade Anual</p>
                  <p className="text-lg font-bold">{profile.expected_return_rate || 0}%</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <Edit2 className="w-5 h-5" />
            Editar Perfil
          </button>
        )}

        {/* Botão de Logout Profissional */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full mt-6 py-4 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? "Saindo..." : "Sair da Conta"}
        </button>
      </div>
    </div>
  );
}