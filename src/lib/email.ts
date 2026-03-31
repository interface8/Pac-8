const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

interface WelcomeEmailParams {
  to_name: string;
  to_email: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const res = await fetch(EMAILJS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID_WELCOME,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_name: params.to_name,
        to_email: params.to_email,
        website_url: process.env.NEXT_PUBLIC_APP_URL,
      },
    }),
  });

  const text = await res.text();
  console.log("[EmailJS] status:", res.status, "| response:", text);
}

// ─── Order Confirmation Email ─────────────────────────
interface OrderConfirmationEmailParams {
  to_name: string;
  to_email: string;
  order_number: string;
  order_total: string;
  items_summary: string;
  payment_method: string;
}

export async function sendOrderConfirmationEmail(
  params: OrderConfirmationEmailParams,
): Promise<void> {
  const res = await fetch(EMAILJS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID_ORDER,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_name: params.to_name,
        to_email: params.to_email,
        order_number: params.order_number,
        order_total: params.order_total,
        items_summary: params.items_summary,
        payment_method: params.payment_method,
        website_url: process.env.NEXT_PUBLIC_APP_URL,
      },
    }),
  });

  const text = await res.text();
  console.log("[EmailJS] order confirmation:", res.status, "| response:", text);
}
