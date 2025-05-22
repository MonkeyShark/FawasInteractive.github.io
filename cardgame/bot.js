function playBotTurn() {
  if (playerRole === currentPlayer) return; // Skip if player is controlling current role
  botActive = true;

  const botPlayer = currentPlayer; // Either Virus or CEVA
  const opponent = botPlayer === "Virus" ? "CEVA" : "Virus";
  const hand = gameState.hands[botPlayer];
  if (hand.length === 0) {
    addMessage(`${botPlayer} bot has no cards to play!`);
    endTurn();
    return;
  }

  // Prioritize regions based on strategic value
  const regionScores = regions.map(region => {
    let virusPoints = 0;
    let cevaPoints = 0;
    gameState.regions[region].forEach(entry => {
      let points = entry.points || cardPoints[entry.card.split(": ")[0]] || 0;
      if (entry.player === "Virus") {
        if (entry.card === "Pathogen" && gameState.activeEffects.some(e => e.effect === "Replication" && e.region === region && e.targetCard === entry)) points *= 3;
        if (gameState.activeEffects.some(e => e.effect === "Inflammation" && e.region === region)) points--;
        if (gameState.activeEffects.some(e => e.effect === "Vaccination" && e.region === region)) points -= 0.5;
        if (gameState.activeEffects.some(e => e.effect === "Government Response" && e.region === region)) points--;
        if (gameState.activeEffects.some(e => e.effect === "Barriers" && e.region === region)) points -= 0.5;
        virusPoints += points > 0 ? points : 0;
      } else {
        if (gameState.feverActive && entry.card === "Macrophages") points++;
        cevaPoints += points;
      }
    });
    const score = botPlayer === "Virus" ? virusPoints - cevaPoints : cevaPoints - virusPoints;
    return { region, score, hasOpponent: gameState.regions[region].some(c => c.player === opponent) };
  });

  // Sort regions by score (high to low for Virus, low to high for CEVA) and prioritize regions with opponent presence
  regionScores.sort((a, b) => {
    if (a.hasOpponent && !b.hasOpponent) return -1;
    if (!a.hasOpponent && b.hasOpponent) return 1;
    return botPlayer === "Virus" ? b.score - a.score : a.score - b.score;
  });

  const targetRegion = regionScores[0].region;

  let cardToPlay = null;
  let cardIndex = -1;

  if (botPlayer === "Virus") {
    // Virus bot: Prioritize offensive cards
    const offensiveCards = ["Pathogen", "Incubation", "Outbreak", "Replication", "Mutation"];
    const controlCards = ["Defense", "Civil Unrest"];
    const spreadCard = ["Spread"];

    // 1. Play high-point cards or Outbreak for maximum impact
    for (let i = 0; i < hand.length; i++) {
      if (offensiveCards.includes(hand[i])) {
        if (hand[i] === "Pathogen" || hand[i] === "Incubation") {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        } else if (hand[i] === "Outbreak" && adjacentRegions[targetRegion].length >= 2) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        } else if (hand[i] === "Replication" && gameState.regions[targetRegion].some(c => c.card === "Pathogen" && c.player === "Virus")) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        } else if (hand[i] === "Mutation") {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }

    // 2. Play Spread if there are virus cards to move
    if (!cardToPlay) {
      for (let i = 0; i < hand.length; i++) {
        if (spreadCard.includes(hand[i]) && canUseSpread(targetRegion)) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }

    // 3. Play control cards to block CEVA
    if (!cardToPlay) {
      for (let i = 0; i < hand.length; i++) {
        if (controlCards.includes(hand[i]) && gameState.regions[targetRegion].some(c => c.player === "CEVA")) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }
  } else {
    // CEVA bot: Prioritize offensive and combo cards
    const offensiveCards = ["Helper T Cells", "B Cells", "Vaccination", "Barriers"];
    const removalCards = ["Antibodies", "Cytotoxic T Cells", "Macrophages"];
    const defensiveCards = ["Mucous Membranes", "Government Response", "Inflammation", "Fever"];
    const comboCards = ["Memory Cells"];

    // 1. Play combo cards to build strength
    for (let i = 0; i < hand.length; i++) {
      if (offensiveCards.includes(hand[i])) {
        if (hand[i] === "B Cells" && gameState.activeEffects.some(e => e.effect === "Helper T Cells" && e.region === targetRegion)) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        } else if (hand[i] === "Helper T Cells" || hand[i] === "Vaccination" || hand[i] === "Barriers") {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }

    // 2. Play removal cards if opponent has cards
    if (!cardToPlay && regionScores[0].hasOpponent) {
      for (let i = 0; i < hand.length; i++) {
        if (removalCards.includes(hand[i])) {
          if (hand[i] === "Macrophages" && gameState.regions[targetRegion].some(c => c.card === "Pathogen" && c.player === "Virus")) {
            cardToPlay = hand[i];
            cardIndex = i;
            break;
          } else if (hand[i] === "Cytotoxic T Cells" && gameState.regions[targetRegion].some(c => c.card !== "Pathogen" && c.player === "Virus")) {
            cardToPlay = hand[i];
            cardIndex = i;
            break;
          } else if (hand[i] === "Antibodies") {
            cardToPlay = hand[i];
            cardIndex = i;
            break;
          }
        }
      }
    }

    // 3. Play Memory Cells if viable
    if (!cardToPlay) {
      for (let i = 0; i < hand.length; i++) {
        if (comboCards.includes(hand[i]) && gameState.playedCards.some(c => gameState.decks.CEVA.includes(c.card))) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }

    // 4. Play defensive cards
    if (!cardToPlay) {
      for (let i = 0; i < hand.length; i++) {
        if (defensiveCards.includes(hand[i])) {
          cardToPlay = hand[i];
          cardIndex = i;
          break;
        }
      }
    }
  }

  // Fallback: Play a random card
  if (!cardToPlay) {
    cardIndex = Math.floor(Math.random() * hand.length);
    cardToPlay = hand[cardIndex];
  }

  selectCard(cardIndex, cardToPlay);
  placeCard(targetRegion);
  endTurn();
}