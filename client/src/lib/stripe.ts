export async function assinar() {
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();

    window.location.href = data.url;
  } catch (err) {
    console.error(err);
    alert("Erro ao iniciar pagamento");
  }
}