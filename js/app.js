/**
 * HSK Spark 2.0 - Core Application Shell Controller & Router
 */
const HSKApp = {
    /**
     * Bootstrap the app
     */
    init: function() {
        // Load stored progress state
        HSKState.load();

        // Initialize theme and global styles
        this.updateThemeUI();
        this.updatePinyinUI();

        // Setup DOM event listeners
        this.bindEvents();

        // Request microphone permission once at startup so browser remembers it
        this.requestMicPermission();

        // Direct routing based on state or hash
        this.route(HSKState.data.currentView);

        // Tick study time (1 minute intervals)
        setInterval(() => {
            HSKState.addStudyTime(1);
        }, 60000);
    },

    /**
     * Request microphone permission once at startup.
     * This warm-up call makes the browser remember the permission for the session,
     * so SpeechRecognition won't prompt again later.
     */
    requestMicPermission: function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return; // Browser doesn't support it at all

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Permission granted — stop the stream immediately (we just needed the grant)
                stream.getTracks().forEach(track => track.stop());
                console.log('[HSK Spark] Microphone permission granted.');
            })
            .catch(err => {
                // User denied or device unavailable — speaking practice will show a clear message
                console.warn('[HSK Spark] Microphone permission denied or unavailable:', err.message);
            });
    },

    /**
     * Bind listeners to DOM controls
     */
    bindEvents: function() {
        // Sidebar Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.view;
                this.navigateTo(target);
            });
        });

        // Bottom Navigation
        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.view;
                this.navigateTo(target);
            });
        });

        // HSK Level Selector
        const select = document.getElementById('global-hsk-select');
        if (select) {
            select.value = HSKState.data.currentLevel;
            select.addEventListener('change', (e) => {
                const lvl = parseInt(e.target.value);
                HSKState.set('currentLevel', lvl);
                
                // Reset selector filters on level change
                if (typeof HSKVocabulary !== 'undefined') {
                    HSKVocabulary.selectedDayValue = 'all';
                }
                if (typeof HSKGrammar !== 'undefined') {
                    HSKGrammar.selectedLessonValue = 'all';
                }
                
                this.route(HSKState.data.currentView);
            });
        }

        // Pinyin Toggle
        const pinToggle = document.getElementById('pinyin-toggle');
        if (pinToggle) {
            pinToggle.addEventListener('click', () => {
                HSKState.set('showPinyin', !HSKState.data.showPinyin);
                this.updatePinyinUI();
            });
        }

        // Theme Switchers
        const themeBtnDesktop = document.getElementById('theme-toggle-desktop');
        if (themeBtnDesktop) {
            themeBtnDesktop.addEventListener('click', () => this.toggleTheme());
        }

        const themeBtnMobile = document.getElementById('theme-toggle-mobile');
        if (themeBtnMobile) {
            themeBtnMobile.addEventListener('click', () => this.toggleTheme());
        }
    },

    /**
     * Switch view panel
     * @param {string} view 
     * @param {Object} params Deep-link parameters (optional)
     */
    navigateTo: function(view, params = null) {
        HSKState.set('currentView', view);
        
        // Update active navigation indicators
        document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.route(view, params);
    },

    /**
     * Route and render sub-controller views
     * @param {string} view 
     * @param {Object} params 
     */
    route: function(view, params = null) {
        // Cleanup active speech recognition if navigating away from exercises
        if (typeof HSKExercises !== 'undefined' && HSKExercises.speakingIsListening) {
            HSKExercises.stopSpeechRecognition();
        }

        switch (view) {
            case 'dashboard':
                HSKDashboard.render();
                break;
            case 'vocabulary':
                HSKVocabulary.render(params);
                break;
            case 'grammar':
                HSKGrammar.render(params);
                break;
            case 'exercises':
                HSKExercises.render();
                break;
            default:
                HSKDashboard.render();
        }
    },

    /**
     * Toggle Light/Dark themes
     */
    toggleTheme: function() {
        const current = HSKState.data.theme;
        const target = current === 'dark' ? 'light' : 'dark';
        HSKState.set('theme', target);
        this.updateThemeUI();
    },

    updateThemeUI: function() {
        const theme = HSKState.data.theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const text = theme === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';
        const icon = theme === 'dark' ? 'fa-moon' : 'fa-sun';
        
        // Desktop theme button update
        const desktopBtn = document.getElementById('theme-toggle-desktop');
        if (desktopBtn) {
            desktopBtn.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${text}</span>`;
        }

        // Mobile theme icon update
        const mobileBtn = document.getElementById('theme-toggle-mobile');
        if (mobileBtn) {
            mobileBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
        }
    },

    /**
     * Toggle pinyin visibility (blur mask override)
     */
    updatePinyinUI: function() {
        const show = HSKState.data.showPinyin;
        const toggleBtn = document.getElementById('pinyin-toggle');
        const appBody = document.getElementById('app-body');

        if (show) {
            toggleBtn.classList.add('toggle-active');
            toggleBtn.innerHTML = `<i class="fa-solid fa-eye"></i> <span>พินอิน</span>`;
            if (appBody) appBody.classList.remove('pinyin-masked');
        } else {
            toggleBtn.classList.remove('toggle-active');
            toggleBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> <span>พินอิน</span>`;
            if (appBody) appBody.classList.add('pinyin-masked');
        }
    },

    /**
     * Trigger Daily Quiz flow from study planner
     */
    startDailyQuiz: function(level, week, day) {
        HSKState.set('currentLevel', level);
        // Save targeted day and week for tracking task completion
        HSKVocabulary.currentQuizDay = day;
        HSKVocabulary.currentQuizWeek = week;
        // Switch to vocabulary quiz sub-view directly
        this.navigateTo('vocabulary');
        HSKVocabulary.switchSubView('quiz');
    },

    /**
     * Trigger Weekly Quiz flow from study planner
     */
    startWeeklyQuiz: function(level, week) {
        HSKState.set('currentLevel', level);
        // Save targeted day (day 6 for weekly review) and week for tracking task completion
        HSKVocabulary.currentQuizDay = 6;
        HSKVocabulary.currentQuizWeek = week;
        this.navigateTo('vocabulary');
        HSKVocabulary.switchSubView('quiz');
        
        // Standard HSKVocabulary daily quiz will be modified to support 10 questions for weekly review!
        const levelKey = `hsk${level}`;
        const vocabDb = window.HSK_DATA.vocabulary[levelKey] || [];
        
        HSKVocabulary.generateVocabularyQuiz(vocabDb);
        // Expand the question pool for the weekly exam to 10 questions!
        const filteredDb = HSKVocabulary.filterVocabByStatusProbability(vocabDb);
        if (filteredDb.length >= 10) {
            const extraDistractors = HSKUtils.shuffle(filteredDb).slice(0, 10);
            HSKVocabulary.quizQuestions = HSKVocabulary.quizQuestions.slice(0, 5); // Base 5
            
            // Generate 5 more questions to make a total of 10
            for (let i = 0; i < 5; i++) {
                const word = extraDistractors[i];
                const distractors = HSKUtils.shuffle(vocabDb.filter(w => w.id !== word.id));
                const options = HSKUtils.shuffle([word.thai, distractors[0].thai, distractors[1].thai, distractors[2].thai]);
                
                HSKVocabulary.quizQuestions.push({
                    wordId: word.id,
                    wordText: word.word,
                    wordPinyin: word.pinyin,
                    pos: word.pos,
                    prompt: "จงเลือกความหมายภาษาไทยที่ถูกต้องของคำนี้",
                    targetText: word.word,
                    solutionText: word.thai,
                    options: options,
                    answerIdx: options.indexOf(word.thai)
                });
            }
        }
        
        HSKVocabulary.render();
    }
};

// Start bootstrapping once content finishes loading
window.addEventListener('DOMContentLoaded', () => {
    HSKApp.init();
});

window.HSKApp = HSKApp;
