const grid = document.getElementById('grid');
const artifactsBtn = document.getElementById('artifactsBtn');
const artifactsModal = document.getElementById('artifactsModal');
const artifactsList = document.getElementById('artifactsList');

const blockRarity = {
  dirt: 5000,
  grass: 5000,
  rock: 1500,
  gold: 500,
  diamond: 100,
  artifact: 10
};

const blockTypes = {
  dirt: { clicks: 1, colorClass: 'dirt', value: 1 },
  grass: { clicks: 1, colorClass: 'grass', value: 1 },
  rock: { clicks: 2, colorClass: 'rock', value: 1 },
  gold: { clicks: 1, colorClass: 'gold', value: 50 },
  diamond: { clicks: 5, colorClass: 'diamond', value: 1000 },
  artifact: { clicks: 1, colorClass: 'artifact', value: 0 }
};

// Define unique artifact items with id and description
const artifactsData = [
  {
    id: 'vase',
    name: 'vase',
    image: 'images/artifact_vase.png'
  },
  {
    id: 'mask',
    name: 'mask',
    image: 'images/artifact_mask.png'
  },
  {
    id: 'scarab',
    name: 'scarab',
    image: 'images/artifact_scarab.png'
  }
];


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
  for (let i = 0; i < 36; i++) {
    let type = weightedRandom();
    let block = document.createElement('div');
    block.classList.add('block', blockTypes[type].colorClass);
    block.dataset.type = type;
    block.dataset.remaining = blockTypes[type].clicks;
    block.addEventListener('click', breakBlock);
    grid.appendChild(block);

    if (type === 'artifact') {
      const artifactId = getRandomArtifactId();
      if (artifactId) {
        block.dataset.artifactId = artifactId;
      } else {
        // All artifacts collected, fallback to dirt or any common block
        type = 'dirt';
        block.classList.add(blockTypes[type].colorClass);
        block.dataset.type = type;
        block.dataset.remaining = blockTypes[type].clicks;
      }
}
    
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

    if (navigator.vibrate) {
        navigator.vibrate(50); // vibrate on destroy
      }
    
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
      const artifactId = block.dataset.artifactId;
      const artifactData = artifactsData.find(a => a.id === artifactId);
    
      // Only collect if not already collected
      if (!artifacts.some(a => a.id === artifactId)) {
        artifacts.push({
          id: artifactData.id,
          name: artifactData.name,
          image: artifactData.image,
          date: today
        });
      }
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

function showArtifacts() {
  artifactsList.innerHTML = '';

  if (artifacts.length === 0) {
    let div = document.createElement('div');
    div.textContent = 'No artifacts collected yet.';
    artifactsList.appendChild(div);
  } else {
    artifacts.forEach(a => {
      let div = document.createElement('div');
      let img = document.createElement('img');
      img.src = a.image;
      img.alt = a.name;
      img.width = 50;
      img.height = 50;
      div.appendChild(img);

      // Optionally show name under image
      let name = document.createElement('div');
      name.textContent = a.name;
      div.appendChild(name);

      artifactsList.appendChild(div);
    });
  }

  artifactsModal.classList.remove('hidden');
}


function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function updateTodayScore() {
  const scoreDiv = document.getElementById('todayScore');
  scoreDiv.textContent = `Score: ${todayScore.totalScore}`;

  const highscoreDiv = document.getElementById('highscore');
  highscoreDiv.textContent = `Highscore: ${highscore.score}`;
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

function getRandomArtifactId() {
  // Get ids of already collected artifacts
  const collectedIds = artifacts.map(a => a.id);
  // Filter uncollected
  const uncollected = artifactsData.filter(a => !collectedIds.includes(a.id));
  // If all collected, return null to avoid spawning artifacts
  if (uncollected.length === 0) return null;
  // Otherwise return a random uncollected artifact id
  return uncollected[Math.floor(Math.random() * uncollected.length)].id;
}



loadBoardState();
