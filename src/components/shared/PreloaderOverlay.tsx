import { createPortal } from "react-dom";
import React from "react";

interface PreloaderOverlayProps {
  active: boolean;
}

// Full-screen overlay preloader using EasySearch SL brand colors
// Colors: #29a2d4 (blue), #e86625 (orange), #2f2f2f (dark), #ffffff (white)
export const PreloaderOverlay: React.FC<PreloaderOverlayProps> = ({ active }) => {
  if (typeof document === "undefined") return null;
  const el = (
    <div
      className={`es-preloader-overlay ${active ? "es-preloader-overlay--show" : ""}`}
      aria-hidden={!active}
      role="status"
    >
      <div className="es-preloader">
        <div className="es-preloader__ring">
          <span className="dot dot--blue" />
          <span className="dot dot--orange" />
          <span className="dot dot--dark" />
          <span className="dot dot--white" />
        </div>
        <div className="es-preloader__brand" aria-label="EasySearch SL loading">
          <span className="brand brand--blue">Easy</span>
          <span className="brand brand--orange">Search</span>
          <span className="brand brand--dark"> SL</span>
        </div>
      </div>
    </div>
  );
  return createPortal(el, document.body);
};

export default PreloaderOverlay;
