const cardDescriptions = {
  "Pathogen": "+4 Infection Points",
  "Mutation": "Special effect",
  "Spread": "Move up to 3 virus cards to another region",
  "Defense": "Blocks CEVA actions for 3 turns",
  "Civil Unrest": "Stops CEVA from playing in a region for 3 turns",
  "Replication": "Triples a Pathogen's points for 1 round",
  "Incubation": "+2 Points, unremovable for 2 turns",
  "Outbreak": "+2 Points to 2 adjacent regions",
  "Government Response": "Reduces virus points in 1 region for 1 turn",
  "Mucous Membranes": "Stops Spread permanently",
  "Fever": "+1 Macrophages power for 1 turn",
  "Inflammation": "Weakens virus cards for 1 turn",
  "Macrophages": "Removes 1 Pathogen, 50% fail with Defense",
  "Helper T Cells": "Enables B Cells for 3 turns",
  "B Cells": "Produce Antibodies with Helper T Cells",
  "Memory Cells": "Replay an immune card, 50% fail",
  "Antibodies": "Removes 1 virus card",
  "Cytotoxic T Cells": "Removes 1 non-Pathogen card",
  "Vaccination": "Reduces virus points by 0.5",
  "Barriers": "Reduces virus points by 0.5"
};

const mutationTypes = [
  "Drug Resistance",
  "Cold Resistance",
  "Airborne",
  "Heat Resistance",
  "Gene Hardener",
  "Immune Suppressor"
];

const cardPoints = {
  "Pathogen": 4,
  "Mutation": 1,
  "Spread": 0,
  "Defense": 0,
  "Civil Unrest": 0,
  "Replication": 0,
  "Incubation": 2,
  "Outbreak": 0,
  "Government Response": 1,
  "Mucous Membranes": 1,
  "Fever": 1,
  "Inflammation": 1,
  "Macrophages": 1,
  "Helper T Cells": 1,
  "B Cells": 1,
  "Memory Cells": 1,
  "Antibodies": 1,
  "Cytotoxic T Cells": 1,
  "Vaccination": 1,
  "Barriers": 1,
  "Outbreak Point": 2,
  "B Cells Point": 1
};

const regions = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania", "Antarctica"];
const adjacentRegions = {
  "North America": ["South America", "Europe", "Asia"],
  "South America": ["North America", "Africa"],
  "Europe": ["North America", "Africa", "Asia"],
  "Africa": ["South America", "Europe", "Asia", "Oceania"],
  "Asia": ["North America", "Europe", "Africa", "Oceania"],
  "Oceania": ["Africa", "Asia", "Antarctica"],
  "Antarctica": ["Oceania"]
};

let currentPlayer = "Virus";
let round = 1;
let messageLog = [];
let selectedCardIndex = null;
let selectedCard = null;
let botActive = false;
let playerRole = null;

const gameState = {
  regions: {},
  hands: { Virus: [], CEVA: [] },
  decks: {
    Virus: ["Pathogen", "Mutation", "Spread", "Defense", "Civil Unrest", "Replication", "Incubation", "Outbreak"],
    CEVA: ["Government Response", "Mucous Membranes", "Fever", "Inflammation", "Macrophages",
           "Helper T Cells", "B Cells", "Memory Cells", "Antibodies", "Cytotoxic T Cells",
           "Vaccination", "Barriers"]
  },
  mutationTracker: [],
  activeEffects: [],
  playedCards: [],
  feverActive: false,
  feverTurns: 0,
  regionControl: {}
};

function startGame(mode) {
  try {
    botActive = mode !== 'Player';
    playerRole = mode === 'Player' ? null : mode;
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("winScreen").style.display = "none";
    document.getElementById("statusBar").style.display = "block";
    document.getElementById("scorePanel").style.display = "flex";
    document.getElementById("messageLog").style.display = "block";
    document.getElementById("gameBoard").style.display = "grid";
    document.getElementById("controls").style.display = "block";
    initGame();
    console.log(`Game started in mode: ${mode}`);
  } catch (error) {
    console.error("Failed to start game:", error);
    addMessage(`Error starting game: ${error.message}`);
  }
}

