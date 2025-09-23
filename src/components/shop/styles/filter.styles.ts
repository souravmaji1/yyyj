import css from 'styled-jsx/css';

export const filterStyles = css.global`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(102, 112, 133, 0.1);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(2, 167, 253, 0.3);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(2, 167, 253, 0.5);
  }

  /* RC Slider Custom Styling */
  .rc-slider-rail {
    background-color: var(--color-surface) !important;
    height: 8px !important;
  }

  .rc-slider-track {
    background: linear-gradient(to right, var(--color-primary), var(--color-secondary)) !important;
    height: 8px !important;
  }

  .rc-slider-handle {
    border: 2px solid var(--color-primary) !important;
    background-color: var(--brand-neutral-25) !important; /* Light non-white background */
    opacity: 1 !important;
    width: 20px !important;
    height: 20px !important;
    margin-top: -6px !important;
    box-shadow: 0 2px 6px rgba(2, 167, 253, 0.3) !important;
  }

  .rc-slider-handle:hover {
    transform: scale(1.2) !important;
  }

  .rc-slider-handle:active {
    box-shadow: 0 0 5px var(--color-primary) !important;
  }

  .rc-slider-handle:focus {
    box-shadow: 0 0 0 5px rgba(2, 167, 253, 0.2) !important;
  }

  .rc-slider-handle-2 {
    border-color: var(--color-secondary) !important;
    box-shadow: 0 2px 6px rgba(46, 45, 123, 0.3) !important;
  }

  .rc-slider-handle-2:active {
    box-shadow: 0 0 5px var(--color-secondary) !important;
  }

  .rc-slider-handle-2:focus {
    box-shadow: 0 0 0 5px rgba(46, 45, 123, 0.2) !important;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .animation-delay-150 {
    animation-delay: 150ms;
  }
`; 