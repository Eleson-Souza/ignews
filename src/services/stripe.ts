import Stripe from 'stripe'; // extensão stripe para o server (backend) - requer chave privada
import { version } from '../../package.json';

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name: "Ignews",
      version
    }
  }
);