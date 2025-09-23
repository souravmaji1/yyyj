import css from 'styled-jsx/css';

export const coinStyles = css.global`
  .coin-container {
    perspective: 1000px;
  }
  .coin {
    width: 120px;
    height: 120px;
    position: relative;
    transform-style: preserve-3d;
  }
  .coin-face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 2rem;
    color: #222;
  }
  .coin-heads {
    background: radial-gradient(circle at 30% 30%, #f7f7f7, #c3c3c3);
  }
  .coin-tails {
    background: radial-gradient(circle at 30% 30%, #ffe680, #d4b46a);
    transform: rotateY(180deg);
  }
  .flipping-heads {
    animation: flip-heads 1.5s ease-in-out forwards;
  }
  .flipping-tails {
    animation: flip-tails 1.5s ease-in-out forwards;
  }
  @keyframes flip-heads {
    0% { transform: rotateY(0); }
    100% { transform: rotateY(720deg); }
  }
  @keyframes flip-tails {
    0% { transform: rotateY(0); }
    100% { transform: rotateY(-720deg); }
  }
  @keyframes confetti-fall {
    0% {transform: translateY(0) rotate(0deg); opacity: 1;}
    100% {transform: translateY(300px) rotate(720deg); opacity: 0;}
  }
  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    animation: confetti-fall 1s forwards;
  }
`;
