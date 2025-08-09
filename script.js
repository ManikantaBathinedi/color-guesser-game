// Color Guesser Game Logic - Multiplayer Version

class ColorGuesser {
    constructor() {
        this.gameMode = 'lobby'; // lobby, room, game
        this.isHost = false;
        this.playerName = '';
        this.roomId = '';
        this.players = new Map();
        this.gameSettings = {
            roundsPerPlayer: 5,
            timePerRound: 30
        };
        this.gameState = {
            currentPlayerIndex: 0,
            currentRound: 1,
            totalPlayers: 0,
            playerOrder: [],
            scores: new Map(),
            currentColor: null,
            roundStartTime: null,
            roundTimer: null
        };
        this.playerScore = 0;
        this.bestScore = 0;
        this.currentColor = null;
        this.guessColor = null;
        this.gameActive = false;
        this.gameCompleted = false; // Flag to prevent multiple completion screens
        this.roundTimer = null;
        this.timeLeft = 30;
        this.roomUpdateTimer = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.showLobby();
    }
    
    initializeElements() {
        // Lobby elements
        this.lobbySection = document.getElementById('lobbySection');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.soloPlayBtn = document.getElementById('soloPlayBtn');
        this.playerNameInput = document.getElementById('playerName');
        this.joinPlayerNameInput = document.getElementById('joinPlayerName');
        this.roomIdInput = document.getElementById('roomId');
        this.roundsPerPlayerSelect = document.getElementById('roundsPerPlayer');
        this.timePerRoundSelect = document.getElementById('timePerRound');
        
        // Debug: Check if critical elements are found
        console.log('Join room button found:', !!this.joinRoomBtn);
        console.log('Join player name input found:', !!this.joinPlayerNameInput);
        console.log('Room ID input found:', !!this.roomIdInput);
        
        // Room elements
        this.roomSection = document.getElementById('roomSection');
        this.currentRoomIdEl = document.getElementById('currentRoomId');
        this.playerCountEl = document.getElementById('playerCount');
        this.playersListEl = document.getElementById('playersList');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.copyRoomIdBtn = document.getElementById('copyRoomIdBtn');
        this.shareRoomBtn = document.getElementById('shareRoomBtn');
        this.leaveRoomBtn = document.getElementById('leaveRoomBtn');
        this.leaderboardEl = document.getElementById('leaderboard');
        
        // Game elements - New turn-based layout
        this.gameSection = document.getElementById('gameSection');
        this.gameRoomIdEl = document.getElementById('gameRoomId');
        this.gameTimerEl = document.getElementById('gameTimer');
        this.currentRoundEl = document.getElementById('currentRound');
        this.targetColorEl = document.getElementById('targetColor');
        this.targetRGBEl = document.getElementById('targetRGB');
        this.selectionHintEl = document.getElementById('selectionHint');
        this.colorWheel = document.getElementById('colorWheel');
        this.crosshair = document.getElementById('crosshair');
        this.submitBtn = document.getElementById('submitGuess');
        this.playerScoreEl = document.getElementById('playerScore');
        this.roundEl = document.getElementById('round');
        this.bestScoreEl = document.getElementById('bestScore');
        
        // Turn-based game elements
        this.currentPlayerNameEl = document.getElementById('currentPlayerName');
        this.currentPlayerRoundEl = document.getElementById('currentPlayerRound');
        this.totalRoundsPerPlayerEl = document.getElementById('totalRoundsPerPlayer');
        this.liveLeaderboardEl = document.getElementById('liveLeaderboard');
        this.gameProgressEl = document.getElementById('gameProgress');
        this.progressPercentageEl = document.getElementById('progressPercentage');
        this.turnTitleEl = document.getElementById('turnTitle');
        this.roundTimerEl = document.getElementById('roundTimer');
        this.spectatorModeEl = document.getElementById('spectatorMode');
        this.spectatingPlayerEl = document.getElementById('spectatingPlayer');
        
        // Result elements
        this.resultPanel = document.getElementById('resultPanel');
        this.accuracyPercentageEl = document.getElementById('accuracyPercentage');
        this.colorDistanceEl = document.getElementById('colorDistance');
        this.pointsEarnedEl = document.getElementById('pointsEarned');
        this.resultTargetColorEl = document.getElementById('resultTargetColor');
        this.resultGuessColorEl = document.getElementById('resultGuessColor');
        this.resultTargetRGBEl = document.getElementById('resultTargetRGB');
        this.resultGuessRGBEl = document.getElementById('resultGuessRGB');
        this.roundResultsEl = document.getElementById('roundResults');
        this.roundLeaderboardEl = document.getElementById('roundLeaderboard');
        this.nextRoundBtn = document.getElementById('nextRound');
        
        // Control elements
        this.newGameBtn = document.getElementById('newGameBtn');
        this.backToLobbyBtn = document.getElementById('backToLobbyBtn');
        this.messageEl = document.getElementById('message');
        
        // Help elements
        this.helpBtn = document.getElementById('helpBtn');
        this.helpPanel = document.getElementById('helpPanel');
        this.closeHelpBtn = document.getElementById('closeHelp');
        
        this.ctx = this.colorWheel.getContext('2d');
    }
    
    initializeEventListeners() {
        // Lobby event listeners with null checks
        if (this.createRoomBtn) this.createRoomBtn.addEventListener('click', () => this.createRoom());
        if (this.joinRoomBtn) this.joinRoomBtn.addEventListener('click', () => this.joinRoom());
        if (this.soloPlayBtn) this.soloPlayBtn.addEventListener('click', () => this.startSoloGame());
        
        // Room event listeners
        if (this.startGameBtn) this.startGameBtn.addEventListener('click', () => this.startMultiplayerGame());
        if (this.copyRoomIdBtn) this.copyRoomIdBtn.addEventListener('click', () => this.copyRoomId());
        if (this.shareRoomBtn) this.shareRoomBtn.addEventListener('click', () => this.shareRoomLink());
        if (this.leaveRoomBtn) this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());
        
        // Game event listeners
        if (this.submitBtn) this.submitBtn.addEventListener('click', () => this.submitGuess());
        
        // Control event listeners
        if (this.nextRoundBtn) this.nextRoundBtn.addEventListener('click', () => this.nextRound());
        if (this.newGameBtn) this.newGameBtn.addEventListener('click', () => this.newGame());
        if (this.backToLobbyBtn) this.backToLobbyBtn.addEventListener('click', () => this.backToLobby());
        
        // Help event listeners
        if (this.helpBtn) this.helpBtn.addEventListener('click', () => this.showHelp());
        if (this.closeHelpBtn) this.closeHelpBtn.addEventListener('click', () => this.hideHelp());
        
