import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from "../../services/fauna";
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/react';
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

const createCheckoutSession = async (req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST') {
    const session = await getSession({ req }) // captura session dos cookies

    // busca user no banco pelo email
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index("user_by_email"),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id;

    // verifica se o customer ainda não foi criado no stripe
    if(!customerId) {
      // cadastro de cliente no stripe
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        //metadata
      });

      // atualiza id do user com o id do customer criado pelo stripe
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id;
    }

    // criando checkout session no stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
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