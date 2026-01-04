// ============================================
// SECURE FIREBASE CONFIGURATION FOR TEA GAME
// ============================================

let firebaseService;

if (typeof firebase !== 'undefined') {
    // Load configuration from environment variables
    // For development: Use .env file
    // For production: Set these in your hosting platform
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    // Validate configuration
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

    if (missingFields.length > 0) {
        console.error('❌ Missing Firebase configuration. Please create .env file based on .env.example');
        console.error('Missing fields:', missingFields);
    } else {
        try {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();

            class FirebaseService {
                constructor() {
                    this.isReady = true;
                    this.maxNameLength = 50;
                    this.rateLimitMap = new Map(); // Simple rate limiting
                }

                /**
                 * Sanitize player name to prevent XSS
                 */
                sanitizePlayerName(name) {
                    if (!name || typeof name !== 'string') {
                        return '';
                    }

                    // Remove HTML tags and limit length
                    const cleaned = name
                        .replace(/<[^>]*>/g, '')
                        .replace(/[<>'"]/g, '')
                        .trim()
                        .slice(0, this.maxNameLength);

                    return cleaned;
                }

                /**
                 * Validate score data
                 */
                validateScoreData(playerName, score, gameType) {
                    const errors = [];

                    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
                        errors.push('Nome do jogador inválido');
                    }

                    if (!score || typeof score !== 'number' || score < 0 || score > 10000) {
                        errors.push('Pontuação inválida');
                    }

                    const validGameTypes = ['alfabeto', 'numeros', 'cores', 'animais'];
                    if (!gameType || !validGameTypes.includes(gameType)) {
                        errors.push('Tipo de jogo inválido');
                    }

                    return errors;
                }

                /**
                 * Simple rate limiting check
                 */
                checkRateLimit(playerName) {
                    const now = Date.now();
                    const lastSubmission = this.rateLimitMap.get(playerName);

                    // Allow one submission per minute per player
                    if (lastSubmission && (now - lastSubmission) < 60000) {
                        return false;
                    }

                    this.rateLimitMap.set(playerName, now);
                    return true;
                }

                /**
                 * Save score to leaderboard with validation
                 */
                async saveScore(playerName, score, gameType) {
                    try {
                        // Sanitize input
                        const sanitizedName = this.sanitizePlayerName(playerName);

                        // Validate data
                        const validationErrors = this.validateScoreData(sanitizedName, score, gameType);
                        if (validationErrors.length > 0) {
                            console.warn('Validação falhou:', validationErrors);
                            return { success: false, error: 'invalid_data', details: validationErrors };
                        }

                        // Check rate limit
                        if (!this.checkRateLimit(sanitizedName)) {
                            console.warn('Rate limit excedido para:', sanitizedName);
                            return { success: false, error: 'rate_limit_exceeded' };
                        }

                        // Save to Firestore
                        await db.collection('leaderboard').add({
                            playerName: sanitizedName,
                            score: score,
                            game: gameType,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        return { success: true };
                    } catch (error) {
                        console.error('Erro ao salvar no ranking:', error);
                        return { success: false, error: 'save_failed' };
                    }
                }

                /**
                 * Get leaderboard with filtering
                 */
                async getLeaderboard(gameType = null, limit = 10) {
                    try {
                        // Validate limit
                        const safeLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100);

                        let query = db.collection('leaderboard');

                        // Filter by game type if provided
                        if (gameType) {
                            const validGameTypes = ['alfabeto', 'numeros', 'cores', 'animais'];
                            if (validGameTypes.includes(gameType)) {
                                query = query.where('game', '==', gameType);
                            }
                        }

                        const snapshot = await query
                            .orderBy('score', 'desc')
                            .limit(safeLimit)
                            .get();

                        const leaderboard = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            leaderboard.push({
                                id: doc.id,
                                playerName: this.sanitizePlayerName(data.playerName),
                                score: data.score,
                                game: data.game,
                                timestamp: data.timestamp
                            });
                        });

                        return { success: true, data: leaderboard };
                    } catch (error) {
                        console.error('Erro ao carregar ranking:', error);
                        return { success: false, data: [], error: 'load_failed' };
                    }
                }
            }

            firebaseService = new FirebaseService();
            console.log('✅ Firebase inicializado com segurança');
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
        }
    }
} else {
    console.warn('⚠️ Firebase SDK não carregado');
}
