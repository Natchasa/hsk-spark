/**
 * HSK Spark 2.0 - Vocabulary Module Controller
 */
const HSKVocabulary = {
    subView: 'flashcard', // 'flashcard' | 'table' | 'quiz'
    currentIndex: 0,
    filteredWords: [],
    selectedRadical: '',
    selectedDayValue: 'all', // 'all' | 'review' | 'w{week}_d{day}'

    // State of active vocabulary quiz
    quizQuestions: [],
    quizCurrentIdx: 0,
    quizScore: 0,
    quizSelectedAnswer: null,
    quizSubmitted: false,
    currentQuizDay: null,
    currentQuizWeek: null,
    baseWords: [],
    
    // Speaking practice state
    speakingActive: false,
    speakingStatusText: 'พร้อมเริ่มพูด',
    speakingUserTranscript: '',
    speakingMatchScore: null,

    /**
     * Helper to get vocabulary words for a specific day
     */
    getWordsForDay: function(level, week, day) {
        const vocabDb = window.HSK_DATA.vocabulary[`hsk${level}`] || [];
        if (!window.HSK_DATA.curriculum || !window.HSK_DATA.curriculum.levels[level]) return [];
        const levelConfig = window.HSK_DATA.curriculum.levels[level];
        const weekInfo = levelConfig.weeks[week];
        if (!weekInfo) return [];
        const lessons = weekInfo.lessons;
        const weekVocab = vocabDb.filter(w => lessons.includes(w.lesson));
        const vocabPerDay = Math.ceil(weekVocab.length / 5);
        const startIdx = (day - 1) * vocabPerDay;
        const endIdx = Math.min(startIdx + vocabPerDay, weekVocab.length);
        return weekVocab.slice(startIdx, endIdx);
    },

    /**
     * Helper to find which day's curriculum matches a list of words
     */
    findDayForWords: function(level, wordIds) {
        if (!window.HSK_DATA.curriculum) return 'all';
        const curConfig = window.HSK_DATA.curriculum.levels[level];
        if (!curConfig) return 'all';
        for (let w = 1; w <= curConfig.totalWeeks; w++) {
            for (let d = 1; d <= 5; d++) {
                const dayWords = this.getWordsForDay(level, w, d);
                const dayWordIds = dayWords.map(w => w.id);
                if (wordIds.length > 0 && wordIds.every(id => dayWordIds.includes(id))) {
                    return `w${w}_d${d}`;
                }
            }
        }
        return 'all';
    },

    /**
     * Dropdown selection change handler
     */
    onDaySelectChange: function(value) {
        this.selectedDayValue = value;
        const level = HSKState.data.currentLevel;
        const vocabDb = window.HSK_DATA.vocabulary[`hsk${level}`] || [];
        
        if (value === 'all') {
            this.filteredWords = this.filterVocabByStatusProbability(vocabDb);
            this.baseWords = [...vocabDb];
        } else if (value === 'review') {
            this.filteredWords = vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying');
            this.baseWords = [...this.filteredWords];
        } else if (value.startsWith('w')) {
            const parts = value.split('_');
            const week = parseInt(parts[0].substring(1));
            const day = parseInt(parts[1].substring(1));
            this.filteredWords = this.getWordsForDay(level, week, day);
            this.baseWords = [...this.filteredWords];
        }
        
        this.currentIndex = 0;
        this.selectedRadical = '';
        this.quizQuestions = []; // Reset quiz
        this.quizCurrentIdx = 0;
        this.quizScore = 0;
        this.quizSelectedAnswer = null;
        this.quizSubmitted = false;
        
        this.render();
    },

    /**
     * Render the vocabulary views inside #app-body
     * @param {Object} params Deep-link parameters (optional)
     */
    render: function(params = undefined) {
        const body = document.getElementById('app-body');
        const level = HSKState.data.currentLevel;
        const levelKey = `hsk${level}`;
        const vocabDb = window.HSK_DATA.vocabulary[levelKey] || [];

        // Handle routing params
        if (params !== undefined) {
            if (params && params.words) {
                const wordIds = params.words.split(',');
                this.selectedDayValue = this.findDayForWords(level, wordIds);
                this.filteredWords = vocabDb.filter(w => wordIds.includes(w.id));
                this.baseWords = [...this.filteredWords]; // Set baseWords pool
                this.currentIndex = 0;
                this.subView = 'flashcard';
                
                // Only mark complete on load if all words are already mastered
                const allMastered = this.filteredWords.every(w => HSKState.data.vocabStatuses[w.id] === 'mastered');
                if (allMastered) {
                    HSKState.markPlannerTaskComplete('vocab', { wordIds: wordIds });
                }
            } else if (params && params.review) {
                this.selectedDayValue = 'review';
                this.filteredWords = vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying');
                this.baseWords = [...this.filteredWords]; // Set baseWords pool
                this.currentIndex = 0;
                this.subView = 'flashcard';
                HSKState.markPlannerTaskComplete('review_all');
            } else {
                if (!this.selectedDayValue) this.selectedDayValue = 'all';
                if (this.selectedDayValue === 'all') {
                    this.filteredWords = this.filterVocabByStatusProbability(vocabDb);
                    this.baseWords = [...vocabDb];
                } else if (this.selectedDayValue === 'review') {
                    this.filteredWords = vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying');
                    this.baseWords = [...this.filteredWords];
                } else if (this.selectedDayValue.startsWith('w')) {
                    const parts = this.selectedDayValue.split('_');
                    const week = parseInt(parts[0].substring(1));
                    const day = parseInt(parts[1].substring(1));
                    this.filteredWords = this.getWordsForDay(level, week, day);
                    this.baseWords = [...this.filteredWords];
                }
                this.currentIndex = 0;
            }
        } else {
            if (this.filteredWords.length === 0) {
                if (!this.selectedDayValue) this.selectedDayValue = 'all';
                if (this.selectedDayValue === 'all') {
                    this.filteredWords = this.filterVocabByStatusProbability(vocabDb);
                    this.baseWords = [...vocabDb];
                } else if (this.selectedDayValue === 'review') {
                    this.filteredWords = vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying');
                    this.baseWords = [...this.filteredWords];
                } else if (this.selectedDayValue.startsWith('w')) {
                    const parts = this.selectedDayValue.split('_');
                    const week = parseInt(parts[0].substring(1));
                    const day = parseInt(parts[1].substring(1));
                    this.filteredWords = this.getWordsForDay(level, week, day);
                    this.baseWords = [...this.filteredWords];
                }
                this.currentIndex = 0;
            }
        }

        // Top sub-view menu tabs
        let html = `
            <div class="animate-fade-in">
                <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; overflow-x: auto;">
                    <button class="btn ${this.subView === 'flashcard' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HSKVocabulary.switchSubView('flashcard')">
                        <i class="fa-solid fa-clone"></i> บัตรคำ (Flashcards)
                    </button>
                    <button class="btn ${this.subView === 'table' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HSKVocabulary.switchSubView('table')">
                        <i class="fa-solid fa-table"></i> ตารางคำศัพท์ (Dictionary)
                    </button>
                    <button class="btn ${this.subView === 'quiz' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HSKVocabulary.switchSubView('quiz')">
                        <i class="fa-solid fa-gamepad"></i> ควิซคำศัพท์วันนี้
                    </button>
                </div>
        `;

        // Render Day Selector Dropdown
        const curConfig = window.HSK_DATA.curriculum.levels[level];
        let selectOptions = `<option value="all" ${this.selectedDayValue === 'all' ? 'selected' : ''}>ทบทวนคำศัพท์ทั้งหมดในระดับ HSK ${level}</option>`;
        selectOptions += `<option value="review" ${this.selectedDayValue === 'review' ? 'selected' : ''}>ทบทวนคำศัพท์ที่ยังไม่แม่น</option>`;
        
        if (curConfig) {
            for (let w = 1; w <= curConfig.totalWeeks; w++) {
                const dayPlans = window.HSK_DATA.curriculum.getPlannerConfig(level, w);
                dayPlans.forEach(day => {
                    if (day.dayIndex >= 1 && day.dayIndex <= 5) {
                        const dayWords = this.getWordsForDay(level, w, day.dayIndex);
                        if (dayWords.length > 0) {
                            selectOptions += `<option value="w${w}_d${day.dayIndex}" ${this.selectedDayValue === `w${w}_d${day.dayIndex}` ? 'selected' : ''}>สัปดาห์ที่ ${w} วันที่ ${day.dayIndex} (${dayWords.length} คำ)</option>`;
                        }
                    }
                });
            }
        }

        html += `
            <div class="vocab-selector-container" style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: var(--bg-card); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <label for="vocab-day-select" style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; margin: 0;">
                    <i class="fa-solid fa-filter" style="color: var(--accent-red);"></i> เลือกชุดคำศัพท์เรียน/ทบทวน:
                </label>
                <select id="vocab-day-select" onchange="HSKVocabulary.onDaySelectChange(this.value)" style="padding: 5px 10px; border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 0.85rem; font-weight: 600; outline: none; cursor: pointer; min-width: 260px;">
                    ${selectOptions}
                </select>
            </div>
        `;

        if (this.subView === 'flashcard') {
            html += this.renderFlashcardHTML(vocabDb);
        } else if (this.subView === 'table') {
            html += this.renderTableHTML(vocabDb);
        } else {
            html += this.renderQuizHTML(vocabDb);
        }

        html += `</div>`;
        body.innerHTML = html;
        
        // Post-render attachments (e.g. key listeners or auto-focus)
        if (this.subView === 'table') {
            const searchInput = document.getElementById('vocab-search-box');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.filterTable(e.target.value));
            }
        }
    },

    switchSubView: function(view) {
        this.subView = view;
        this.selectedRadical = '';
        this.currentIndex = 0;
        this.quizSubmitted = false;
        this.render();
    },

    /* =========================================================================
     * FLASHCARD SUBVIEW
     * ========================================================================= */
    renderFlashcardHTML: function(vocabDb) {
        // Find radicals in this level
        const radicals = ['ทั้งหมด', ...new Set(vocabDb.map(w => w.radical).filter(Boolean))];
        
        let radicalChips = "";
        radicals.forEach(rad => {
            const isActive = (rad === 'ทั้งหมด' && !this.selectedRadical) || rad === this.selectedRadical;
            const clickHandler = `HSKVocabulary.filterByRadical('${rad === 'ทั้งหมด' ? '' : rad}')`;
            radicalChips += `
                <button class="radical-chip ${isActive ? 'active' : ''}" onclick="${clickHandler}">
                    ${HSKUtils.escapeHTML(rad)}
                </button>
            `;
        });

        if (this.filteredWords.length === 0) {
            return `
                <div class="card" style="text-align: center; padding: 40px;">
                    <i class="fa-regular fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary);">ไม่พบคำศัพท์ในหมวดหมู่ที่เลือก</p>
                    <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="HSKVocabulary.filterByRadical('')">แสดงทั้งหมด</button>
                </div>
            `;
        }

        const word = this.filteredWords[this.currentIndex];
        const currentStatus = HSKState.data.vocabStatuses[word.id] || 'new';

        let statusBadge = `<span class="badge badge-info">ใหม่</span>`;
        if (currentStatus === 'mastered') statusBadge = `<span class="badge badge-success">จำได้แล้ว ✅</span>`;
        if (currentStatus === 'studying') statusBadge = `<span class="badge badge-red">ยังไม่แม่น 🔄</span>`;

        return `
            <div class="flashcard-view-wrapper animate-fade-in">
                <!-- Radical Filters -->
                <div class="radical-filters-container">
                    ${radicalChips}
                </div>

                <!-- Flashcard 3D perspective wrapper -->
                <div class="flashcard-perspective" onclick="HSKVocabulary.flipCard()">
                    <div class="flashcard" id="flashcard-element">
                        <!-- Card Front -->
                        <div class="card-face card-front">
                            <span class="pos-tag badge badge-info">${HSKUtils.escapeHTML(word.pos)}</span>
                            <div class="zh-word zh-char">${HSKUtils.escapeHTML(word.word)}</div>
                            <span class="pinyin-text">${HSKUtils.escapeHTML(word.pinyin)}</span>
                            <div class="hint-text"><i class="fa-solid fa-repeat"></i> คลิกการ์ดเพื่อดูคำแปล</div>
                        </div>

                        <!-- Card Back -->
                        <div class="card-face card-back">
                            <div class="card-back-header">
                                <span class="badge badge-gold">หมวดนำ: ${HSKUtils.escapeHTML(word.radical || 'อื่น ๆ')} (${HSKUtils.escapeHTML(word.radicalName || '-')})</span>
                                ${statusBadge}
                            </div>
                            <div class="card-back-body">
                                <div class="card-back-word zh-char">${HSKUtils.escapeHTML(word.word)}</div>
                                <div class="card-meaning">${HSKUtils.escapeHTML(word.thai)}</div>
                                ${word.examples && word.examples.length > 0 ? `
                                    <div class="card-example">
                                        <div class="card-example-zh zh-char">${HSKUtils.escapeHTML(word.examples[0].zh)}</div>
                                        <div class="card-example-py pinyin-text">${HSKUtils.escapeHTML(word.examples[0].py)}</div>
                                        <div class="card-example-th">${HSKUtils.escapeHTML(word.examples[0].th)}</div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flashcard-nav">
                    <button class="nav-circle-btn" onclick="event.stopPropagation(); HSKVocabulary.navigateCard(-1)"><i class="fa-solid fa-arrow-left"></i></button>
                    <span class="card-counter">${this.currentIndex + 1} / ${this.filteredWords.length}</span>
                    <button class="nav-circle-btn" onclick="event.stopPropagation(); HSKVocabulary.navigateCard(1)"><i class="fa-solid fa-arrow-right"></i></button>
                    <button class="nav-circle-btn" onclick="event.stopPropagation(); HSKTTS.speak('${word.word}')" title="ออกเสียง"><i class="fa-solid fa-volume-high"></i></button>
                </div>

                <!-- Action Button Statuses -->
                <div class="flashcard-action-bar">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); HSKVocabulary.updateStatus('${word.id}', 'studying')">
                        <i class="fa-solid fa-repeat"></i> ยังไม่แม่น
                    </button>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); HSKVocabulary.updateStatus('${word.id}', 'mastered')">
                        <i class="fa-solid fa-check"></i> จำได้แล้ว
                    </button>
                </div>
            </div>
        `;
    },

    flipCard: function() {
        const el = document.getElementById('flashcard-element');
        if (el) el.classList.toggle('flipped');
    },

    navigateCard: function(dir) {
        const el = document.getElementById('flashcard-element');
        if (el) el.classList.remove('flipped'); // Reset flip state
        
        setTimeout(() => {
            this.currentIndex = (this.currentIndex + dir + this.filteredWords.length) % this.filteredWords.length;
            this.render();
        }, 150);
    },

    filterByRadical: function(rad) {
        this.selectedRadical = rad;
        const level = HSKState.data.currentLevel;
        const vocabDb = window.HSK_DATA.vocabulary[`hsk${level}`] || [];
        
        const sourcePool = this.baseWords && this.baseWords.length > 0 ? this.baseWords : vocabDb;
        
        if (rad === '') {
            this.filteredWords = sourcePool;
        } else {
            this.filteredWords = sourcePool.filter(w => w.radical === rad);
        }
        this.currentIndex = 0;
        this.render();
    },

    updateStatus: function(wordId, status) {
        HSKState.setVocabStatus(wordId, status);

        // Check if all filteredWords are mastered to trigger planner checklist update
        const allMastered = this.filteredWords.every(w => HSKState.data.vocabStatuses[w.id] === 'mastered');
        if (allMastered) {
            const wordIds = this.filteredWords.map(w => w.id);
            HSKState.markPlannerTaskComplete('vocab', { wordIds: wordIds });
        }
        
        // Auto-advance to next card with slight delay for UX
        const el = document.getElementById('flashcard-element');
        if (el) {
            el.classList.remove('flipped');
        }
        
        setTimeout(() => {
            if (this.currentIndex < this.filteredWords.length - 1) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0; // Wrap around
            }
            this.render();
        }, 200);
    },

    /* =========================================================================
     * DICTIONARY TABLE SUBVIEW
     * ========================================================================= */
    renderTableHTML: function(vocabDb) {
        // Filter by selected day if not 'all'
        const pool = this.selectedDayValue === 'all' ? vocabDb : this.filteredWords;
        const sorted = [...pool].sort((a, b) => a.pinyin.localeCompare(b.pinyin));

        let rowsHTML = "";
        sorted.forEach((word, idx) => {
            const status = HSKState.data.vocabStatuses[word.id] || 'new';
            let badge = `<span class="badge badge-info">ใหม่</span>`;
            if (status === 'mastered') badge = `<span class="badge badge-success">จำได้</span>`;
            if (status === 'studying') badge = `<span class="badge badge-red">กำลังฝึก</span>`;

            rowsHTML += `
                <tr class="vocab-row-item" data-word="${word.word}" data-pinyin="${word.pinyin}" data-thai="${word.thai}">
                    <td>${idx + 1}</td>
                    <td class="table-zh-cell zh-char">
                        ${HSKUtils.escapeHTML(word.word)}
                        <i class="fa-solid fa-volume-high table-speaker-icon" onclick="HSKTTS.speak('${word.word}')"></i>
                    </td>
                    <td><span class="pinyin-text">${HSKUtils.escapeHTML(word.pinyin)}</span></td>
                    <td>${HSKUtils.escapeHTML(word.thai)}</td>
                    <td><span class="badge badge-secondary" style="font-size: 0.75rem;">${HSKUtils.escapeHTML(word.pos)}</span></td>
                    <td>${badge}</td>
                </tr>
            `;
        });

        return `
            <div class="animate-fade-in">
                <!-- Search bar & Print Button -->
                <div class="table-view-controls" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width: 250px; margin-bottom: 0;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="vocab-search-box" class="search-input" placeholder="ค้นหาตัวจีน พินอิน หรือความหมายภาษาไทย...">
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="HSKUtils.printVocabulary(${HSKState.data.currentLevel})" style="display: flex; align-items: center; gap: 8px; font-weight: 600; height: 38px;">
                        <i class="fa-solid fa-print"></i> พิมพ์คำศัพท์ระดับ HSK ${HSKState.data.currentLevel} (A4 PDF)
                    </button>
                </div>

                <!-- Responsive table -->
                <div class="vocab-table-container">
                    <table class="vocab-table">
                        <thead>
                            <tr>
                                <th style="width: 60px;">#</th>
                                <th>อักษรจีน</th>
                                <th>พินอิน</th>
                                <th>คำแปลภาษาไทย</th>
                                <th>ประเภทคำ</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody id="vocab-table-body">
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterTable: function(query) {
        const q = query.toLowerCase().trim();
        const rows = document.querySelectorAll('.vocab-row-item');
        
        rows.forEach(row => {
            const word = row.dataset.word.toLowerCase();
            const pinyin = row.dataset.pinyin.toLowerCase();
            const thai = row.dataset.thai.toLowerCase();

            if (word.includes(q) || pinyin.includes(q) || thai.includes(q)) {
                row.classList.remove('hide');
            } else {
                row.classList.add('hide');
            }
        });
    },

    /* =========================================================================
     * DYNAMIC QUIZ SUBVIEW
     * ========================================================================= */
    renderQuizHTML: function(vocabDb) {
        // Generate daily vocabulary quiz if not generated
        if (this.quizQuestions.length === 0 || this.quizSubmitted) {
            this.generateVocabularyQuiz(vocabDb);
        }

        if (this.quizCurrentIdx >= this.quizQuestions.length) {
            return this.renderQuizResultsHTML();
        }

        const question = this.quizQuestions[this.quizCurrentIdx];
        const progressPercent = (this.quizCurrentIdx / this.quizQuestions.length) * 100;

        let optionsHTML = "";
        question.options.forEach((opt, idx) => {
            let stateClass = "";
            let iconHTML = "";
            
            if (this.quizSelectedAnswer !== null) {
                if (idx === question.answerIdx) {
                    stateClass = "correct";
                    iconHTML = `<i class="fa-solid fa-check"></i>`;
                } else if (idx === this.quizSelectedAnswer) {
                    stateClass = "wrong";
                    iconHTML = `<i class="fa-solid fa-xmark"></i>`;
                }
            } else {
                stateClass = "";
            }

            optionsHTML += `
                <button class="option-btn ${stateClass}" onclick="HSKVocabulary.selectAnswer(${idx})" ${this.quizSelectedAnswer !== null ? 'disabled' : ''}>
                    <span>${idx + 1}. ${HSKUtils.escapeHTML(opt)}</span>
                    ${iconHTML}
                </button>
            `;
        });

        return `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span>คำถามข้อที่ ${this.quizCurrentIdx + 1} / ${this.quizQuestions.length}</span>
                    <div class="quiz-progress-bar-wrapper">
                        <div class="quiz-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <span>คะแนน: ${this.quizScore}</span>
                </div>

                <div class="quiz-question-box">
                    <div class="quiz-prompt">${HSKUtils.escapeHTML(question.prompt)}</div>
                    <div class="quiz-chinese-target zh-char" style="cursor: pointer;" onclick="HSKTTS.speak('${question.wordText}')">
                        ${HSKUtils.escapeHTML(question.targetText)}
                    </div>
                </div>

                <div class="options-grid">
                    ${optionsHTML}
                </div>

                <!-- Explanation display -->
                ${this.quizSelectedAnswer !== null ? `
                    <div class="quiz-explanation-box ${this.quizSelectedAnswer === question.answerIdx ? 'success' : 'error'} animate-fade-in">
                        <h4 style="font-weight: 700; margin-bottom: 8px;">
                            ${this.quizSelectedAnswer === question.answerIdx ? '👍 ถูกต้อง!' : '❌ ยังไม่ถูก'}
                        </h4>
                        <p style="font-size: 0.95rem; margin-bottom: 10px;">
                            คำแปล: <strong>${HSKUtils.escapeHTML(question.solutionText)}</strong>
                        </p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">
                            เสียงอ่านพินอิน: ${HSKUtils.escapeHTML(question.wordPinyin)} (${HSKUtils.escapeHTML(question.pos)})
                        </p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 15px; width: 100%;" onclick="HSKVocabulary.nextQuestion()">
                            ข้อถัดไป <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    generateVocabularyQuiz: function(vocabDb) {
        this.quizQuestions = [];
        this.quizCurrentIdx = 0;
        this.quizScore = 0;
        this.quizSelectedAnswer = null;
        this.quizSubmitted = false;

        const level = HSKState.data.currentLevel;
        const activeWeek = this.currentQuizWeek || HSKState.data.activeWeeks[level] || 1;
        const dayIdx = this.currentQuizDay;

        let targetWords = [];

        // If a specific day subset is selected via dropdown/planner route
        if (this.selectedDayValue !== 'all' && this.filteredWords && this.filteredWords.length > 0) {
            targetWords = [...this.filteredWords];
        } else if (dayIdx && dayIdx >= 1 && dayIdx <= 5) {
            // If it's a daily quiz (Day 1-5) from the planner
            const dayPlans = window.HSK_DATA.curriculum.getPlannerConfig(level, activeWeek);
            const dayPlan = dayPlans.find(d => d.dayIndex === dayIdx);
            if (dayPlan) {
                const vocabTask = dayPlan.tasks.find(t => t.type === 'vocab');
                if (vocabTask && vocabTask.wordIds) {
                    targetWords = vocabDb.filter(w => vocabTask.wordIds.includes(w.id));
                }
            }
        }

        // If targetWords is empty (e.g. general quiz or Day 6/7 review), fall back to status probability
        if (targetWords.length === 0) {
            targetWords = this.filterVocabByStatusProbability(vocabDb);
        }

        const shuffledWords = HSKUtils.shuffle(targetWords).slice(0, 5); // 5 questions

        shuffledWords.forEach(word => {
            const isCharToThai = Math.random() > 0.5;
            let targetText = "";
            let prompt = "";
            let solutionText = "";
            let options = [];
            
            // Generate distractor answers
            const distractors = HSKUtils.shuffle(vocabDb.filter(w => w.id !== word.id));

            if (isCharToThai) {
                prompt = "จงเลือกความหมายภาษาไทยที่ถูกต้องของคำนี้";
                targetText = word.word;
                solutionText = word.thai;
                options = [word.thai, distractors[0].thai, distractors[1].thai, distractors[2].thai];
            } else {
                prompt = `จงหาตัวจีนที่ตรงกับคำอ่าน: [ ${word.pinyin} ]`;
                targetText = word.pinyin;
                solutionText = word.word;
                options = [word.word, distractors[0].word, distractors[1].word, distractors[2].word];
            }

            options = HSKUtils.shuffle(options);
            const answerIdx = options.indexOf(solutionText);

            this.quizQuestions.push({
                wordId: word.id,
                wordText: word.word,
                wordPinyin: word.pinyin,
                pos: word.pos,
                prompt: prompt,
                targetText: targetText,
                solutionText: solutionText,
                options: options,
                answerIdx: answerIdx
            });
        });
    },

    selectAnswer: function(idx) {
        if (this.quizSelectedAnswer !== null) return;
        this.quizSelectedAnswer = idx;
        const question = this.quizQuestions[this.quizCurrentIdx];
        
        if (idx === question.answerIdx) {
            this.quizScore++;
            HSKState.setVocabStatus(question.wordId, 'mastered');
        } else {
            HSKState.setVocabStatus(question.wordId, 'studying');
        }
        
        this.render();

        const currentIdx = this.quizCurrentIdx;
        const autoAdvance = () => {
            setTimeout(() => {
                if (this.quizCurrentIdx === currentIdx) {
                    this.nextQuestion();
                }
            }, 500); // Snappy 500ms auto-advance
        };
        HSKTTS.speak(question.wordText, autoAdvance);

        setTimeout(() => {
            if (this.quizCurrentIdx === currentIdx) {
                this.nextQuestion();
            }
        }, 4000);
    },

    nextQuestion: function() {
        this.quizSelectedAnswer = null;
        this.quizCurrentIdx++;
        this.render();
    },

    renderQuizResultsHTML: function() {
        this.quizSubmitted = true;
        
        // Save score to state
        const level = HSKState.data.currentLevel;
        
        let activeWeek = this.currentQuizWeek;
        let todayIdx = this.currentQuizDay;
        
        if (!activeWeek && !todayIdx && this.selectedDayValue && this.selectedDayValue.startsWith('w')) {
            const parts = this.selectedDayValue.split('_');
            activeWeek = parseInt(parts[0].substring(1));
            todayIdx = parseInt(parts[1].substring(1));
        }
        
        if (!activeWeek) {
            activeWeek = HSKState.data.activeWeeks[level] || 1;
        }
        if (!todayIdx) {
            todayIdx = new Date().getDay() || 7;
        }
        
        const quizKey = `hsk${level}_w${activeWeek}_d${todayIdx}_daily`;

        const isWeekly = this.quizQuestions.length === 10;
        const passed = isWeekly ? (this.quizScore >= 8) : (this.quizScore >= 4);
        HSKState.setQuizScore(quizKey, this.quizScore, passed);

        if (passed) {
            HSKState.markPlannerTaskComplete(isWeekly ? 'quiz_weekly' : 'quiz_daily', isWeekly ? { weekIndex: activeWeek } : { dayIndex: todayIdx, weekIndex: activeWeek });
        }

        // Reset tracking variables
        this.currentQuizDay = null;
        this.currentQuizWeek = null;

        // Add 5 study minutes on success
        HSKState.addStudyTime(5);

        return `
            <div class="card results-card animate-pop-in">
                <div class="results-score-circle">
                    <div class="results-score">${this.quizScore} / ${this.quizQuestions.length}</div>
                    <div class="results-score-label">คะแนน</div>
                </div>
                <h3 class="results-feedback">${passed ? '🎉 ยอดเยี่ยม! ผ่านเกณฑ์' : '😢 ลองใหม่อีกครั้งนะ'}</h3>
                <p class="results-desc">
                    คุณตอบถูก ${this.quizScore} จาก ${this.quizQuestions.length} ข้อ ${passed ? 'ระบบปลดล็อคภารกิจคำศัพท์วันนี้ให้แล้ว!' : `ต้องการตอบถูกอย่างน้อย ${isWeekly ? '8' : '4'} ข้อเพื่อผ่านภารกิจ`}
                </p>
                <div class="results-actions">
                    <button class="btn btn-secondary" onclick="HSKVocabulary.switchSubView('flashcard')">กลับไปบัตรคำ</button>
                    <button class="btn btn-primary" onclick="HSKVocabulary.switchSubView('quiz')">ทำควิซอีกครั้ง</button>
                </div>
            </div>
        `;
    },

    filterVocabByStatusProbability: function(vocabList) {
        const nonMastered = vocabList.filter(w => HSKState.data.vocabStatuses[w.id] !== 'mastered');
        const mastered = vocabList.filter(w => HSKState.data.vocabStatuses[w.id] === 'mastered');
        
        // Keep only 10% of the mastered words (randomly, min 1)
        const keptCount = Math.max(1, Math.round(mastered.length * 0.1));
        const shuffledMastered = HSKUtils.shuffle(mastered).slice(0, keptCount);
        
        return HSKUtils.shuffle([...nonMastered, ...shuffledMastered]);
    }
};

window.HSKVocabulary = HSKVocabulary;
