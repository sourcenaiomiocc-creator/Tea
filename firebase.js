let firebaseService;

if (typeof firebase !== 'undefined') {
    // Configuração do Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAtHvQZ8NRIcLNtM0NZX4w66-IFQ2R9xd0",
        authDomain: "tea-alfabetiza.firebaseapp.com",
        projectId: "tea-alfabetiza",
        storageBucket: "tea-alfabetiza.firebasestorage.app",
        messagingSenderId: "935876600658",
        appId: "1:935876600658:web:32dda9dbc48b004924108b",
        measurementId: "G-GZBVBBHDLE"
    };

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    class FirebaseService {
        constructor() {
            this.isReady = true;
        }

        async saveScore(playerName, score, gameType) {
            if (!playerName || !score || !gameType) {
                console.warn('Dados incompletos para salvar no ranking.');
                return { success: false, error: 'incomplete_data' };
            }

            try {
                await db.collection('leaderboard').add({
                    playerName: playerName,
                    score: score,
                    game: gameType,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true };
            } catch (error) {
                console.error('Erro ao salvar no ranking:', error);
                return { success: false, error: error.message };
            }
        }

        async getLeaderboard(limit = 10) {
            try {
                const snapshot = await db.collection('leaderboard')
                    .orderBy('score', 'desc')
                    .limit(limit)
                    .get();

                const leaderboard = [];
                snapshot.forEach(doc => {
                    leaderboard.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                return { success: true, data: leaderboard };
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
                return { success: false, data: [], error: error.message };
            }
        }
    }

    firebaseService = new FirebaseService();
}
