import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: "price_1THCkWQYdBKLIhq2Bhsh4srX", // 👈 seu ID
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/app`,
            cancel_url: `${req.headers.origin}/app`,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar sessão" });
    }
}