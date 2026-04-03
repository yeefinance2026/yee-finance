import Stripe from "stripe";

// Verificação de segurança: evita erro fatal se a chave não existir
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error("ERRO CRÍTICO: STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente.");
}

const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: "2023-10-16", // Certifique-se que esta versão é compatível com sua conta
}) : null;

export default async function handler(req, res) {
    // 1. Verificar se o Stripe foi inicializado
    if (!stripe) {
        return res.status(500).json({ error: "Configuração do Stripe ausente no servidor." });
    }

    // 2. Apenas aceitar requisições POST (opcional, mas recomendado)
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    // VERIFIQUE: Este ID deve ser do mesmo ambiente (Test/Live) que sua Secret Key
                    price: "price_1THCkWQYdBKLIhq2Bhsh4srX", 
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/app?success=true`,
            cancel_url: `${req.headers.origin}/app?canceled=true`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("DETALHES DO ERRO STRIPE:", err);
        
        // Retorna erro amigável em vez de crashar a função
        return res.status(err.statusCode || 500).json({
            message: err.message,
            code: err.code,
            type: err.type
        });
    }
}