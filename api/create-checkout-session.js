import Stripe from "stripe";

export default async function handler(req, res) {
    // Diagnóstico inicial
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const keyPrefix = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : "N/A";

    if (req.method !== "POST") {
        return res.status(405).json({ 
            error: "Método não permitido. Use POST.",
            diagnostico: { hasKey, keyPrefix } 
        });
    }

    if (!hasKey) {
        return res.status(500).json({ 
            error: "ERRO: STRIPE_SECRET_KEY não configurada no Vercel.",
            ajuda: "Vá em Settings > Environment Variables no Vercel e adicione a chave."
        });
    }

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{
                price: "price_1THCkWQYdBKLIhq2Bhsh4srX",
                quantity: 1,
            }],
            success_url: `${req.headers.origin}/app?success=true`,
            cancel_url: `${req.headers.origin}/app?canceled=true`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        return res.status(500).json({
            error: "Erro no Stripe SDK",
            message: err.message,
            code: err.code,
            type: err.type,
            diagnostico: { hasKey, keyPrefix }
        });
    }
}
