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
