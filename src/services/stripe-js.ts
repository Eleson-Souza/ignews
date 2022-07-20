import { loadStripe } from '@stripe/stripe-js'; // extensão stripe para o cliente (browser/frontend) - requer apenas chave pública

export async function getStripeJs() {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  return stripeJs;
}