function resetGame() {
  // Reset game state
  currentPlayer = "Virus";
  round = 1;
  messageLog = [];
  selectedCardIndex = null;
  selectedCard = null;
  botActive = false;
  playerRole = null;
  gameState.regions = {};
  gameState.hands = { Virus: [], CEVA: [] };
  gameState.decks = {
    Virus: ["Pathogen", "Mutation", "Spread", "Defense", "Civil Unrest", "Replication", "Incubation", "Outbreak"],
    CEVA: ["Government Response", "Mucous Membranes", "Fever", "Inflammation", "Macrophages",
           "Helper T Cells", "B Cells", "Memory Cells", "Antibodies", "Cytotoxic T Cells",
           "Vaccination", "Barriers"]
  };
  gameState.mutationTracker = [];
  gameState.activeEffects = [];
  gameState.playedCards = [];
  gameState.feverActive = false;
  gameState.feverTurns = 0;
  gameState.regionControl = {};

  // Clear UI
  document.getElementById("gameBoard").innerHTML = "";
  document.getElementById("virusHand").innerHTML = "";
  document.getElementById("cevaHand").innerHTML = "";
  document.getElementById("messageLog").innerHTML = "";
  document.getElementById("scorePanel").innerHTML = `
    <div class="team"><span class="virus-icon"></span> Virus: <span>0 regions</span></div>
    <div class="team"><span class="ceva-icon"></span> CEVA: <span>0 regions</span></div>
  `;
  document.getElementById("statusBar").textContent = `Round 1 – Current Player: Virus`;

  // Show main menu, hide game UI
  document.getElementById("winScreen").style.display = "none";
  document.getElementById("statusBar").style.display = "none";
  document.getElementById("scorePanel").style.display = "none";
  document.getElementById("messageLog").style.display = "none";
  document.getElementById("gameBoard").style.display = "none";
  document.getElementById("controls").style.display = "none";
  document.getElementById("mainMenu").style.display = "flex";
}

function initGame() {
  const board = document.getElementById("gameBoard");
  regions.forEach(region => {
    gameState.regions[region] = [];
    gameState.regionControl[region] = null;
    const div = document.createElement("div");
    div.className = "region";
    div.id = region;
    div.innerHTML = `<h3><span class="control-icon"></span>${region}</h3><div class='cards'></div>`;
    div.onclick = () => placeCard(region);
    board.appendChild(div);
  });
  drawCard();
  drawCard();
  renderHands();
  updateStatus();
  updateScores();
  updateMessageLog();
  updateAllRegionsUI();
  if (botActive && playerRole !== currentPlayer) {
    setTimeout(playBotTurn, 1000);
  }
}

function drawCard() {
  const deck = gameState.decks[currentPlayer];
  if (deck.length === 0) return;
  const drawn = deck[Math.floor(Math.random() * deck.length)];
  gameState.hands[currentPlayer].push(drawn);
  addMessage(`${currentPlayer} drew a card.`);
}

function renderHands() {
  const virusHandDiv = document.getElementById("virusHand");
  const cevaHandDiv = document.getElementById("cevaHand");
  virusHandDiv.innerHTML = "";
  cevaHandDiv.innerHTML = "";

  gameState.hands.Virus.forEach((card, idx) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card virus draggable";
    cardDiv.setAttribute("draggable", "true");
    cardDiv.setAttribute("data-card", card);
    cardDiv.setAttribute("data-index", idx);
    cardDiv.innerHTML = `<strong>${card}</strong><br><small>${cardDescriptions[card]}</small>`;
    if (currentPlayer === "Virus" && (playerRole === "Virus" || !botActive)) {
      cardDiv.onclick = () => selectCard(idx, card);
      cardDiv.ondragstart = (e) => dragStart(e, idx, card);
      cardDiv.ondragend = dragEnd;
    }
    virusHandDiv.appendChild(cardDiv);
  });

  gameState.hands.CEVA.forEach((card, idx) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card ceva draggable";
    cardDiv.setAttribute("draggable", "true");
    cardDiv.setAttribute("data-card", card);
    cardDiv.setAttribute("data-index", idx);
    cardDiv.innerHTML = `<strong>${card}</strong><br><small>${cardDescriptions[card]}</small>`;
    if (currentPlayer === "CEVA" && (playerRole === "CEVA" || !botActive)) {
      cardDiv.onclick = () => selectCard(idx, card);
      cardDiv.ondragstart = (e) => dragStart(e, idx, card);
      cardDiv.ondragend = dragEnd;
    }
    cevaHandDiv.appendChild(cardDiv);
  });

  // Add drag-and-drop listeners to regions
  regions.forEach(region => {
    const regionDiv = document.getElementById(region);
    regionDiv.ondragover = (e) => dragOver(e, region);
    regionDiv.ondragenter = (e) => dragEnter(e, region);
    regionDiv.ondragleave = (e) => dragLeave(e, region);
    regionDiv.ondrop = (e) => drop(e, region);
  });
}

