import { loadStripe } from "@stripe/stripe-js";
import { PUBLIC_STRIPE_KEY } from "$env/static/public";

export const stripePromise = loadStripe(PUBLIC_STRIPE_KEY);
