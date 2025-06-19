let score = 0;
let currentWord = '';
let selectedTiles = [];
let possibleWords = [];
let foundWords = [];
let letters = [];

const gridEl = document.getElementById('grid');
const currentWordEl = document.getElementById('current-word');
const scoreEl = document.getElementById('score');
const foundWordsEl = document.getElementById('found-words');

function updateScore(points) {
  score += points;
  scoreEl.textContent = `Score: ${score}`;
}

function resetSelection() {
  currentWord = '';
  selectedTiles.forEach(btn => btn.classList.remove('selected'));
  selectedTiles = [];
  currentWordEl.textContent = '';
}

function flashGrid() {
  gridEl.classList.add('flash');
  setTimeout(() => gridEl.classList.remove('flash'), 200);
}

function handleLetterClick(e) {
  const btn = e.target;
  const letter = btn.textContent;

  selectedTiles.push(btn);
  btn.classList.add('selected');
  currentWord += letter;
  currentWordEl.textContent = currentWord;

  if (possibleWords.includes(currentWord) && !foundWords.includes(currentWord)) {
    console.log("match! :", currentWord);
    updateScore(currentWord.length);
    foundWords.push(currentWord);
    const li = document.createElement('li');
    li.textContent = currentWord;
    foundWordsEl.appendChild(li);
    flashGrid();
    resetSelection();
  }
}

function initGrid(letters) {
  gridEl.innerHTML = '';
  letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter.toUpperCase();
    btn.addEventListener('click', handleLetterClick);
    gridEl.appendChild(btn);
  });
}

function loadTodayPuzzle() {
  const todayDate = new Date();
  const y = todayDate.getFullYear();
  const m = String(todayDate.getMonth()+1).padStart(2, '0');
  const d = String(todayDate.getDate()).padStart(2, '0');
  const today = `${y}-${m}-${d}`;

  console.log('Looking for puzzle with date key:', today);

  fetch('puzzles.json')
    .then(res => res.json())
    .then(data => {
      if (data[today]) {
        letters = data[today].letters;
        possibleWords = data[today].words;
        initGrid(letters);
      } else {
        alert('No puzzle for today.');
      }
    })
    .catch(err => console.error('Error loading puzzle:', err));
}


loadTodayPuzzle();

document.getElementById('reset').addEventListener('click', resetSelection);

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
});