function dragStart(e, index, card) {
  if (currentPlayer === "Virus" && (playerRole !== "Virus" && botActive)) return;
  if (currentPlayer === "CEVA" && (playerRole !== "CEVA" && botActive)) return;
  e.dataTransfer.setData("text/plain", JSON.stringify({ index, card }));
  e.target.classList.add("dragging");
  selectedCardIndex = index;
  selectedCard = card;
}

function dragEnd(e) {
  e.target.classList.remove("dragging");
}

function dragOver(e, region) {
  e.preventDefault();
  // Check if the region is a valid drop target
  if (currentPlayer === "CEVA" && gameState.activeEffects.some(e => (e.effect === "Civil Unrest" || e.effect === "Immune Suppressor") && e.region === region && e.turnsRemaining > 0)) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else if (selectedCard === "Spread" && !canUseSpread(region)) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else if (selectedCard === "Memory Cells" && gameState.playedCards.length === 0) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else {
    document.getElementById(region).classList.add("dropzone");
  }
}

function dragEnter(e, region) {
  e.preventDefault();
  if (currentPlayer === "CEVA" && gameState.activeEffects.some(e => (e.effect === "Civil Unrest" || e.effect === "Immune Suppressor") && e.region === region && e.turnsRemaining > 0)) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else if (selectedCard === "Spread" && !canUseSpread(region)) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else if (selectedCard === "Memory Cells" && gameState.playedCards.length === 0) {
    document.getElementById(region).classList.add("dropzone-blocked");
  } else {
    document.getElementById(region).classList.add("dropzone");
  }
}

function dragLeave(e, region) {
  document.getElementById(region).classList.remove("dropzone", "dropzone-blocked");
}

function drop(e, region) {
  e.preventDefault();
  document.getElementById(region).classList.remove("dropzone", "dropzone-blocked");
  const data = JSON.parse(e.dataTransfer.getData("text/plain"));
  selectedCardIndex = data.index;
  selectedCard = data.card;
  placeCard(region);
}

function selectCard(index, card) {
  selectedCardIndex = index;
  selectedCard = card;
}

function placeCard(region) {
  if (selectedCardIndex === null) return;
  if (currentPlayer === "CEVA" && gameState.activeEffects.some(e => e.effect === "Civil Unrest" && e.region === region && e.turnsRemaining > 0)) {
    addMessage(`CEVA blocked by Civil Unrest in ${region}!`);
    selectedCardIndex = null;
    selectedCard = null;
    return;
  }
  if (currentPlayer === "CEVA" && gameState.activeEffects.some(e => e.effect === "Immune Suppressor" && e.region === region && e.turnsRemaining > 0)) {
    addMessage(`CEVA card blocked by Immune Suppressor in ${region}!`);
    selectedCardIndex = null;
    selectedCard = null;
    return;
  }
  if (selectedCard === "Spread" && !canUseSpread(region)) {
    addMessage(`No virus cards to move in ${region}!`);
    selectedCardIndex = null;
    selectedCard = null;
    return;
  }
  if (selectedCard === "Memory Cells" && gameState.playedCards.length === 0) {
    addMessage(`No cards to replay with Memory Cells!`);
    selectedCardIndex = null;
    selectedCard = null;
    return;
  }
  if (gameState.activeEffects.some(e => e.effect === "Heat Resistance" && e.region === region && (selectedCard === "Fever" || selectedCard === "Inflammation" || selectedCard === "Government Response"))) {
    addMessage(`Fever, Inflammation, and Government Response blocked by Heat Resistance in ${region}!`);
    selectedCardIndex = null;
    selectedCard = null;
    return;
  }

  const card = gameState.hands[currentPlayer].splice(selectedCardIndex, 1)[0];
  addMessage(`${currentPlayer} played ${card} in ${region}.`);
  applyCardEffect(region, card);
  selectedCardIndex = null;
  selectedCard = null;
  renderHands();
  updateAllRegionsUI();
  updateScores();
  if (botActive && playerRole !== currentPlayer) {
    setTimeout(playBotTurn, 1000);
  }
}

