import { supabase } from "./supabase";

async function testAuth() {
  console.log("🔥 Teste de autenticação Supabase iniciado");

  const email = "teste@exemplo.com";
  const password = "SenhaForte123!";

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) console.error("❌ Erro no cadastro:", signUpError.message);
  else console.log("✅ Cadastro OK:", signUpData.user?.email);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) console.error("❌ Erro no login:", signInError.message);
  else console.log("✅ Login OK:", signInData.session?.user.email);

  const { data: sessionData } = await supabase.auth.getSession();
  console.log("📝 Sessão atual:", sessionData.session?.user.email ?? "nenhuma");

  await supabase.auth.signOut();
  console.log("🔒 Logout realizado");

  const { data: sessionAfterLogout } = await supabase.auth.getSession();
  console.log("📝 Sessão após logout:", sessionAfterLogout.session?.user.email ?? "nenhuma");
}

testAuth();
