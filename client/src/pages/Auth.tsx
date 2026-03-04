import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const action = isLogin
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { error } = await action;

    if (error) {
      alert(error.message);
    } else {
      setLocation("/app");
    }
  }

  return (
    <div>
      <h2>{isLogin ? "Login" : "Cadastro"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          {isLogin ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin ? "Criar conta" : "Já tenho conta"}
      </p>
    </div>
  );
}