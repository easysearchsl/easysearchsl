import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Fade out and remove the initial HTML preloader after mount
const removeInitialPreloader = () => {
  const el = document.getElementById('es-initial-preloader');
  if (!el) return;
  el.classList.add('fade-out');
  window.setTimeout(() => {
    el.parentElement?.removeChild(el);
  }, 350);
};

// Use rAF to schedule after paint
requestAnimationFrame(removeInitialPreloader);
