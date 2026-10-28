import emailjs from '@emailjs/browser';

const env = import.meta.env;
export const emailEnabled = Boolean(
  env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY,
);

// EmailJS 範本變數：to_email, to_name, code
export function sendCodeEmail({ email, name, code }) {
  return emailjs.send(
    env.VITE_EMAILJS_SERVICE_ID,
    env.VITE_EMAILJS_TEMPLATE_ID,
    { to_email: email, to_name: name, code },
    { publicKey: env.VITE_EMAILJS_PUBLIC_KEY },
  );
}
