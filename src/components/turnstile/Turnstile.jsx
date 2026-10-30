import { useEffect, useRef } from "react";

export default function Turnstile({ onVerify, onExpire, onError, action }) {

const turnstileRef = useRef(null)

const callbacks = useRef({ onVerify, onExpire, onError})

useEffect(() => {
  callbacks.current = { onVerify, onExpire, onError };
}, [onVerify, onExpire, onError]);

useEffect(() => {
    if (!window.turnstile) {
      console.error("Turnstile no está cargado");
      return;
    }

    const widgetId = window.turnstile.render(turnstileRef.current, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      theme: "light",
      action: action,
      callback: (token) => callbacks.current.onVerify?.(token),
      'expired-callback': () => callbacks.current.onExpire?.(),
      'error-callback': () => callbacks.current.onError?.()
    });

    return () => {
      window.turnstile.remove(widgetId);
    };
  }, []);

return (
<div ref={turnstileRef}></div>
)
};