        // Enter key handling
        if (this.playerNameInput) {
            this.playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createRoom();
            });
        }
        
        if (this.joinPlayerNameInput) {
            this.joinPlayerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinRoom();
            });
        }
        
        if (this.roomIdInput) {
            this.roomIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinRoom();
            });
        }
        
        // URL parameters for direct room joining
        this.checkUrlForRoom();
    }
    
    initializeColorWheel() {
        this.drawColorWheel();
        
        this.colorWheel.addEventListener('click', (e) => this.handleColorWheelClick(e));
        this.colorWheel.addEventListener('mousemove', (e) => this.handleColorWheelHover(e));
        this.colorWheel.addEventListener('mouseleave', () => {
            this.crosshair.style.display = 'none';
        });
    }
    
    drawColorWheel() {
        const canvas = this.colorWheel;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 15;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw color wheel with improved accuracy
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    // Calculate angle and normalize to 0-360
                    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    if (angle < 0) angle += 360;
                    
                    // Calculate saturation based on distance from center
                    const saturation = Math.min(100, (distance / radius) * 100);
                    
                    // Use consistent lightness for better color accuracy
                    const lightness = 50;
                    
                    const rgb = this.hslToRgb(angle, saturation, lightness);
                    const index = (y * canvas.width + x) * 4;
                    
                    data[index] = rgb.r;     // Red
                    data[index + 1] = rgb.g; // Green
                    data[index + 2] = rgb.b; // Blue
                    data[index + 3] = 255;   // Alpha
                } else {
                    const index = (y * canvas.width + x) * 4;
                    data[index + 3] = 0; // Transparent outside circle
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add subtle inner highlight for better visual depth
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
    
    hslToRgb(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        if (s === 0) {
            const gray = Math.round(l * 255);
            return { r: gray, g: gray, b: gray };
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        return {
            r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
        };
    }
    
    handleColorWheelClick(e) {
        if (!this.gameActive) return;
        
        const rect = this.colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = this.colorWheel.width / 2;
        const centerY = this.colorWheel.height / 2;
        const radius = Math.min(centerX, centerY) - 15;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance <= radius) {
            const color = this.getColorAtPosition(x, y);
            if (color) {
                this.guessColor = color;
                this.showCrosshair(x, y);
                this.selectionHintEl.textContent = "Color selected ✓";
                this.selectionHintEl.style.color = "#28a745";
                this.submitBtn.disabled = false;
            }
        }
    }
    
    handleColorWheelHover(e) {
        const rect = this.colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = this.colorWheel.width / 2;
        const centerY = this.colorWheel.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (distance <= radius) {
            this.crosshair.style.display = 'block';
            this.crosshair.style.left = (rect.left + x) + 'px';
            this.crosshair.style.top = (rect.top + y) + 'px';
        } else {
            this.crosshair.style.display = 'none';
        }
    }
    
    showCrosshair(x, y) {
        const rect = this.colorWheel.getBoundingClientRect();
        this.crosshair.style.display = 'block';
        this.crosshair.style.left = (rect.left + x) + 'px';
        this.crosshair.style.top = (rect.top + y) + 'px';
        this.crosshair.style.border = '4px solid #fff';
        this.crosshair.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.8)';
        this.crosshair.style.background = 'rgba(255,255,255,0.2)';
        this.crosshair.style.animation = 'pulse 1s ease-in-out';
    }
    
    getColorAtPosition(x, y) {
        // Get color more accurately by reading from the canvas
        try {
            const imageData = this.ctx.getImageData(x, y, 1, 1);
            const pixel = imageData.data;
            
            // Ensure we have valid color data
            if (pixel[3] === 0) {
                // If transparent (outside wheel), return null
                return null;
            }
            
            return {
                r: pixel[0],
                g: pixel[1],
                b: pixel[2]
            };
        } catch (error) {
            console.warn('Could not get color at position:', error);
            // Fallback calculation
            const centerX = this.colorWheel.width / 2;
            const centerY = this.colorWheel.height / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = Math.min(centerX, centerY) - 15;
            const saturation = Math.min(100, (distance / radius) * 100);
            
            return this.hslToRgb(angle, saturation, 50);
        }
    }

    generateRandomRGB() {
        return {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
    }
    
    rgbToString(rgb) {
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    
    formatRGBDisplay(rgb) {
        return `(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    
    calculateColorDistance(color1, color2) {
        // Using Euclidean distance in RGB space
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;
        
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }
    
    calculateAccuracy(distance) {
        // Maximum possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
        const maxDistance = Math.sqrt(255 * 255 * 3);
        const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100);
        return Math.round(accuracy * 100) / 100; // Round to 2 decimal places
    }
    
    startNewRound() {
        this.gameActive = true;
        this.guessColor = null;
        this.currentColor = this.generateRandomRGB();
        
        this.updateDisplay();
        this.resultPanel.style.display = 'none';
        this.submitBtn.disabled = true;
        this.crosshair.style.display = 'none';
        
        this.selectionHintEl.textContent = 'No color selected';
        this.selectionHintEl.style.color = '#666';
        
        this.showMessage('Click on the color wheel to make your guess!', 'info');
    }
    
    updateDisplay() {
        this.targetColorEl.style.backgroundColor = this.rgbToString(this.currentColor);
        this.targetRGBEl.textContent = this.formatRGBDisplay(this.currentColor);
        this.roundEl.textContent = this.round;
        this.totalScoreEl.textContent = this.totalScore;
        this.bestScoreEl.textContent = this.bestScore + '%';
    }
    
    updateGuessDisplay() {
        // This method is no longer needed since we don't show the guess before submission
        // Keeping it empty for backwards compatibility
    }
    
    updateColorDisplay() {
        console.log('updateColorDisplay called with currentColor:', this.currentColor);
        if (this.targetColorEl && this.currentColor) {
            this.targetColorEl.style.backgroundColor = this.rgbToString(this.currentColor);
        }
        if (this.targetRGBEl && this.currentColor) {
            this.targetRGBEl.textContent = this.formatRGBDisplay(this.currentColor);
        }
    }
    
    submitGuess() {
        console.log('submitGuess called');
        console.log('guessColor:', this.guessColor);
        console.log('gameActive:', this.gameActive);
        console.log('isMyTurn():', this.isMyTurn());
        
        if (!this.guessColor || !this.gameActive || !this.isMyTurn()) {
            console.log('Submit guess validation failed');
            return;
        }
        
        console.log('Submitting guess...');
        this.gameActive = false;
        
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
        }
        
        const distance = this.calculateColorDistance(this.currentColor, this.guessColor);
        const accuracy = this.calculateAccuracy(distance);
        const points = Math.round(accuracy);
        
        console.log('Calculated:', { distance, accuracy, points });
        
        this.showRoundResult(accuracy, distance, points);
        
        // Immediately start countdown and do calculations during countdown
        setTimeout(() => {
            this.finishTurnWithCountdown(points, accuracy, distance);
        }, 3000);
    }
    
    showResults(accuracy, distance, points) {
        this.resultPanel.style.display = 'block';
        
        // Show the actual colors in the results
        this.resultTargetColorEl.style.backgroundColor = this.rgbToString(this.currentColor);
        this.resultGuessColorEl.style.backgroundColor = this.rgbToString(this.guessColor);
        this.resultTargetRGBEl.textContent = this.formatRGBDisplay(this.currentColor);
        this.resultGuessRGBEl.textContent = this.formatRGBDisplay(this.guessColor);
        
        // Animate accuracy circle
        const accuracyDeg = (accuracy / 100) * 360;
        const accuracyCircle = document.querySelector('.accuracy-circle');
        accuracyCircle.style.setProperty('--accuracy-deg', accuracyDeg + 'deg');
        
        // Set color based on accuracy
        if (accuracy >= 80) {
            accuracyCircle.className = 'accuracy-circle excellent';
        } else if (accuracy >= 60) {
            accuracyCircle.className = 'accuracy-circle good';
        } else {
            accuracyCircle.className = 'accuracy-circle poor';
        }
        
        this.accuracyPercentageEl.textContent = accuracy.toFixed(1) + '%';
        this.colorDistanceEl.textContent = distance.toFixed(1);
        this.pointsEarnedEl.textContent = points;
        
        // Show message based on accuracy
        let message, messageType;
        if (accuracy >= 95) {
            message = 'Perfect! You have amazing color perception! 🎯';
            messageType = 'success';
        } else if (accuracy >= 80) {
            message = 'Excellent guess! Very close! 🎉';
            messageType = 'success';
        } else if (accuracy >= 60) {
            message = 'Good job! Getting warmer! 👍';
            messageType = 'info';
        } else {
            message = 'Keep trying! Practice makes perfect! 💪';
            messageType = 'error';
        }
        
        this.showMessage(message, messageType);
        this.updateDisplay();
    }
    
    nextRound() {
        if (this.round >= 10) {
            this.endGame();
        } else {
            this.round++;
            this.resetRoundState();
            this.generateNewColor();
            this.updateDisplay();
        }
    }
    
    newGame() {
        this.resetGame();
        this.showLobby();
    }
    
    endGame() {
        this.gameActive = false;
        this.clearGameTimer();
        
        if (this.gameMode === 'multiplayer') {
            this.updateMultiplayerScores();
            this.showFinalResults();
        } else {
            this.showMessage(`Game Over! Final Score: ${this.totalScore} points`, 'info');
        }
    }
    
    updateMultiplayerScores() {
        // Update player score in the room
        for (const [id, player] of this.players) {
            if (player.name === this.playerName) {
                player.score = this.totalScore;
                break;
            }
        }
        this.saveRoomToStorage();
        this.updateRoomDisplay();
    }
    
    showFinalResults() {
        // Create sorted leaderboard
        const sortedPlayers = Array.from(this.players.values())
            .sort((a, b) => b.score - a.score);
        
        this.roundLeaderboardEl.innerHTML = '';
        sortedPlayers.forEach((player, index) => {
            const playerEl = document.createElement('div');
            playerEl.className = `leaderboard-item ${index === 0 ? 'winner' : ''}`;
            playerEl.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="name">${player.name}</span>
                <span class="score">${player.score} pts</span>
            `;
            this.roundLeaderboardEl.appendChild(playerEl);
        });
        
        this.roundResultsEl.style.display = 'block';
    }
    
    showMessage(text, type = 'info') {
        if (!this.messageEl) return;
        
        this.messageEl.textContent = text;
        this.messageEl.className = `message ${type}`;
        this.messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (this.messageEl) {
                this.messageEl.style.display = 'none';
            }
        }, 3000);
    }

    // Multiplayer room management methods
    createRoom() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            this.showMessage('Please enter your name');
            return;
        }
        
        // Performance warning for GitHub Pages
        this.showMessage('⚠️ Note: This uses simulated multiplayer. For real multiplayer with 50+ players, a backend server is required.', 'warning');
        
        // Get game settings from form
        this.gameSettings.roundsPerPlayer = parseInt(this.roundsPerPlayerSelect.value);
        this.gameSettings.timePerRound = parseInt(this.timePerRoundSelect.value);
        
        this.playerName = playerName;
        this.roomId = this.generateRoomId();
        this.isHost = true;
        this.gameMode = 'multiplayer';
        
        console.log('Creating room with settings:', this.gameSettings);
        
        // Initialize players map with host
        this.players.set('host', {
            name: playerName,
            score: 0,
            totalScore: 0,
            roundsCompleted: 0,
            ready: false,
            isHost: true
        });
        
        this.showRoom();
        this.updateRoomDisplay();
        this.saveRoomToStorage();
        this.startRoomPolling();
    }
    
    joinRoom() {
        console.log('Join room clicked'); // Debug log
        const playerName = this.joinPlayerNameInput.value.trim();
        const roomId = this.roomIdInput.value.trim();
        
        console.log('Player name:', playerName, 'Room ID:', roomId); // Debug log
        
        if (!playerName || !roomId) {
            this.showMessage('Please enter both name and room ID');
            return;
        }
        
        // For local testing, simulate joining any room
        if (window.location.protocol === 'file:') {
            console.log('Local file mode - simulating room join');
            this.simulateRoomJoin(playerName, roomId);
            return;
        }
        
        // Check if room exists in localStorage (simulated multiplayer)
        const existingRoom = this.loadRoomFromStorage(roomId);
        console.log('Existing room:', existingRoom); // Debug log
        
        if (!existingRoom) {
            this.showMessage('Room not found. Please check the room ID.');
            return;
        }
        
        this.playerName = playerName;
        this.roomId = roomId;
        this.isHost = false;
        this.gameMode = 'multiplayer';
        
        // Load existing players and add new player
        this.players = new Map(existingRoom.players || []);
        const playerId = `player_${Date.now()}`;
        this.players.set(playerId, {
            name: playerName,
            score: 0,
            totalScore: 0,
            roundsCompleted: 0,
            ready: false,
            isHost: false
        });
        
        console.log('Players after join:', this.players); // Debug log
        
        this.showRoom();
        this.updateRoomDisplay();
        this.saveRoomToStorage();
        
        // Start polling for room updates
        this.startRoomPolling();
    }
    
    simulateRoomJoin(playerName, roomId) {
        // For local testing - always allow joining with any room ID
        this.playerName = playerName;
        this.roomId = roomId;
        this.isHost = false;
        this.gameMode = 'multiplayer';
        
        // Create a simulated room with the joining player
        this.players = new Map();
        this.players.set('host', {
            name: 'Host Player',
            score: 0,
            ready: false,
            isHost: true
        });
        this.players.set('player_' + Date.now(), {
            name: playerName,
            score: 0,
            ready: false,
            isHost: false
        });
        
        this.showRoom();
        this.updateRoomDisplay();
        this.showMessage('Joined room successfully! (Local simulation)');
    }
    
    startRoomPolling() {
        // Adaptive polling based on player count for better performance
        const playerCount = this.players.size;
        let pollingInterval = 2000; // Default 2 seconds
        
        if (playerCount > 20) {
            pollingInterval = 5000; // 5 seconds for 20+ players
            console.warn(`Performance mode: Using ${pollingInterval}ms polling for ${playerCount} players`);
        } else if (playerCount > 10) {
            pollingInterval = 3000; // 3 seconds for 10+ players
        }
        
        // Poll for room updates
        if (this.roomUpdateTimer) {
            clearInterval(this.roomUpdateTimer);
        }
        
        this.roomUpdateTimer = setInterval(() => {
            if ((this.gameMode === 'multiplayer' || this.gameMode === 'game') && this.roomId) {
                this.checkRoomUpdates();
            }
        }, pollingInterval);
        
        console.log(`Room polling started with ${pollingInterval}ms interval for ${playerCount} players`); // Debug log
    }
    
    stopRoomPolling() {
        if (this.roomUpdateTimer) {
            clearInterval(this.roomUpdateTimer);
            this.roomUpdateTimer = null;
        }
    }
    
    checkRoomUpdates() {
        const currentRoom = this.loadRoomFromStorage(this.roomId);
        if (currentRoom && currentRoom.players) {
            const newPlayersMap = new Map(currentRoom.players);
            
            // Load game settings from room
            if (currentRoom.gameSettings) {
                this.gameSettings = currentRoom.gameSettings;
            }
            
            // Check if game state changed (host started the game)
            if (currentRoom.gameState === 'game' && this.gameMode !== 'game') {
                console.log('Game started by host - joining game');
                this.gameMode = 'game';
                
                // Load turn state and convert scores back to Map
                if (currentRoom.turnState) {
                    this.gameState = currentRoom.turnState;
                    // Convert scores object back to Map
                    if (this.gameState.scores && typeof this.gameState.scores === 'object') {
                        const scoresMap = new Map();
                        for (const [key, value] of Object.entries(this.gameState.scores)) {
                            scoresMap.set(key, value);
                        }
                        this.gameState.scores = scoresMap;
                    }
                }
                
                this.players = newPlayersMap;
                this.showGame();
                this.initTurnBasedGame();
                return;
            }
            
            // If we're in game mode, sync turn state
            if (this.gameMode === 'game' && currentRoom.turnState) {
                const oldCurrentPlayer = this.gameState.currentPlayerIndex;
                const oldRound = this.gameState.currentRound;
                const oldColor = this.gameState.currentColor;
                
                // Update game state from room and convert scores back to Map
                this.gameState = currentRoom.turnState;
                if (this.gameState.scores && typeof this.gameState.scores === 'object') {
                    const scoresMap = new Map();
                    for (const [key, value] of Object.entries(this.gameState.scores)) {
                        scoresMap.set(key, value);
                    }
                    this.gameState.scores = scoresMap;
                }
                
                // Sync timer for spectators
                if (!this.isMyTurn() && this.gameState.timeLeft !== undefined) {
                    this.timeLeft = this.gameState.timeLeft;
                    this.updateTimerDisplay();
                }
                
                // If current color changed, update display for spectators
                if (this.gameState.currentColor && JSON.stringify(oldColor) !== JSON.stringify(this.gameState.currentColor)) {
                    console.log('Color changed for spectator, updating:', this.gameState.currentColor);
                    this.currentColor = this.gameState.currentColor;
                    this.updateColorDisplay();
                    
                    // Force update the color display elements
                    if (this.targetColorEl) {
                        this.targetColorEl.style.backgroundColor = this.rgbToString(this.gameState.currentColor);
                    }
                    if (this.targetRGBEl) {
                        this.targetRGBEl.textContent = this.formatRGBDisplay(this.gameState.currentColor);
                    }
                }
                
                // Check if turn changed
                if (oldCurrentPlayer !== this.gameState.currentPlayerIndex || oldRound !== this.gameState.currentRound) {
                    console.log('Turn changed - updating display');
                    
                    // Update turn display first - this will set gameActive correctly
                    this.updateTurnDisplay();
                    
                    // If it's now my turn, initialize for my turn
                    if (this.isMyTurn()) {
                        this.resetRoundState();
                        this.startRoundTimer();
                    }
                }
                
                this.updateLiveLeaderboard();
                this.updatePlayerStats();
            }
            
            // Check if player count changed
            if (newPlayersMap.size !== this.players.size) {
                console.log('Room updated - player count changed');
                this.players = newPlayersMap;
                this.updateRoomDisplay();
                if (this.gameMode === 'game') {
                    console.log('Updating leaderboard due to player count change');
                    this.updateLiveLeaderboard();
                    this.updatePlayerStats();
                }
            } else {
                // Even if player count didn't change, sync the players data
                this.players = newPlayersMap;
                if (this.gameMode === 'game') {
                    this.updateLiveLeaderboard();
                    this.updatePlayerStats();
                }
            }
            
            // Check if any player scores changed
            let scoresChanged = false;
            for (const [id, player] of newPlayersMap) {
                const currentPlayer = this.players.get(id);
                if (currentPlayer && currentPlayer.score !== player.score) {
                    scoresChanged = true;
                    break;
                }
            }
            
            if (scoresChanged) {
                console.log('Room updated - scores changed');
                this.players = newPlayersMap;
                this.updateRoomDisplay();
                if (this.gameMode === 'game') {
                    this.updateLiveLeaderboard();
                    this.updatePlayerStats();
                }
            }
            
            // Check if game is completed (all players finished their rounds) - check at end for all players
            if (this.gameMode === 'game' && this.gameState.currentPlayerIndex >= this.gameState.totalPlayers && !this.gameCompleted) {
                console.log('Game completed - all players finished their rounds');
                this.gameActive = false;
                this.gameCompleted = true;
                this.stopRoomPolling(); // Stop polling to prevent repeated calls
                this.showGameCompletionScreen();
                return;
            }
        }
    }
    
    startSoloGame() {
        this.gameMode = 'solo';
        this.isHost = true;
        this.playerName = 'Solo Player';
        this.roomId = '';
        this.players.clear();
        this.showGame();
        this.initGame();
    }
    
    generateRoomId() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    copyRoomId() {
        console.log('Copying room ID:', this.roomId); // Debug log
        
        // Just copy the room ID, not the full URL
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                console.log('Room ID copied successfully'); // Debug log
                this.showMessage('Room ID copied to clipboard!');
            }).catch((err) => {
                console.error('Clipboard write failed:', err); // Debug log
                this.fallbackCopyText(this.roomId);
            });
        } else {
            console.log('Using fallback copy method for room ID'); // Debug log
            this.fallbackCopyText(this.roomId);
        }
    }
    
    shareRoomLink() {
        const roomUrl = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        console.log('Sharing room URL:', roomUrl); // Debug log
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(roomUrl).then(() => {
                console.log('Room URL copied successfully'); // Debug log
                this.showMessage('Room link copied to clipboard!');
            }).catch((err) => {
                console.error('Clipboard write failed:', err); // Debug log
                this.fallbackCopyText(roomUrl);
            });
        } else {
            console.log('Using fallback copy method for room URL'); // Debug log
            this.fallbackCopyText(roomUrl);
        }
    }
    
    fallbackCopyText(text) {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            
            // Focus and select the text
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            // Execute copy command
            const successful = document.execCommand('copy');
            console.log('Fallback copy successful:', successful); // Debug log
            
            if (successful) {
                this.showMessage('Room link copied to clipboard!');
            } else {
                this.showMessage(`Copy failed. Room ID: ${this.roomId}`);
            }
            
            // Clean up
            document.body.removeChild(textArea);
        } catch (err) {
            console.error('Fallback copy failed:', err); // Debug log
            this.showMessage(`Copy failed. Room ID: ${this.roomId}`);
        }
    }
    
    leaveRoom() {
        if (this.isHost) {
            // Host leaving ends the room
            this.deleteRoomFromStorage();
        } else {
            // Remove player from room
            const existingRoom = this.loadRoomFromStorage(this.roomId);
            if (existingRoom) {
                const updatedPlayers = new Map(existingRoom.players);
                // Find and remove current player
                for (const [key, player] of updatedPlayers) {
                    if (player.name === this.playerName && !player.isHost) {
                        updatedPlayers.delete(key);
                        break;
                    }
                }
                existingRoom.players = Array.from(updatedPlayers);
                localStorage.setItem(`colorGuesser_room_${this.roomId}`, JSON.stringify(existingRoom));
            }
        }
        
        this.resetGame();
        this.stopRoomPolling(); // Stop polling when leaving room
        this.showLobby();
    }
    
    startMultiplayerGame() {
        if (!this.isHost) {
            this.showMessage('Only the host can start the game');
            return;
        }
        
        if (this.players.size < 2) {
            this.showMessage('Need at least 2 players to start');
            return;
        }
        
        // Performance limits for stable gameplay
        if (this.players.size > 20) {
            this.showMessage('⚠️ Warning: 20+ players may cause performance issues. Consider limiting to 15 players for optimal experience.', 'warning');
        }
        
        if (this.players.size > 30) {
            this.showMessage('❌ Error: 30+ players not supported on GitHub Pages. Please use a real backend server for large games.', 'error');
            return;
        }
        
        console.log('Starting multiplayer game with settings:', this.gameSettings);
        
        // Initialize turn-based game state
        this.gameState.playerOrder = Array.from(this.players.keys());
        this.gameState.totalPlayers = this.players.size;
        this.gameState.currentPlayerIndex = 0;
        this.gameState.currentRound = 1;
        
        // Initialize scores for all players
        for (const [playerId, player] of this.players) {
            this.gameState.scores.set(playerId, {
                totalScore: 0,
                roundsCompleted: 0,
                currentRoundScore: 0
            });
        }
        
        this.gameMode = 'game';
        this.saveRoomToStorage();
        
        this.showGame();
        this.initTurnBasedGame();
    }
    
    initTurnBasedGame() {
        console.log('Initializing turn-based game');
        console.log('Live leaderboard element:', this.liveLeaderboardEl);
        
        // Reset completion flag when starting turn-based game
        this.gameCompleted = false;
        
        // Set up UI for turn-based game
        this.totalRoundsPerPlayerEl.textContent = this.gameSettings.roundsPerPlayer;
        this.updateTurnDisplay();
        this.updateLiveLeaderboard();
        this.initializeColorWheel(); // Initialize the color wheel
        this.initializePlayerTurn(); // This will handle ready button for first player's first round
    }
    
    getCurrentPlayer() {
        const currentPlayerId = this.gameState.playerOrder[this.gameState.currentPlayerIndex];
        return this.players.get(currentPlayerId);
    }
    
    isMyTurn() {
        const currentPlayer = this.getCurrentPlayer();
        const result = currentPlayer && currentPlayer.name === this.playerName;
        console.log('isMyTurn check:', {
            currentPlayer: currentPlayer?.name,
            myName: this.playerName,
            result: result,
            playerOrder: this.gameState.playerOrder,
            currentIndex: this.gameState.currentPlayerIndex
        });
        return result;
    }
    
    updateTurnDisplay() {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;
        
        // Update current round display immediately
        if (this.currentRoundEl) {
            this.currentRoundEl.textContent = this.gameState.currentRound;
        }
        if (this.roundEl) {
            this.roundEl.textContent = this.gameState.currentRound;
        }
        
        this.currentPlayerNameEl.textContent = currentPlayer.name;
        this.currentPlayerRoundEl.textContent = this.gameState.currentRound;
        this.turnTitleEl.textContent = `${currentPlayer.name}'s Turn - Round ${this.gameState.currentRound}`;
        
        // Update round info for current player
        const currentPlayerId = this.gameState.playerOrder[this.gameState.currentPlayerIndex];
        const currentPlayerScore = this.gameState.scores.get(currentPlayerId) || { roundsCompleted: 0 };
        
        if (this.isMyTurn()) {
            // It's my turn - show game controls and ensure game is active
            this.gameActive = true;
            this.spectatorModeEl.style.display = 'none';
            this.colorWheel.style.display = 'block';
            this.submitBtn.style.display = 'block';
            this.selectionHintEl.style.display = 'block';
        } else {
            // I'm spectating - show spectator mode
            this.gameActive = false;
            this.spectatorModeEl.style.display = 'block';
            this.spectatingPlayerEl.textContent = currentPlayer.name;
            
            // Check if I have completed all my rounds
            const myPlayerId = this.findPlayerIdByName(this.playerName);
            const myScore = myPlayerId ? this.gameState.scores.get(myPlayerId) : null;
            const hasCompletedAllRounds = myScore && myScore.roundsCompleted >= this.gameSettings.roundsPerPlayer;
            
            if (hasCompletedAllRounds) {
                // I'm done - hide controls and show spectate mode
                this.colorWheel.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.selectionHintEl.style.display = 'none';
            } else {
                // I'm waiting for my turn - hide controls
                this.colorWheel.style.display = 'none';
                this.submitBtn.style.display = 'none';
                this.selectionHintEl.style.display = 'none';
            }
            
            // Spectators should see the target color and RGB values
            if (this.gameState.currentColor) {
                this.targetColorEl.style.backgroundColor = this.rgbToString(this.gameState.currentColor);
                this.targetRGBEl.textContent = this.formatRGBDisplay(this.gameState.currentColor);
            }
        }
        
        // Update progress
        const totalRounds = this.gameSettings.roundsPerPlayer * this.gameState.totalPlayers;
        const completedRounds = (this.gameState.currentPlayerIndex * this.gameSettings.roundsPerPlayer) + (this.gameState.currentRound - 1);
        const progressPercent = Math.round((completedRounds / totalRounds) * 100);
        
        this.gameProgressEl.style.width = progressPercent + '%';
        this.progressPercentageEl.textContent = progressPercent + '%';
    }
    
    showGameCompletionScreen() {
        console.log('Showing game completion screen');
        
        // Hide game controls
        if (this.colorWheel) this.colorWheel.style.display = 'none';
        if (this.submitBtn) this.submitBtn.style.display = 'none';
        if (this.spectatorModeEl) this.spectatorModeEl.style.display = 'none';
        if (this.selectionHintEl) this.selectionHintEl.style.display = 'none';
        
        // Create and show results screen overlay
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'game-results-overlay';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1.05); box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3); }
                50% { transform: scale(1.1); box-shadow: 0 12px 24px rgba(255, 215, 0, 0.5); }
                100% { transform: scale(1.05); box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3); }
            }
        `;
        document.head.appendChild(style);
        
        resultsContainer.innerHTML = `
            <div class="results-content" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 1.5rem 0; font-size: 2.5rem;">🎉 Game Complete!</h2>
                <div class="final-leaderboard" style="margin: 1.5rem 0;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🏆 Final Results</h3>
                    <div id="finalLeaderboard" style="
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                        padding: 1rem;
                        margin: 1rem 0;
                    "></div>
                </div>
                <div class="game-actions" style="margin-top: 2rem;">
                    <button id="playAgainBtn" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0 10px;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">🔄 Play Again</button>
                    <button id="backToLobbyBtn" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0 10px;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: background 0.3s;
                    ">🏠 Back to Lobby</button>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(resultsContainer);
        
        // Populate final leaderboard
        this.updateFinalLeaderboard();
        
        // Add event listeners
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            if (this.isHost()) {
                this.restartGame();
            } else {
                alert('Only the host can start a new game');
            }
            // Remove overlay
            document.body.removeChild(resultsContainer);
        });
        
        document.getElementById('backToLobbyBtn').addEventListener('click', () => {
            this.backToLobby();
            // Remove overlay
            document.body.removeChild(resultsContainer);
        });
        
        // Add hover effects
        const buttons = resultsContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.opacity = '0.8';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.opacity = '1';
            });
        });
    }
    
    updateFinalLeaderboard() {
        const finalLeaderboard = document.getElementById('finalLeaderboard');
        if (!finalLeaderboard) return;
        
        // Convert scores Map to array and sort by total score
        const sortedPlayers = [];
        for (const [playerId, playerData] of this.players) {
            const scoreData = this.gameState.scores.get(playerId);
            if (scoreData) {
                sortedPlayers.push({
                    name: playerData.name,
                    totalScore: scoreData.totalScore || 0,
                    roundsCompleted: scoreData.roundsCompleted || 0
                });
            }
        }
        
        sortedPlayers.sort((a, b) => b.totalScore - a.totalScore);
        
        // Define medal/rank styling
        const getRankIcon = (index) => {
            switch(index) {
                case 0: return '🥇';
                case 1: return '🥈';
                case 2: return '🥉';
                default: return `#${index + 1}`;
            }
        };
        
        const getRankStyle = (index) => {
            const baseStyle = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px 20px;
                margin: 10px 0;
                border-radius: 12px;
                font-weight: bold;
                font-size: 1.1rem;
                transition: transform 0.3s ease;
            `;
            
            switch(index) {
                case 0: return baseStyle + `
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    color: #2C1810;
                    box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3);
                    transform: scale(1.05);
                `;
                case 1: return baseStyle + `
                    background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
                    color: #2C2C2C;
                    box-shadow: 0 6px 12px rgba(192, 192, 192, 0.3);
                `;
                case 2: return baseStyle + `
                    background: linear-gradient(135deg, #CD7F32, #B8860B);
                    color: #FFF;
                    box-shadow: 0 4px 8px rgba(205, 127, 50, 0.3);
                `;
                default: return baseStyle + `
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                `;
            }
        };
        
        finalLeaderboard.innerHTML = sortedPlayers.map((player, index) => `
            <div style="${getRankStyle(index)}">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 1.5rem; margin-right: 15px;">${getRankIcon(index)}</span>
                    <span style="font-weight: bold; font-size: 1.2rem;">${player.name}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.3rem; font-weight: bold;">${player.totalScore} pts</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${player.roundsCompleted}/${this.gameSettings.roundsPerPlayer} rounds</div>
                </div>
            </div>
        `).join('');
        
        // Add some celebration animation for the winner
        if (sortedPlayers.length > 0) {
            setTimeout(() => {
                const winner = finalLeaderboard.querySelector('div');
                if (winner) {
                    winner.style.animation = 'pulse 2s infinite';
                }
            }, 500);
        }
    }
    
    restartGame() {
        // Reset completion flag
        this.gameCompleted = false;
        
        // Stop room polling temporarily
        this.stopRoomPolling();
        
        // Reset game state but keep players
        this.gameState = {
            currentPlayerIndex: 0,
            currentRound: 1,
            totalPlayers: this.players.size,
            playerOrder: Array.from(this.players.keys()),
            scores: new Map(),
            currentColor: null,
            roundStartTime: null,
            roundTimer: null
        };
        
        // Initialize scores for all players
        for (const playerId of this.players.keys()) {
            this.gameState.scores.set(playerId, {
                totalScore: 0,
                roundsCompleted: 0,
                currentRoundScore: 0
            });
        }
        
        // Save and restart
        this.saveRoomToStorage();
        location.reload(); // Simple restart
    }
    
    backToLobby() {
        // Reset to lobby mode
        this.gameMode = 'multiplayer';
        this.gameState = null;
        this.gameCompleted = false; // Reset completion flag
        
        // Stop room polling
        this.stopRoomPolling();
        
        // Show lobby, hide game
        this.lobbyEl.style.display = 'block';
        this.gameContainerEl.style.display = 'none';
        
        // Update room state
        this.saveRoomToStorage();
    }

    isHost() {
        // Check if current player is the host by checking if they have host permissions
        // In multiplayer, the host is identified by the 'host' key in players map
        if (this.players.has('host')) {
            const hostPlayer = this.players.get('host');
            return hostPlayer && hostPlayer.name === this.playerName;
        }
        // In solo mode, consider the player as host
        return this.gameMode === 'solo';
    }
    
    updatePlayerStats() {
        // Update individual player stats at bottom of screen
        if (!this.playerName) return;
        
        // Find current player's data
        const myPlayerId = this.findPlayerIdByName(this.playerName);
        if (!myPlayerId) return;
        
        const myScore = this.gameState.scores.get(myPlayerId);
        if (!myScore) return;
        
        // Update current score
        if (this.playerScoreEl) {
            this.playerScoreEl.textContent = myScore.totalScore;
        }
        
        // Update current round (show completed rounds + 1 if not finished)
        if (this.roundEl) {
            const currentRound = myScore.roundsCompleted < this.gameSettings.roundsPerPlayer ? 
                myScore.roundsCompleted + 1 : this.gameSettings.roundsPerPlayer;
            this.roundEl.textContent = currentRound;
        }
        
        // Calculate and update best score percentage
        if (this.bestScoreEl && myScore.roundsCompleted > 0) {
            // Calculate best score as average accuracy percentage
            const maxPossibleScore = myScore.roundsCompleted * 100; // Assuming max 100 points per round
            const actualPercentage = maxPossibleScore > 0 ? (myScore.totalScore / maxPossibleScore) * 100 : 0;
            this.bestScoreEl.textContent = Math.min(100, actualPercentage).toFixed(1) + '%';
        }
    }
    
    findPlayerIdByName(playerName) {
        for (const [id, player] of this.players.entries()) {
            if (player.name === playerName) {
                return id;
            }
        }
        return null;
    }
    
    updateLiveLeaderboard() {
        if (!this.liveLeaderboardEl) {
            console.log('Leaderboard element not found');
            return;
        }
        
        console.log('Updating leaderboard with players:', this.players.size, 'scores:', this.gameState.scores);
        console.log('Players map:', Array.from(this.players.entries()));
        console.log('Scores map:', Array.from(this.gameState.scores.entries()));
        
        // Convert scores to array and sort by total score
        const sortedPlayers = Array.from(this.players.entries()).map(([id, player]) => {
            const scoreData = this.gameState.scores.get(id) || { totalScore: 0, roundsCompleted: 0 };
            return {
                id,
                player,
                ...scoreData
            };
        }).sort((a, b) => b.totalScore - a.totalScore);
        
        console.log('Sorted players for leaderboard:', sortedPlayers);
        
        this.liveLeaderboardEl.innerHTML = '';
        
        if (sortedPlayers.length === 0) {
            this.liveLeaderboardEl.innerHTML = '<div class="leaderboard-empty">No players found</div>';
            return;
        }
        
        sortedPlayers.forEach((playerData, index) => {
            const isCurrentTurn = this.gameState.playerOrder && 
                playerData.id === this.gameState.playerOrder[this.gameState.currentPlayerIndex];
            
            const playerEl = document.createElement('div');
            playerEl.className = `leaderboard-player ${isCurrentTurn ? 'current-turn' : ''} ${index === 0 ? 'winner' : ''}`;
            
            playerEl.innerHTML = `
                <span class="player-rank">#${index + 1}</span>
                <div class="player-info">
                    <div class="player-name">${playerData.player.name}${playerData.player.isHost ? ' 👑' : ''}</div>
                    <div class="player-progress">${playerData.roundsCompleted}/${this.gameSettings.roundsPerPlayer} rounds</div>
                </div>
                <span class="player-score">${playerData.totalScore}</span>
            `;
            
            this.liveLeaderboardEl.appendChild(playerEl);
        });
        
        console.log('Leaderboard updated with', sortedPlayers.length, 'players');
    }
    
    startCurrentPlayerTurn() {
        console.log('Starting turn for player:', this.getCurrentPlayer()?.name);
        console.log('Game state:', this.gameState);
        console.log('Players:', Array.from(this.players.entries()));
        
        // Clear any existing timers first
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }
        
        // Color should already be generated when ready button was clicked
        // Update color display for current player
        if (this.currentColor) {
            this.updateColorDisplay();
        }
        
        // Reset game state for new round
        this.guessColor = null;
        this.resetRoundState();
        
        // Update displays BEFORE starting timer - this will set gameActive correctly
        this.updateTurnDisplay();
        this.updateLiveLeaderboard();
        
        // Save current state for spectators to see
        this.saveRoomToStorage();
        
        // Start round timer
        this.startRoundTimer();
        
        // Save state to sync with other players
        this.gameState.currentColor = this.currentColor; // Include current color for spectators
        this.saveRoomToStorage();
    }
    
    startRoundTimer() {
        this.timeLeft = this.gameSettings.timePerRound;
        
        // Store timer start time for synchronization
        this.gameState.roundStartTime = Date.now();
        this.gameState.timeLeft = this.timeLeft;
        this.saveRoomToStorage();
        
        this.updateTimerDisplay();
        
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
        }
        
        this.roundTimer = setInterval(() => {
            this.timeLeft--;
            this.gameState.timeLeft = this.timeLeft;
            this.updateTimerDisplay();
            
            // Save timer state for spectators
            if (this.isMyTurn()) {
                this.saveRoomToStorage();
            }
            
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        if (this.roundTimerEl) {
            this.roundTimerEl.textContent = this.timeLeft + 's';
        }
    }
    
    handleTimeUp() {
        console.log('Time is up!');
        
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }
        
        this.gameActive = false;
        
        if (this.isMyTurn()) {
            // If it's my turn and time is up, submit with 0 score
            this.showMessage('Time\'s up! Moving to next turn...', 'info');
            setTimeout(() => {
                this.finishTurn(0);
            }, 1500);
        }
    }
    
    finishTurnWithCountdown(points, accuracy, distance) {
        console.log('Finishing turn with countdown - score:', points);
        
        const currentPlayerId = this.gameState.playerOrder[this.gameState.currentPlayerIndex];
        const scoreData = this.gameState.scores.get(currentPlayerId);
        
        // Update scores during countdown
        if (scoreData) {
            scoreData.totalScore = (scoreData.totalScore || 0) + points;
            scoreData.currentRoundScore = points;
        }
        
        // Clear any existing timers
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }

        // Check if current player has completed all rounds
        if (this.gameState.currentRound >= this.gameSettings.roundsPerPlayer) {
            // Player finished all rounds
            const finishedPlayerId = currentPlayerId;
            const finishedPlayerData = this.players.get(finishedPlayerId);
            
            // Move to next player
            this.gameState.currentPlayerIndex++;
            this.gameState.currentRound = 1;
            
            // Mark player as completed
            const playerScore = this.gameState.scores.get(finishedPlayerId);
            if (playerScore) {
                playerScore.roundsCompleted = this.gameSettings.roundsPerPlayer;
            }
            
            // Show completion popup for the player who just finished (check by name, not turn)
            if (finishedPlayerData && finishedPlayerData.name === this.playerName) {
                this.showPlayerCompletionPopup(finishedPlayerId);
            }
        } else {
            // Same player, next round
            this.gameState.currentRound++;
        }
        
        // Save updated state immediately for real-time sync and update displays
        this.saveRoomToStorage();
        this.updateLiveLeaderboard();
        this.updatePlayerStats();
        
        // Check if game is complete
        if (this.gameState.currentPlayerIndex >= this.gameState.totalPlayers) {
            this.endGame();
        } else {
            // Move to next turn without additional countdown - initializePlayerTurn will handle it
            this.initializePlayerTurn();
        }
    }
    
    finishTurn(score) {
        console.log('Finishing turn with score:', score);
        
        const currentPlayerId = this.gameState.playerOrder[this.gameState.currentPlayerIndex];
        const scoreData = this.gameState.scores.get(currentPlayerId);
        
        if (scoreData) {
            scoreData.totalScore += score;
            scoreData.currentRoundScore = score;
            
            // Track individual round scores
            if (!scoreData.roundScores) {
                scoreData.roundScores = [];
            }
            scoreData.roundScores.push(score);
            
            // Increment rounds completed counter
            scoreData.roundsCompleted = (scoreData.roundsCompleted || 0) + 1;
        }
        
        // Update leaderboard immediately
        this.updateLiveLeaderboard();
        this.updatePlayerStats();
        
        // Clear any existing timers
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }
        
        // Check if current player has completed all rounds
        if (this.gameState.currentRound >= this.gameSettings.roundsPerPlayer) {
            // Player finished all rounds
            const finishedPlayerId = currentPlayerId;
            const finishedPlayerData = this.players.get(finishedPlayerId);
            
            // Move to next player
            this.gameState.currentPlayerIndex++;
            this.gameState.currentRound = 1;
            
            // Mark player as completed
            const playerScore = this.gameState.scores.get(finishedPlayerId);
            if (playerScore) {
                playerScore.roundsCompleted = this.gameSettings.roundsPerPlayer;
            }
            
            // Show completion popup for the player who just finished (check by name, not turn)
            if (finishedPlayerData && finishedPlayerData.name === this.playerName) {
                this.showPlayerCompletionPopup(finishedPlayerId);
            }
        } else {
            // Same player, next round
            this.gameState.currentRound++;
        }
        
        // Reset playerReady flag for next turn/player
        this.gameState.playerReady = false;
        
        // Save updated state immediately for real-time sync
        this.saveRoomToStorage();
        
        // Update leaderboard again after state save
        this.updateLiveLeaderboard();
        this.updatePlayerStats();
        
        // Check if game is over
        if (this.gameState.currentPlayerIndex >= this.gameState.totalPlayers) {
            this.showCountdownTransition("Game Complete!", () => {
                this.endGame();
            });
        } else {
            // Continue to next turn after countdown
            this.showCountdownTransition("Next Turn", () => {
                this.initializePlayerTurn();
            });
        }
    }
    
    showCountdownTransition(message, callback) {
        // Create countdown overlay
        const countdownOverlay = document.createElement('div');
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
        `;
        messageEl.textContent = message;
        
        const countdownEl = document.createElement('div');
        countdownEl.style.cssText = `
            font-size: 4rem;
            font-weight: bold;
            color: #4CAF50;
            animation: pulse 1s ease-in-out infinite;
        `;
        
        countdownOverlay.appendChild(messageEl);
        countdownOverlay.appendChild(countdownEl);
        document.body.appendChild(countdownOverlay);
        
        let count = 3;
        countdownEl.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
                // Update leaderboards during countdown for real-time feel
                this.updateLiveLeaderboard();
                this.updatePlayerStats();
            } else {
                countdownEl.textContent = "GO!";
                countdownEl.style.color = "#FF6B6B";
                // Final update before proceeding
                this.updateLiveLeaderboard();
                this.updatePlayerStats();
                setTimeout(() => {
                    document.body.removeChild(countdownOverlay);
                    callback();
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
    
    showPlayerCompletionPopup(playerId) {
        const playerData = this.players.get(playerId);
        const scoreData = this.gameState.scores.get(playerId);
        
        if (!playerData || !scoreData) return;
        
        // Calculate player's best round and average accuracy
        const totalScore = scoreData.totalScore;
        const roundsCompleted = scoreData.roundsCompleted;
        const averageScore = Math.round(totalScore / roundsCompleted);
        const averageAccuracy = Math.min(100, averageScore).toFixed(1);
        
        // Create completion popup
        const completionOverlay = document.createElement('div');
        completionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        completionOverlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                padding: 2rem;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 1rem 0; font-size: 2rem;">🎉 Congratulations!</h2>
                <p style="font-size: 1.2rem; margin: 0 0 1.5rem 0;">
                    ${playerData.name}, you've completed all ${roundsCompleted} rounds!
                </p>
                
                <div style="
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                ">
                    <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">
                        <strong>Final Score:</strong> ${totalScore} points
                    </div>
                    <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">
                        <strong>Average Accuracy:</strong> ${averageAccuracy}%
                    </div>
                    <div style="font-size: 1.1rem;">
                        <strong>Rounds Completed:</strong> ${roundsCompleted}/${this.gameSettings.roundsPerPlayer}
                    </div>
                </div>
                
                <button id="spectateBtn" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.3s;
                ">👀 Watch Other Players</button>
            </div>
        `;
        
        document.body.appendChild(completionOverlay);
        
        // Add event listener for spectate button
        document.getElementById('spectateBtn').addEventListener('click', () => {
            document.body.removeChild(completionOverlay);
            this.enterSpectatorMode();
        });
        
        // Auto-close after 8 seconds if not clicked
        setTimeout(() => {
            if (document.body.contains(completionOverlay)) {
                document.body.removeChild(completionOverlay);
                this.enterSpectatorMode();
            }
        }, 8000);
    }
    
    enterSpectatorMode() {
        // Update spectator mode UI
        this.gameActive = false;
        this.showMessage('You are now spectating other players', 'info');
        
        // Force update the display to show spectator mode
        this.updateTurnDisplay();
    }
    
    findPlayerIdByName(playerName) {
        for (const [id, player] of this.players.entries()) {
            if (player.name === playerName) {
                return id;
            }
        }
        return null;
    }
    
    initializePlayerTurn() {
        const currentPlayer = this.getCurrentPlayer();
        
        if (!currentPlayer) {
            this.endGame();
            return;
        }

        // Check if this is the player's first round EVER (not just first round of the game)
        const playerId = Array.from(this.players.entries())
            .find(([id, player]) => player.name === currentPlayer.name)?.[0];
            
        const scoreData = this.gameState.scores.get(playerId) || { 
            totalScore: 0, 
            roundScores: [], 
            roundsCompleted: 0 
        };
        
        // Only show ready prompt for the very first round of each player's game
        const isPlayerFirstRound = (scoreData.roundsCompleted === 0 && this.gameState.currentRound === 1);
        
        if (isPlayerFirstRound) {
            // Reset ready status for new player's first turn
            this.gameState.playerReady = false;
            this.saveRoomToStorage();
            
            // Check if it's my turn
            if (this.isMyTurn()) {
                this.showReadyPrompt();
            } else {
                this.waitForPlayerReady();
            }
        } else {
            // Not first round or not first player, show countdown before starting turn
            // Generate color for non-first rounds during countdown
            this.currentColor = this.generateRandomRGB();
            this.gameState.currentColor = this.currentColor;
            console.log('Generated color for non-first round:', this.currentColor);
            
            // Save state immediately to sync with other players
            this.saveRoomToStorage();
            
            this.showCountdownTransition("Next Round", () => {
                this.startCurrentPlayerTurn();
            });
        }
    }
    
    showReadyPrompt() {
        // Create ready prompt overlay
        const readyOverlay = document.createElement('div');
        readyOverlay.id = 'readyOverlay';
        readyOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            font-size: 2rem;
            margin-bottom: 1rem;
            text-align: center;
            color: #4CAF50;
        `;
        messageEl.textContent = `Your Turn, ${this.playerName}!`;
        
        const subMessageEl = document.createElement('div');
        subMessageEl.style.cssText = `
            font-size: 1.2rem;
            margin-bottom: 3rem;
            text-align: center;
            opacity: 0.8;
        `;
        subMessageEl.textContent = 'Are you ready to guess the color?';
        
        const readyBtn = document.createElement('button');
        readyBtn.style.cssText = `
            padding: 1rem 2rem;
            font-size: 1.2rem;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        readyBtn.textContent = "I'm Ready!";
        readyBtn.onmouseover = () => readyBtn.style.background = '#45a049';
        readyBtn.onmouseout = () => readyBtn.style.background = '#4CAF50';
        readyBtn.onclick = () => {
            document.body.removeChild(readyOverlay);
            this.markPlayerReady();
        };
        
        readyOverlay.appendChild(messageEl);
        readyOverlay.appendChild(subMessageEl);
        readyOverlay.appendChild(readyBtn);
        document.body.appendChild(readyOverlay);
    }
    
    markPlayerReady() {
        this.gameState.playerReady = true;
        
        // Generate new color for this round when player is ready
        this.currentColor = this.generateRandomRGB();
        this.gameState.currentColor = this.currentColor; // Store in game state for sync
        console.log('Generated color after ready:', this.currentColor);
        
        this.saveRoomToStorage();
        
        // Remove ready overlay
        const readyOverlay = document.getElementById('readyOverlay');
        if (readyOverlay) {
            document.body.removeChild(readyOverlay);
        }
        
        // Show countdown before starting the actual turn
        this.showCountdownTransition("Get Ready!", () => {
            this.startCurrentPlayerTurn();
        });
    }
    
    waitForPlayerReady() {
        this.showWaitingScreen();
        this.pollForPlayerReady();
    }
    
    showWaitingScreen() {
        const currentPlayer = this.getCurrentPlayer();
        
        // Handle case where currentPlayer might be null
        if (!currentPlayer) {
            console.error('showWaitingScreen: currentPlayer is null');
            return;
        }
        
        // Create waiting overlay
        const waitingOverlay = document.createElement('div');
        waitingOverlay.id = 'waitingOverlay';
        waitingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            font-size: 2rem;
            margin-bottom: 1rem;
            text-align: center;
            color: #FF9800;
        `;
        messageEl.textContent = `Waiting for ${currentPlayer.name}...`;
        
        const subMessageEl = document.createElement('div');
        subMessageEl.style.cssText = `
            font-size: 1.2rem;
            margin-bottom: 3rem;
            text-align: center;
            opacity: 0.8;
        `;
        subMessageEl.textContent = `${currentPlayer.name} is not ready yet`;
        
        const loadingEl = document.createElement('div');
        loadingEl.style.cssText = `
            font-size: 1.5rem;
            animation: pulse 1.5s ease-in-out infinite;
            margin-bottom: 2rem;
        `;
        loadingEl.textContent = '⏳ Please wait...';
        
        waitingOverlay.appendChild(messageEl);
        waitingOverlay.appendChild(subMessageEl);
        waitingOverlay.appendChild(loadingEl);
        
        // Add host controls ONLY if current user is host
        if (this.isHost()) {
            const hostControls = document.createElement('div');
            hostControls.style.cssText = `
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            `;
            
            const skipBtn = document.createElement('button');
            skipBtn.style.cssText = `
                padding: 0.8rem 1.5rem;
                font-size: 1rem;
                background: #FF6B6B;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            skipBtn.textContent = 'Skip Player';
            skipBtn.onmouseover = () => skipBtn.style.background = '#ff5252';
            skipBtn.onmouseout = () => skipBtn.style.background = '#FF6B6B';
            skipBtn.onclick = () => this.skipCurrentPlayer();
            
            const forceStartBtn = document.createElement('button');
            forceStartBtn.style.cssText = `
                padding: 0.8rem 1.5rem;
                font-size: 1rem;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            forceStartBtn.textContent = 'Force Start';
            forceStartBtn.onmouseover = () => forceStartBtn.style.background = '#1976D2';
            forceStartBtn.onmouseout = () => forceStartBtn.style.background = '#2196F3';
            forceStartBtn.onclick = () => this.forceStartTurn();
            
            const hostLabel = document.createElement('div');
            hostLabel.style.cssText = `
                font-size: 0.9rem;
                color: #FFC107;
                margin-bottom: 1rem;
                text-align: center;
            `;
            hostLabel.textContent = 'Host Controls:';
            
            hostControls.appendChild(skipBtn);
            hostControls.appendChild(forceStartBtn);
            waitingOverlay.appendChild(hostLabel);
            waitingOverlay.appendChild(hostControls);
        }
        
        document.body.appendChild(waitingOverlay);
    }
    
    pollForPlayerReady() {
        const checkReady = () => {
            const room = this.loadRoomFromStorage(this.roomId);
            if (room && room.gameState) {
                // Check if the player is ready OR if turn has progressed (indicating turn started)
                const isPlayerReady = room.gameState.playerReady;
                const turnProgressed = (room.gameState.currentPlayerIndex !== this.gameState.currentPlayerIndex) || 
                                    (room.gameState.currentRound !== this.gameState.currentRound);
                
                if (isPlayerReady || turnProgressed) {
                    const waitingOverlay = document.getElementById('waitingOverlay');
                    if (waitingOverlay) {
                        document.body.removeChild(waitingOverlay);
                    }
                    // Sync the game state and continue
                    this.syncGameState();
                } else if (!this.gameState.gameCompleted) {
                    setTimeout(checkReady, 1000);
                }
            } else if (!this.gameState.gameCompleted) {
                setTimeout(checkReady, 1000);
            }
        };
        checkReady();
    }
    
    syncGameState() {
        console.log('syncGameState called');
        const room = this.loadRoomFromStorage(this.roomId);
        if (room && room.gameState) {
            // Update local game state with the latest from storage
            this.gameState = room.gameState;
            this.players = new Map(room.players);
            
            // Sync current color if it has changed
            if (room.gameState.currentColor) {
                this.currentColor = room.gameState.currentColor;
                this.updateColorDisplay();
            }
            
            // Update displays
            this.updateTurnDisplay();
            this.updateLiveLeaderboard();
            
            // If it's now my turn, start the turn
            if (this.isMyTurn() && this.gameState.playerReady) {
                this.startCurrentPlayerTurn();
            } else if (this.isMyTurn() && !this.gameState.playerReady) {
                // If it's my turn but not ready, initialize the turn
                this.initializePlayerTurn();
            }
        }
    }
    
    skipCurrentPlayer() {
        const currentPlayer = this.getCurrentPlayer();
        
        // Add a zero score for this round
        const playerId = Array.from(this.players.entries())
            .find(([id, player]) => player.name === currentPlayer.name)?.[0];
            
        if (playerId) {
            const scoreData = this.gameState.scores.get(playerId) || { 
                totalScore: 0, 
                roundScores: [], 
                roundsCompleted: 0 
            };
            scoreData.roundScores.push(0);
            scoreData.roundsCompleted++;
            this.gameState.scores.set(playerId, scoreData);
        }
        
        // Remove waiting overlay
        const waitingOverlay = document.getElementById('waitingOverlay');
        if (waitingOverlay) {
            document.body.removeChild(waitingOverlay);
        }
        
        // Move to next player
        this.gameState.currentPlayerIndex++;
        this.saveRoomToStorage();
        
        // Show skip notification
        this.showNotification(`Skipped ${currentPlayer.name}'s turn`, 'warning');
        
        // Continue game flow - check if game is complete
        if (this.gameState.currentPlayerIndex >= this.gameState.totalPlayers) {
            this.showCountdownTransition("Game Complete!", () => {
                this.endGame();
            });
        } else {
            this.showCountdownTransition("Next Turn", () => {
                this.initializePlayerTurn();
            });
        }
    }
    
    forceStartTurn() {
        // Remove waiting overlay
        const waitingOverlay = document.getElementById('waitingOverlay');
        if (waitingOverlay) {
            document.body.removeChild(waitingOverlay);
        }
        
        // Force mark player as ready and start turn
        this.gameState.playerReady = true;
        this.saveRoomToStorage();
        
        this.showNotification('Turn force started by host', 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            ${type === 'warning' ? 'background: #FF9800;' : ''}
            ${type === 'info' ? 'background: #2196F3;' : ''}
            ${type === 'success' ? 'background: #4CAF50;' : ''}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
    
    showRoundResult(accuracy, distance, points) {
        // Show round result in a simple way for now
        let message;
        if (accuracy >= 90) {
            message = `Excellent! ${accuracy.toFixed(1)}% accuracy - ${points} points! 🎯`;
        } else if (accuracy >= 70) {
            message = `Great job! ${accuracy.toFixed(1)}% accuracy - ${points} points! 🎉`;
        } else if (accuracy >= 50) {
            message = `Good try! ${accuracy.toFixed(1)}% accuracy - ${points} points! 👍`;
        } else {
            message = `Keep practicing! ${accuracy.toFixed(1)}% accuracy - ${points} points! 💪`;
        }
        
        this.showMessage(message, 'success');
    }
    
    showFinalResults() {
        // Sort players by final score
        const finalScores = Array.from(this.players.entries()).map(([id, player]) => {
            const scoreData = this.gameState.scores.get(id) || { totalScore: 0 };
            return {
                name: player.name,
                score: scoreData.totalScore,
                isHost: player.isHost
            };
        }).sort((a, b) => b.score - a.score);
        
        let resultsMessage = '🏆 Final Results:\n\n';
        finalScores.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            resultsMessage += `${medal} ${player.name}: ${player.score} points\n`;
        });
        
        this.showMessage(resultsMessage, 'success');
        
        // Update leaderboard one final time
        this.updateLiveLeaderboard();
    }
    
    checkUrlForRoom() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');
        if (roomId) {
            this.roomIdInput.value = roomId;
        }
    }
    
    saveRoomToStorage() {
        // Convert Map to object for JSON serialization
        const scoresObject = {};
        for (const [key, value] of this.gameState.scores) {
            scoresObject[key] = value;
        }
        
        const roomData = {
            id: this.roomId,
            host: this.isHost ? this.playerName : null,
            players: Array.from(this.players),
            gameState: this.gameMode,
            gameSettings: this.gameSettings,
            turnState: {
                ...this.gameState,
                scores: scoresObject // Convert Map to object
            },
            created: Date.now()
        };
        localStorage.setItem(`colorGuesser_room_${this.roomId}`, JSON.stringify(roomData));
        console.log('Room saved with game state:', this.gameMode, 'Settings:', this.gameSettings);
    }
    
    loadRoomFromStorage(roomId) {
        const roomData = localStorage.getItem(`colorGuesser_room_${roomId}`);
        console.log('Loading room data for:', roomId, roomData); // Debug log
        
        // List all available rooms for debugging
        const allKeys = Object.keys(localStorage);
        const roomKeys = allKeys.filter(key => key.startsWith('colorGuesser_room_'));
        console.log('Available rooms:', roomKeys); // Debug log
        
        if (roomData) {
            const parsed = JSON.parse(roomData);
            // Load game settings from room
            if (parsed.gameSettings) {
                this.gameSettings = { ...parsed.gameSettings };
                console.log('Loaded game settings:', this.gameSettings);
            }
            return parsed;
        }
        return null;
    }
    
    deleteRoomFromStorage() {
        localStorage.removeItem(`colorGuesser_room_${this.roomId}`);
    }
    
    updateRoomDisplay() {
        this.currentRoomIdEl.textContent = this.roomId;
        this.playerCountEl.textContent = this.players.size;
        
        // Update players list
        this.playersListEl.innerHTML = '';
        for (const [id, player] of this.players) {
            const playerEl = document.createElement('div');
            playerEl.className = 'player-item';
            playerEl.innerHTML = `
                <span class="player-name">${player.name}${player.isHost ? ' (Host)' : ''}</span>
                <span class="player-score">${player.score} pts</span>
            `;
            this.playersListEl.appendChild(playerEl);
        }
        
        // Update start button visibility and enable/disable
        if (this.isHost) {
            this.startGameBtn.style.display = 'block';
            this.startGameBtn.disabled = false;
            document.querySelector('.start-hint').textContent = 'Click to start the game!';
        } else {
            this.startGameBtn.style.display = 'none';
            document.querySelector('.start-hint').textContent = 'Waiting for host to start...';
        }
        
        // Update game room display if in game
        if (this.gameSection && this.gameSection.style.display !== 'none') {
            this.gameRoomIdEl.textContent = this.roomId || '';
        }
    }
    
    updateGamePlayersDisplay() {
        if (!this.gamePlayersPanel || this.gameMode !== 'multiplayer') return;
        
        this.gamePlayerCountEl.textContent = this.players.size;
        
        // Update game players list
        this.gamePlayersListEl.innerHTML = '';
        for (const [id, player] of this.players) {
            const playerEl = document.createElement('div');
            playerEl.className = 'game-player-item';
            playerEl.innerHTML = `
                <span class="game-player-name">${player.name}${player.isHost ? ' (Host)' : ''}</span>
                <span class="game-player-score">${player.score} pts</span>
            `;
            this.gamePlayersListEl.appendChild(playerEl);
        }
    }

    showLobby() {
        this.lobbySection.style.display = 'block';
        this.roomSection.style.display = 'none';
        this.gameSection.style.display = 'none';
        this.resultPanel.style.display = 'none';
        this.stopRoomPolling(); // Stop polling when returning to lobby
    }
    
    showRoom() {
        this.lobbySection.style.display = 'none';
        this.roomSection.style.display = 'block';
        this.gameSection.style.display = 'none';
        this.resultPanel.style.display = 'none';
    }
    
    showGame() {
        this.lobbySection.style.display = 'none';
        this.roomSection.style.display = 'none';
        this.gameSection.style.display = 'block';
        this.resultPanel.style.display = 'none';
        
        // Update room ID display in game
        if (this.gameRoomIdEl) {
            this.gameRoomIdEl.textContent = this.roomId || '';
        }
        
        // Don't stop room polling here - we'll manage it in initGame
    }
    
    backToLobby() {
        this.leaveRoom();
    }

    showHelp() {
        if (this.helpPanel) {
            this.helpPanel.classList.add('show');
        }
    }
    
    hideHelp() {
        if (this.helpPanel) {
            this.helpPanel.classList.remove('show');
        }
    }
    
    toggleHelp() {
        if (this.helpPanel) {
            this.helpPanel.classList.toggle('show');
        }
    }

    // Game initialization for solo play (keep existing logic)
    initGame() {
        this.round = 1;
        this.totalScore = 0;
        this.livesRemaining = 3;
        this.gameActive = true;
        this.gameCompleted = false; // Reset completion flag for new game
        this.gameStartTime = Date.now();
        
        // This is for solo play only now
        if (this.gameMode === 'solo') {
            this.loadBestScore();
            this.resetRoundState();
            this.generateNewColor();
            this.updateDisplay();
            this.initializeColorWheel();
        }
    }
    
    resetRoundState() {
        this.guessColor = null;
        this.crosshair.style.display = 'none';
        this.selectionHintEl.textContent = "Click on the color wheel to make your guess";
        this.selectionHintEl.style.color = "#666";
        this.submitBtn.disabled = true;
        this.resultPanel.style.display = 'none';
    }

    generateNewColor() {
        // Generate a random RGB color
        this.currentColor = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
    }

    updateDisplay() {
        this.currentRoundEl.textContent = this.round;
        this.roundEl.textContent = this.round;
        this.playerScoreEl.textContent = this.totalScore;
        this.bestScoreEl.textContent = this.bestScore.toFixed(1) + '%';
        
        // Display the target color
        this.targetColorEl.style.backgroundColor = this.rgbToString(this.currentColor);
        this.targetRGBEl.textContent = this.formatRGBDisplay(this.currentColor);
    }
    
    resetGame() {
        this.round = 1;
        this.totalScore = 0;
        this.livesRemaining = 3;
        this.gameActive = true;
        this.guessColor = null;
        this.gameMode = 'solo';
        this.isHost = false;
        this.playerName = '';
        this.roomId = '';
        this.players.clear();
        this.clearGameTimer();
        this.stopRoomPolling();
    }
    
    startGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.gameStartTime) {
                const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.gameTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    clearGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.gameTimerEl) {
            this.gameTimerEl.textContent = '0:00';
        }
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('colorGuesserBestScore');
        if (saved) {
            this.bestScore = parseFloat(saved);
        }
    }
    
    saveBestScore() {
        localStorage.setItem('colorGuesserBestScore', this.bestScore.toString());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorGuesser();
});

// Add keyboard shortcuts - only when not typing in input fields
document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    if (e.key === 'n' || e.key === 'N') {
        const newGameBtn = document.getElementById('newGameBtn');
        if (newGameBtn && newGameBtn.offsetParent !== null) {
            newGameBtn.click();
        }
    } else if (e.key === 'Enter' || e.key === ' ') {
        const submitBtn = document.getElementById('submitGuess');
        const nextBtn = document.getElementById('nextRound');
        if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
        } else if (nextBtn && nextBtn.offsetParent !== null) {
            nextBtn.click();
        }
        e.preventDefault();
    }
});