function canUseSpread(region) {
  return gameState.regions[region].some(entry => entry.player === "Virus");
}

function applyCardEffect(region, card) {
  if (gameState.activeEffects.some(e => e.effect === "Cold Resistance" && e.region === region && e.turnsRemaining > 0)) {
    addMessage(`CEVA card ${card} delayed by Cold Resistance in ${region}!`);
    gameState.activeEffects.push({ region, effect: "Delayed Card", player: "CEVA", card, turnsRemaining: 2 });
    return;
  }

  if (card === "Mutation") {
    const mutationType = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
    gameState.regions[region].push({ player: currentPlayer, card: `Mutation: ${mutationType}`, turnPlaced: round });
    gameState.mutationTracker.push({ region, mutationType, turnPlaced: round });
    gameState.activeEffects.push({ region, effect: mutationType, player: "Virus", turnsRemaining: mutationType === "Immune Suppressor" ? 1 : 999 });
    addMessage(`${currentPlayer} triggered Mutation: ${mutationType} in ${region}.`);
  } else if (card === "Spread") {
    const virusCards = gameState.regions[region].filter(entry => entry.player === "Virus");
    if (virusCards.length > 0 && !gameState.activeEffects.some(e => e.effect === "Mucous Membranes" && e.region === region)) {
      const cardsToMove = virusCards.slice(0, Math.min(3, virusCards.length));
      const targetRegion = adjacentRegions[region][Math.floor(Math.random() * adjacentRegions[region].length)];
      cardsToMove.forEach(card => {
        gameState.regions[region] = gameState.regions[region].filter(c => c !== card);
        gameState.regions[targetRegion].push(card);
      });
      addMessage(`${currentPlayer} moved ${cardsToMove.length} virus card(s) from ${region} to ${targetRegion}.`);
      updateRegionUI(targetRegion);
    }
  } else if (card === "Defense") {
    gameState.activeEffects.push({ region, effect: "Defense", player: "Virus", turnsRemaining: 3 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Civil Unrest") {
    gameState.activeEffects.push({ region, effect: "Civil Unrest", player: "Virus", turnsRemaining: 3 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Replication") {
    const pathogens = gameState.regions[region].filter(c => c.card === "Pathogen");
    if (pathogens.length > 0) {
      gameState.activeEffects.push({ region, effect: "Replication", player: "Virus", turnsRemaining: 1, targetCard: pathogens[0] });
      addMessage(`${currentPlayer} tripled a Pathogen's points in ${region}.`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Incubation") {
    gameState.activeEffects.push({ region, effect: "Incubation", player: "Virus", turnsRemaining: 2 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Outbreak") {
    const adjRegions = adjacentRegions[region].slice(0, 2);
    adjRegions.forEach(r => {
      gameState.regions[r].push({ player: "Virus", card: "Outbreak Point", turnPlaced: round });
      addMessage(`${currentPlayer} added 2 points to ${r} with Outbreak.`);
      updateRegionUI(r);
    });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Government Response") {
    gameState.activeEffects.push({ region, effect: "Government Response", player: "CEVA", turnsRemaining: 1 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
    addMessage(`${currentPlayer} applied Government Response in ${region}.`);
  } else if (card === "Mucous Membranes") {
    gameState.activeEffects.push({ region, effect: "Mucous Membranes", player: "CEVA", turnsRemaining: 999 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Fever") {
    gameState.feverActive = true;
    gameState.feverTurns = 1;
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
    addMessage(`${currentPlayer} activated Fever in ${region}.`);
  } else if (card === "Inflammation") {
    gameState.activeEffects.push({ region, effect: "Inflammation", player: "CEVA", turnsRemaining: 1 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Macrophages") {
    if (!gameState.activeEffects.some(e => e.effect === "Defense" && e.region === region && e.turnsRemaining > 0) || Math.random() < 0.5) {
      const targets = gameState.regions[region].filter(c => c.card === "Pathogen" && !gameState.activeEffects.some(e => e.effect === "Incubation" && e.region === region));
      if (targets.length > 0) {
        gameState.regions[region] = gameState.regions[region].filter(c => c !== targets[0]);
        addMessage(`${currentPlayer} removed a Pathogen in ${region} with Macrophages.`);
      }
    } else {
      addMessage(`Macrophages blocked by Defense in ${region}!`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Helper T Cells") {
    gameState.activeEffects.push({ region, effect: "Helper T Cells", player: "CEVA", turnsRemaining: 3 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "B Cells") {
    if (gameState.activeEffects.some(e => e.effect === "Helper T Cells" && e.region === region)) {
      gameState.regions[region].push({ player: "CEVA", card: "Antibodies", turnPlaced: round });
      addMessage(`${currentPlayer} produced Antibodies in ${region} with B Cells.`);
    } else {
      addMessage(`${currentPlayer} played B Cells in ${region} without Helper T Cells.`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Memory Cells") {
    const pastCards = gameState.playedCards.filter(c => gameState.decks.CEVA.includes(c.card));
    if (pastCards.length > 0 && Math.random() < 0.5) {
      const replayCard = pastCards[Math.floor(Math.random() * pastCards.length)].card;
      gameState.regions[region].push({ player: "CEVA", card: replayCard, turnPlaced: round });
      addMessage(`${currentPlayer} replayed ${replayCard} in ${region} with Memory Cells.`);
      applyCardEffect(region, replayCard);
    } else {
      addMessage(`${currentPlayer}'s Memory Cells failed to replay a card in ${region}.`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Antibodies") {
    if (!gameState.activeEffects.some(e => e.effect === "Defense" && e.region === region && e.turnsRemaining > 0)) {
      let removeCount = 1;
      if (gameState.activeEffects.some(e => e.effect === "Drug Resistance" && e.region === region)) removeCount = Math.max(0, removeCount - 3);
      const virusCards = gameState.regions[region].filter(c => c.player === "Virus" && !gameState.activeEffects.some(e => e.effect === "Incubation" && e.region === region));
      if (gameState.activeEffects.some(e => e.effect === "Gene Hardener" && e.region === region)) {
        if (virusCards.length >= 3) {
          for (let i = 0; i < 3; i++) {
            gameState.regions[region] = gameState.regions[region].filter(c => c !== virusCards[i]);
          }
          addMessage(`${currentPlayer} removed 3 virus cards in ${region} with Antibodies (Gene Hardener).`);
        } else {
          addMessage(`${currentPlayer}'s Antibodies failed to remove cards in ${region} due to Gene Hardener.`);
        }
      } else if (virusCards.length > 0) {
        gameState.regions[region] = gameState.regions[region].filter(c => c !== virusCards[0]);
        addMessage(`${currentPlayer} removed 1 virus card in ${region} with Antibodies.`);
      }
    } else {
      addMessage(`Antibodies blocked by Defense in ${region}!`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Cytotoxic T Cells") {
    if (!gameState.activeEffects.some(e => e.effect === "Defense" && e.region === region && e.turnsRemaining > 0)) {
      const virusCards = gameState.regions[region].filter(c => c.player === "Virus" && c.card !== "Pathogen" && !gameState.activeEffects.some(e => e.effect === "Incubation" && e.region === region));
      if (gameState.activeEffects.some(e => e.effect === "Gene Hardener" && e.region === region)) {
        if (virusCards.length >= 3) {
          for (let i = 0; i < 3; i++) {
            gameState.regions[region] = gameState.regions[region].filter(c => c !== virusCards[i]);
          }
          addMessage(`${currentPlayer} removed 3 non-Pathogen cards in ${region} with Cytotoxic T Cells (Gene Hardener).`);
        } else {
          addMessage(`${currentPlayer}'s Cytotoxic T Cells failed to remove cards in ${region} due to Gene Hardener.`);
        }
      } else if (virusCards.length > 0) {
        gameState.regions[region] = gameState.regions[region].filter(c => c !== virusCards[0]);
        addMessage(`${currentPlayer} removed 1 non-Pathogen card in ${region} with Cytotoxic T Cells.`);
      }
    } else {
      addMessage(`Cytotoxic T Cells blocked by Defense in ${region}!`);
    }
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Vaccination") {
    gameState.activeEffects.push({ region, effect: "Vaccination", player: "CEVA", turnsRemaining: 999 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else if (card === "Barriers") {
    gameState.activeEffects.push({ region, effect: "Barriers", player: "CEVA", turnsRemaining: 999 });
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  } else {
    gameState.regions[region].push({ player: currentPlayer, card, turnPlaced: round });
  }
  gameState.playedCards.push({ player: currentPlayer, card, region, turnPlaced: round });
}

function updateRegionUI(region) {
  const regionDiv = document.getElementById(region);
  regionDiv.classList.add(region.toLowerCase().replace(/\s+/g, "-"));

  const cardsDiv = regionDiv.querySelector(".cards");
  const title = regionDiv.querySelector("h3");
  const controlIcon = title.querySelector(".control-icon");
  controlIcon.className = "control-icon";
  if (gameState.regionControl[region] === "Virus") {
    controlIcon.classList.add("virus-icon");
  } else if (gameState.regionControl[region] === "CEVA") {
    controlIcon.classList.add("ceva-icon");
  }
  cardsDiv.innerHTML = "";
  if (gameState.regions[region].length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-region";
    emptyDiv.textContent = "Be the first to take over this region";
    cardsDiv.appendChild(emptyDiv);
  } else {
    gameState.regions[region].forEach(entry => {
      const cardDiv = document.createElement("div");
      cardDiv.className = `card ${entry.player.toLowerCase()}`;
      cardDiv.innerHTML = `<strong>${entry.player}: ${entry.card}</strong><br><small>${cardDescriptions[entry.card.split(": ")[0]]}</small>`;
      cardsDiv.appendChild(cardDiv);
    });
  }
}

function updateStatus() {
  const statusBar = document.getElementById("statusBar");
  statusBar.textContent = `Round ${round} – Current Player: ${currentPlayer}`;
}

function showWinScreen(winner) {
  const winMessage = document.getElementById("winMessage");
  winMessage.textContent = `Game Over! ${winner} Wins!`;
  document.getElementById("winScreen").style.display = "flex";
  document.getElementById("statusBar").style.display = "none";
  document.getElementById("scorePanel").style.display = "none";
  document.getElementById("messageLog").style.display = "none";
  document.getElementById("gameBoard").style.display = "none";
  document.getElementById("controls").style.display = "none";
}

function updateScores() {
  let virusScore = 0;
  let cevaScore = 0;

  regions.forEach(region => {
    let virusPoints = 0;
    let cevaPoints = 0;
    let virusCards = gameState.regions[region].filter(c => c.player === "Virus");
    let cevaCards = gameState.regions[region].filter(c => c.player === "CEVA");

    if (gameState.activeEffects.some(e => e.effect === "Airborne" && e.region === region)) {
      const virusCards = gameState.regions[region].filter(c => c.player === "Virus");
      if (virusCards.length > 0) {
        const cardsToMove = virusCards.slice(0, Math.min(2, virusCards.length));
        const targetRegion = adjacentRegions[region][Math.floor(Math.random() * adjacentRegions[region].length)];
        cardsToMove.forEach(card => {
          gameState.regions[region] = gameState.regions[region].filter(c => c !== card);
          gameState.regions[targetRegion].push(card);
        });
        addMessage(`Airborne moved ${cardsToMove.length} virus card(s) from ${region} to ${targetRegion}.`);
        updateRegionUI(targetRegion);
      }
    }

    virusCards.forEach(entry => {
      let points = entry.points || cardPoints[entry.card.split(": ")[0]] || 0;
      if (entry.card === "Pathogen" && gameState.activeEffects.some(e => e.effect === "Replication" && e.region === region && e.targetCard === entry)) points *= 3;
      if (gameState.activeEffects.some(e => e.effect === "Inflammation" && e.region === region)) points--;
      if (gameState.activeEffects.some(e => e.effect === "Vaccination" && e.region === region)) points -= 0.5;
      if (gameState.activeEffects.some(e => e.effect === "Government Response" && e.region === region)) points--;
      if (gameState.activeEffects.some(e => e.effect === "Barriers" && e.region === region)) points -= 0.5;
      virusPoints += points > 0 ? points : 0;
    });

    cevaCards.forEach(entry => {
      let points = entry.points || cardPoints[entry.card] || 0;
      if (gameState.feverActive && entry.card === "Macrophages") points++;
      cevaPoints += points;
    });

    if (virusPoints > cevaPoints) {
      gameState.regionControl[region] = "Virus";
      virusScore++;
    } else if (cevaPoints > virusPoints) {
      gameState.regionControl[region] = "CEVA";
      cevaScore++;
    } else if (virusPoints === cevaPoints && virusPoints > 0) {
      gameState.regionControl[region] = "Virus";
      virusScore++;
    } else {
      gameState.regionControl[region] = null;
    }
  });

  const scorePanel = document.getElementById("scorePanel");
  scorePanel.innerHTML = `
    <div class="team"><span class="virus-icon"></span> Virus: <span>${virusScore} regions</span></div>
    <div class="team"><span class="ceva-icon"></span> CEVA: <span>${cevaScore} regions</span></div>
  `;

  updateAllRegionsUI();

  // Check for win condition
  if (round >= 20 && currentPlayer === "CEVA") {
    const winner = virusScore > cevaScore ? "Virus" : virusScore < cevaScore ? "CEVA" : "Draw";
    addMessage(`Game Over! Virus controls ${virusScore} regions, CEVA controls ${cevaScore} regions. Winner: ${winner}`);
    showWinScreen(winner);
  } else if (virusScore === regions.length) {
    addMessage(`Game Over! Virus controls all regions!`);
    showWinScreen("Virus");
  } else if (cevaScore === regions.length) {
    addMessage(`Game Over! CEVA controls all regions!`);
    showWinScreen("CEVA");
  }
}

function addMessage(message) {
  messageLog.unshift({
    text: message,
    player: message.includes("Virus") ? "Virus" : message.includes("CEVA") ? "CEVA" : null
  });
  if (messageLog.length > 10) messageLog.pop();
  updateMessageLog();
}

function updateMessageLog() {
  const logDiv = document.getElementById("messageLog");
  logDiv.innerHTML = messageLog.map((msg, index) => {
    const iconClass = msg.player === "Virus" ? "virus-icon" : msg.player === "CEVA" ? "ceva-icon" : "";
    return `<p class="${index === 0 ? 'latest' : ''}"><span class="${iconClass}"></span> [${round}] ${msg.text}</p>`;
  }).join("");
  logDiv.scrollTop = 0;
}

function endTurn() {
  if (round >= 20 && currentPlayer === "CEVA") {
    updateScores();
    return;
  }

  gameState.activeEffects = gameState.activeEffects.map(e => ({
    ...e,
    turnsRemaining: e.turnsRemaining - 1
  })).filter(e => e.turnsRemaining > 0);

  const delayedCards = gameState.activeEffects.filter(e => e.effect === "Delayed Card" && e.turnsRemaining === 0);
  delayedCards.forEach(e => {
    addMessage(`Delayed card ${e.card} now active in ${e.region}!`);
    applyCardEffect(e.region, e.card);
  });
  gameState.activeEffects = gameState.activeEffects.filter(e => e.effect !== "Delayed Card");

  if (currentPlayer === "CEVA") {
    gameState.feverTurns = Math.max(0, gameState.feverTurns - 1);
    if (gameState.feverTurns === 0) gameState.feverActive = false;
  }

  currentPlayer = currentPlayer === "Virus" ? "CEVA" : "Virus";
  if (currentPlayer === "Virus") round++;
  addMessage(`${currentPlayer}'s turn begins.`);
  drawCard();
  renderHands();
  updateAllRegionsUI();
  updateScores();
  updateStatus();
  if (botActive && playerRole !== currentPlayer) {
    setTimeout(playBotTurn, 1000);
  }
}

function updateAllRegionsUI() {
  regions.forEach(updateRegionUI);
}