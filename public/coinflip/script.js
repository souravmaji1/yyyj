const coin = document.getElementById('coin');
const flipBtn = document.getElementById('flip-btn');
const guessHeads = document.getElementById('guess-heads');
const guessTails = document.getElementById('guess-tails');
const streakEl = document.getElementById('streak');
const headsCountEl = document.getElementById('heads-count');
const tailsCountEl = document.getElementById('tails-count');
const headsPctEl = document.getElementById('heads-pct');
const tailsPctEl = document.getElementById('tails-pct');
const historyList = document.getElementById('history-list');
const resetHistoryBtn = document.getElementById('reset-history');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');

const flipSound = document.getElementById('flip-sound');
const successSound = document.getElementById('success-sound');

let prediction = null;
let streak = 0;
let heads = 0;
let tails = 0;
let history = [];
let soundEnabled = true;

function updateStats(result, guessed) {
  if (result === 'Heads') heads++; else tails++;
  const total = heads + tails;
  headsCountEl.textContent = heads;
  tailsCountEl.textContent = tails;
  headsPctEl.textContent = ((heads/total)*100).toFixed(0);
  tailsPctEl.textContent = ((tails/total)*100).toFixed(0);

  if (result === guessed) {
    streak++;
    if (soundEnabled) successSound.play();
    if (streak >= 3) {
      confetti({ spread: 70, origin: { y: 0.6 } });
    }
  } else {
    streak = 0;
  }
  streakEl.textContent = streak;
}

function addHistory(result, guessed) {
  const item = document.createElement('li');
  const correct = result === guessed ? '✅' : '❌';
  item.textContent = `${new Date().toLocaleTimeString()} - ${result} ${correct}`;
  historyList.prepend(item);
  history.unshift(item.textContent);
  if (history.length > 10) {
    history.pop();
    historyList.removeChild(historyList.lastChild);
  }
}

function choosePrediction(choice) {
  prediction = choice;
  guessHeads.setAttribute('aria-pressed', choice === 'Heads');
  guessTails.setAttribute('aria-pressed', choice === 'Tails');
}

guessHeads.addEventListener('click', () => choosePrediction('Heads'));
guessTails.addEventListener('click', () => choosePrediction('Tails'));

function flip() {
  if (!prediction) return alert('Select Heads or Tails first');
  coin.classList.remove('flip-animation');
  void coin.offsetWidth; // restart animation
  coin.classList.add('flip-animation');
  if (soundEnabled) flipSound.play();
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  setTimeout(() => {
    coin.style.transform = result === 'Heads' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    updateStats(result, prediction);
    addHistory(result, prediction);
  }, 1000);
}

flipBtn.addEventListener('click', flip);
coin.addEventListener('click', flip);
coin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') flip(); });

resetHistoryBtn.addEventListener('click', () => {
  history = [];
  historyList.innerHTML = '';
  heads = tails = 0;
  streak = 0;
  updateStats('Heads', 'Tails'); // reset stats
});

themeToggle.addEventListener('click', () => {
  const dark = document.body.toggleAttribute('data-theme');
  themeToggle.textContent = dark ? '☀️' : '🌙';
});

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔈';
});
