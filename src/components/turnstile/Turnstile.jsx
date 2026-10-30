import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const Turnstile = forwardRef(({ onVerify, onExpire, onError, action }, ref) => {
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacks = useRef({ onVerify, onExpire, onError });

  useEffect(() => {
    callbacks.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (!window.turnstile) {
      console.error("Turnstile no está cargado");
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      theme: "light",
      action: action,
      callback: (token) => callbacks.current.onVerify?.(token),
      'expired-callback': () => callbacks.current.onExpire?.(),
      'error-callback': () => callbacks.current.onError?.()
    });

    return () => {
      window.turnstile.remove(widgetIdRef.current);
    };
  }, [action]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  }), []);

  return <div ref={turnstileRef}></div>;
});

export default Turnstile;