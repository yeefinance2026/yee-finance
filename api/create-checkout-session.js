import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
    console.log("CHAVE STRIPE:", process.env.STRIPE_SECRET_KEY);

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: "price_1THCkWQYdBKLIhq2Bhsh4srX",
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/app`,
            cancel_url: `${req.headers.origin}/app`,
        });

        res.status(200).json({ url: session.url });
        } catch (err) {
        console.error("ERRO STRIPE COMPLETO:", err);
        
        res.status(500).json({
            error: err.message,
            type: err.type,
            code: err.code
        });
    }
}