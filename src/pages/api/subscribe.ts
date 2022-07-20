import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react';
import { stripe } from "../../services/stripe";

const createCheckoutSession = async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const session = await getSession({ req }) // captura session dos cookies
    
    // cadastro de cliente no stripe
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
      //metadata
    });

    // criando checkout session no stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card"],
      billing_address_collection: 'required',
      line_items: [{
        price: "price_1LKsZ3Lu0l1kmzSfHKjJBpTH",
        quantity: 1
      }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}

export default createCheckoutSession;