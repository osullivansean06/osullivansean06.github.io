const grid = document.getElementById('grid');
const scoresBtn = document.getElementById('scoresBtn');
const artifactsBtn = document.getElementById('artifactsBtn');
const scoresModal = document.getElementById('scoresModal');
const artifactsModal = document.getElementById('artifactsModal');
const scoresList = document.getElementById('scoresList');
const highscoreEl = document.getElementById('highscore');
const artifactsList = document.getElementById('artifactsList');

const blockRarity = {
  dirt: 10000,
  rock: 5000,
  gold: 500,
  diamond: 10,
  artifact: 1
};

const blockTypes = {
  dirt: { clicks: 1, colorClass: 'dirt', value: 1 },
  rock: { clicks: 2, colorClass: 'rock', value: 1 },
  gold: { clicks: 1, colorClass: 'gold', value: 10 },
  diamond: { clicks: 5, colorClass: 'diamond', value: 100 },
  artifact: { clicks: 1, colorClass: 'artifact', value: 1000 }
};

let today = new Date().toISOString().slice(0,10);
let scores = JSON.parse(localStorage.getItem('bb_scores')) || [];
let todayScore = scores.find(s => s.date === today);
if (!todayScore) {
  todayScore = { date: today, totalScore: 0, blockCounts: {} };
  scores.unshift(todayScore);
  scores = scores.slice(0,5);
}
let highscore = JSON.parse(localStorage.getItem('bb_highscore')) || { score: 0, date: "" };
let artifacts = JSON.parse(localStorage.getItem('bb_artifacts')) || [];

function saveData() {
  localStorage.setItem('bb_scores', JSON.stringify(scores));
  localStorage.setItem('bb_highscore', JSON.stringify(highscore));
  localStorage.setItem('bb_artifacts', JSON.stringify(artifacts));
}

function weightedRandom() {
  let total = Object.values(blockRarity).reduce((a,b)=>a+b);
  let rand = Math.random()*total;
  let sum = 0;
  for (let type in blockRarity) {
    sum += blockRarity[type];
    if (rand < sum) return type;
  }
}

function generateGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    let type = weightedRandom();
    let block = document.createElement('div');
    block.classList.add('block', blockTypes[type].colorClass);
    block.dataset.type = type;
    block.dataset.remaining = blockTypes[type].clicks;
    block.addEventListener('click', breakBlock);
    grid.appendChild(block);
  }
  updateTodayScore();
  saveBoardState();
}


function breakBlock(e) {
  let block = e.target;
  let type = block.dataset.type;
  let remaining = parseInt(block.dataset.remaining);
  remaining--;
  block.dataset.remaining = remaining;

  if (remaining <= 0) {
    block.removeEventListener('click', breakBlock);
    block.classList.add('pulse');

    setTimeout(() => {
      block.className = 'block empty';
      block.dataset.type = 'empty';
      block.dataset.remaining = 0;
      checkClear();
      saveBoardState();
    }, 300);

    todayScore.totalScore += blockTypes[type].value;
    todayScore.blockCounts[type] = (todayScore.blockCounts[type] || 0) + 1;

    if (type === 'artifact') {
      artifacts.push({ date: today, type: 'artifact', id: `artifact-${Date.now()}` });
    }

    if (todayScore.totalScore > highscore.score) {
      highscore.score = todayScore.totalScore;
      highscore.date = today;
    }

    updateTodayScore();
    saveData();
  } else {
    // Animate partial damage
    block.classList.add('shake');
    block.addEventListener('animationend', () => block.classList.remove('shake'), { once: true });
    block.dataset.remaining = remaining;
    saveBoardState();
  }
}



function checkClear() {
  const remainingBlocks = Array.from(grid.children).filter(b => b.dataset.type !== 'empty');
  if (remainingBlocks.length === 0) {
    refillGrid();
  }
}

function refillGrid() {
  Array.from(grid.children).forEach(slot => {
    let type = weightedRandom();
    slot.className = `block ${blockTypes[type].colorClass}`;
    slot.dataset.type = type;
    slot.dataset.remaining = blockTypes[type].clicks;
    slot.addEventListener('click', breakBlock);
  });
}

scoresBtn.addEventListener('click', ()=>showScores());
artifactsBtn.addEventListener('click', ()=>showArtifacts());

function showScores() {
  scoresList.innerHTML = '';
  scores.forEach(s => {
    let div = document.createElement('div');
    div.textContent = `${s.date}: ${s.totalScore}`;
    scoresList.appendChild(div);
  });
  highscoreEl.textContent = `Highscore: ${highscore.score} (${highscore.date})`;
  scoresModal.classList.remove('hidden');
}

function showArtifacts() {
  artifactsList.innerHTML = '';
  artifacts.forEach(a => {
    let div = document.createElement('div');
    div.textContent = `${a.date}: ${a.id}`;
    artifactsList.appendChild(div);
  });
  artifactsModal.classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function updateTodayScore() {
  const scoreDiv = document.getElementById('todayScore');
  scoreDiv.textContent = `Today's Score: ${todayScore.totalScore}`;
}

function saveBoardState() {
  const boardState = Array.from(grid.children).map(block => ({
    type: block.dataset.type,
    remaining: parseInt(block.dataset.remaining)
  }));
  localStorage.setItem('boardState', JSON.stringify(boardState));
}

function loadBoardState() {
  const stored = localStorage.getItem('boardState');
  if (stored) {
    const boardState = JSON.parse(stored);
    grid.innerHTML = '';
    boardState.forEach(cell => {
      let block = document.createElement('div');
      block.classList.add('block');

      if (cell.type !== 'empty') {
        block.classList.add(blockTypes[cell.type].colorClass);
        block.dataset.type = cell.type;
        block.dataset.remaining = cell.remaining;
        block.addEventListener('click', breakBlock);
      } else {
        block.classList.add('empty');
        block.dataset.type = 'empty';
        block.dataset.remaining = 0;
      }

      grid.appendChild(block);
    });
    updateTodayScore();
  } else {
    generateGrid();
  }
}



loadBoardState();
