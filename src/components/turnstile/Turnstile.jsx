import { useEffect, useRef } from "react";

export default function Turnstile({ onVerify, onExpire, onError }) {

const turnstileRef = useRef(null)

const callbacks = useRef({ onVerify, onExpire, onError })

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
      callback: (token) => {
        if (onVerify) onVerify(token);
      },
      'expired-callback': () => {
        if (onExpire) onExpire();
      },
      'error-callback': () => {
        if (onError) onError();
      }
    });

    return () => {
      window.turnstile.remove(widgetId);
    };
  }, []);

return (
<div ref={turnstileRef}></div>
)
};