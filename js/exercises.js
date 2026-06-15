/**
 * HSK Spark 2.0 - Additional Exercises & Exam Simulator Module
 */
const HSKExercises = {
    // Exam Simulator States
    examActive: false,
    examQuestions: [],
    examCurrentIdx: 0,
    examAnswers: [],
    examScore: 0,
    examTimer: null,
    examSecondsLeft: 900, // 15 mins
    examFinished: false,

    // Speaking Practice States
    speakingActive: false,
    speakingQuestions: [],
    speakingCurrentIdx: 0,
    speakingScore: 0,
    speakingStatusText: 'พร้อมเริ่มพูด',
    speakingUserTranscript: '',
    speakingMatchScore: null,
    speakingRecognition: null,
    speakingIsListening: false,

    /**
     * Render the main exercises selection panel inside #app-body
     */
    render: function() {
        const body = document.getElementById('app-body');
        
        // Mark polish_weakness task complete in the planner!
        HSKState.markPlannerTaskComplete('polish_weakness');
        
        if (this.examActive) {
            this.renderExamView();
            return;
        }

        if (this.examFinished) {
            this.renderExamResults();
            return;
        }

        if (this.speakingActive) {
            this.renderSpeakingView();
            return;
        }

        const level = HSKState.data.currentLevel;

        body.innerHTML = `
            <div class="animate-fade-in" style="max-width: 800px; margin: 0 auto;">
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 24px;">📝 แบบฝึกหัดและข้อสอบจำลอง</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <!-- Card Exam Simulator -->
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2.5rem; margin-bottom: 12px;">🏆</div>
                            <h3 style="font-weight: 700; margin-bottom: 8px;">ข้อสอบจำลอง HSK Level ${level}</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                                วัดผลความรู้รวมของทุกคำศัพท์และไวยากรณ์ในระดับ HSK ${level} แบบสุ่ม 10 ข้อ ภายใต้เวลาจำกัด 15 นาที
                            </p>
                        </div>
                        <button class="btn btn-primary" onclick="HSKExercises.startExam()">เริ่มทดสอบข้อสอบ</button>
                    </div>

                    <!-- Card Listening Training -->
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2.5rem; margin-bottom: 12px;">🎧</div>
                            <h3 style="font-weight: 700; margin-bottom: 8px;">ทักษะการฟัง (Listening Quiz)</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                                สุ่มคำศัพท์และออกเสียงผ่านระบบสังเคราะห์เสียงอัจฉริยะ ให้เลือกจับคู่คำศัพท์ที่สอดคล้องกับเสียง
                            </p>
                        </div>
                        <button class="btn btn-gold" onclick="HSKExercises.startListeningQuiz()">เริ่มฝึกทักษะการฟัง</button>
                    </div>

                    <!-- Card Speaking Practice -->
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="font-size: 2.5rem; margin-bottom: 12px;">🗣️</div>
                            <h3 style="font-weight: 700; margin-bottom: 8px;">ฝึกการออกเสียง (Speaking Practice)</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                                ฝึกทักษะการพูดและการออกเสียงคำศัพท์ภาษาจีนแบบเรียลไทม์พร้อมการประเมินผลความถูกต้องของสำเนียง
                            </p>
                        </div>
                        <button class="btn btn-primary" onclick="HSKExercises.startSpeakingPractice()">เริ่มฝึกการออกเสียง</button>
                    </div>
                </div>
            </div>
        `;
    },

    /* =========================================================================
     * EXAM SIMULATOR ENGINE
     * ========================================================================= */
    startExam: function() {
        const level = HSKState.data.currentLevel;
        const levelKey = `hsk${level}`;
        const vocabDb = window.HSK_DATA.vocabulary[levelKey] || [];
        const grammarDb = window.HSK_DATA.grammar[levelKey] || [];

        if (vocabDb.length < 5) {
            HSKComponents.showAlert("ข้อมูลไม่เพียงพอ", "กรุณาเรียนรู้คำศัพท์เพิ่มเติมก่อนเริ่มสอบ");
            return;
        }

        this.examActive = true;
        this.examFinished = false;
        this.examCurrentIdx = 0;
        this.examAnswers = [];
        this.examScore = 0;
        this.examSecondsLeft = 900;
        
        // Generate 10 mixed questions (6 Vocab, 4 Grammar)
        this.generateExamQuestions(vocabDb, grammarDb);
        
        // Timer
        this.startTimer();

        this.render();
    },

    generateExamQuestions: function(vocabDb, grammarDb) {
        this.examQuestions = [];
        const shuffledVocab = HSKUtils.shuffle(vocabDb);
        
        // 6 Vocabulary Questions
        for (let i = 0; i < Math.min(6, shuffledVocab.length); i++) {
            const word = shuffledVocab[i];
            const isCharToThai = i % 2 === 0;
            const distractors = HSKUtils.shuffle(vocabDb.filter(w => w.id !== word.id));
            
            let prompt = "";
            let solution = "";
            let options = [];

            if (isCharToThai) {
                prompt = `คำใดคือความหมายที่ถูกต้องของอักษรจีน: "${word.word}"`;
                solution = word.thai;
                options = [word.thai, distractors[0].thai, distractors[1].thai, distractors[2].thai];
            } else {
                prompt = `จงหาเสียงอ่านพินอินที่ถูกต้องของคำว่า: "${word.word}"`;
                solution = word.pinyin;
                options = [word.pinyin, distractors[0].pinyin, distractors[1].pinyin, distractors[2].pinyin];
            }

            options = HSKUtils.shuffle(options);
            
            this.examQuestions.push({
                type: 'vocab',
                prompt: prompt,
                options: options,
                answerIdx: options.indexOf(solution),
                solutionText: `${word.word} (${word.pinyin}) = ${word.thai}`
            });
        }

        // 4 Grammar Questions
        const shuffledGrammar = HSKUtils.shuffle(grammarDb);
        const grammarPool = shuffledGrammar.length > 0 ? shuffledGrammar : [
            {
                title: "โครงสร้างพื้นฐาน SVO",
                examples: [{ zh: "我学中文。", py: "Wǒ xué Zhōngwén.", th: "ฉันเรียนภาษาจีน" }],
                orderExercises: [{ prompt: "เรียงประโยค: ฉันเรียนภาษาจีน", words: ["中文", "学", "我"], solution: "我学中文。" }]
            }
        ];

        for (let i = 0; i < 4; i++) {
            const gram = grammarPool[i % grammarPool.length];
            const ex = gram.orderExercises[0]; // Take first order exercise
            
            this.examQuestions.push({
                type: 'grammar',
                prompt: `จงจับคู่การเรียงประโยคภาษาจีนที่ถูกต้องของ: "${ex.prompt.replace('เรียงประโยค: ', '')}"`,
                options: [
                    ex.solution,
                    HSKUtils.shuffle(ex.words).join('。'),
                    ex.words.join('。'),
                    "ไม่มีข้อถูก"
                ],
                answerIdx: 0, // Option 1 is solution
                solutionText: `ไวยากรณ์: ${gram.title} -> เฉลย: ${ex.solution}`
            });
        }

        // Final shuffle of exam questions
        this.examQuestions = HSKUtils.shuffle(this.examQuestions);
    },

    startTimer: function() {
        if (this.examTimer) clearInterval(this.examTimer);
        
        this.examTimer = setInterval(() => {
            this.examSecondsLeft--;
            
            const timerEl = document.getElementById('exam-countdown-timer');
            if (timerEl) {
                timerEl.innerText = this.formatTime(this.examSecondsLeft);
            }

            if (this.examSecondsLeft <= 0) {
                clearInterval(this.examTimer);
                this.submitExam();
            }
        }, 1000);
    },

    formatTime: function(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    renderExamView: function() {
        const body = document.getElementById('app-body');
        const q = this.examQuestions[this.examCurrentIdx];
        const progress = ((this.examCurrentIdx) / this.examQuestions.length) * 100;

        let optionsHTML = "";
        q.options.forEach((opt, idx) => {
            const isSelected = this.examAnswers[this.examCurrentIdx] === idx;
            optionsHTML += `
                <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="HSKExercises.selectExamAnswer(${idx})">
                    <span>${idx + 1}. ${HSKUtils.escapeHTML(opt)}</span>
                </button>
            `;
        });

        body.innerHTML = `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span>แบบทดสอบจำลอง ข้อ ${this.examCurrentIdx + 1} / ${this.examQuestions.length}</span>
                    <div style="font-weight: 700; color: var(--accent-red); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-clock"></i> <span id="exam-countdown-timer">${this.formatTime(this.examSecondsLeft)}</span>
                    </div>
                </div>

                <div class="quiz-progress-bar-wrapper" style="margin-bottom: 24px; margin-left: 0; margin-right: 0;">
                    <div class="quiz-progress-bar" style="width: ${progress}%"></div>
                </div>

                <div class="quiz-question-box">
                    <div class="quiz-prompt">${HSKUtils.escapeHTML(q.prompt)}</div>
                </div>

                <div class="options-grid">
                    ${optionsHTML}
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                    <button class="btn btn-secondary" onclick="HSKExercises.navExamQuestion(-1)" ${this.examCurrentIdx === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-arrow-left"></i> ย้อนกลับ
                    </button>
                    
                    ${this.examCurrentIdx === this.examQuestions.length - 1 ? `
                        <button class="btn btn-primary" onclick="HSKExercises.submitExam()">ส่งข้อสอบ</button>
                    ` : `
                        <button class="btn btn-secondary" onclick="HSKExercises.navExamQuestion(1)">
                            ถัดไป <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    selectExamAnswer: function(idx) {
        this.examAnswers[this.examCurrentIdx] = idx;
        this.renderExamView();
    },

    navExamQuestion: function(dir) {
        this.examCurrentIdx += dir;
        this.renderExamView();
    },

    submitExam: function() {
        clearInterval(this.examTimer);
        this.examActive = false;
        this.examFinished = true;

        // Calculate score
        this.examScore = 0;
        this.examQuestions.forEach((q, idx) => {
            if (this.examAnswers[idx] === q.answerIdx) {
                this.examScore++;
            }
        });

        // Add 10 study minutes
        HSKState.addStudyTime(15);

        this.render();
    },

    renderExamResults: function() {
        const body = document.getElementById('app-body');
        const passed = this.examScore >= 8; // 80% passing score

        let reviewHTML = "";
        this.examQuestions.forEach((q, idx) => {
            const isCorrect = this.examAnswers[idx] === q.answerIdx;
            reviewHTML += `
                <div style="padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${idx + 1}. ${HSKUtils.escapeHTML(q.prompt)}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${HSKUtils.escapeHTML(q.solutionText)}</div>
                    </div>
                    <span style="font-size: 1.15rem; color: ${isCorrect ? 'var(--success)' : 'var(--error)'}">
                        ${isCorrect ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>'}
                    </span>
                </div>
            `;
        });

        body.innerHTML = `
            <div class="animate-fade-in" style="max-width: 650px; margin: 0 auto;">
                <div class="card results-card" style="margin-bottom: 30px;">
                    <div class="results-score-circle" style="background: ${passed ? 'linear-gradient(135deg, var(--success), #34d399)' : 'linear-gradient(135deg, var(--accent-red), var(--accent-gold))'}">
                        <div class="results-score">${this.examScore} / 10</div>
                        <div class="results-score-label">คะแนนสอบ</div>
                    </div>
                    <h3 class="results-feedback">${passed ? '🎉 สอบผ่านเกณฑ์ประเมิน!' : '😢 เกือบผ่านแล้ว พยายามทบทวนใหม่'}</h3>
                    <p class="results-desc">
                        สอบผ่านเกณฑ์ประเมินต้องการตอบถูกอย่างน้อย 8 ข้อ จากทั้งหมด 10 ข้อ (เกณฑ์ผ่าน 80%)
                    </p>
                    <button class="btn btn-primary" onclick="HSKExercises.resetExamState()">เสร็จสิ้นการทำข้อสอบ</button>
                </div>

                <div class="card">
                    <h4 style="font-weight: 700; margin-bottom: 15px;">📊 ตรวจทานคำตอบละเอียด</h4>
                    ${reviewHTML}
                </div>
            </div>
        `;
    },

    resetExamState: function() {
        this.examFinished = false;
        this.render();
    },

    /* =========================================================================
     * LISTENING TRAINING SKILL
     * ========================================================================= */
    startListeningQuiz: function() {
        const level = HSKState.data.currentLevel;
        const vocabDb = window.HSK_DATA.vocabulary[`hsk${level}`] || [];
        
        if (vocabDb.length < 4) {
            HSKComponents.showAlert("ข้อมูลไม่เพียงพอ", "คำศัพท์มีไม่เพียงพอสำหรับการฝึกฟัง");
            return;
        }

        // Apply 10% mastered word probability filtering
        const filteredDb = HSKVocabulary.filterVocabByStatusProbability(vocabDb);
        const quizWords = HSKUtils.shuffle(filteredDb).slice(0, 5);
        this.listeningQuizQuestions = quizWords.map(word => {
            const distractors = HSKUtils.shuffle(vocabDb.filter(w => w.id !== word.id));
            const options = HSKUtils.shuffle([word.word, distractors[0].word, distractors[1].word, distractors[2].word]);
            
            return {
                word: word.word,
                pinyin: word.pinyin,
                thai: word.thai,
                options: options,
                answerIdx: options.indexOf(word.word)
            };
        });

        this.listeningQuizIndex = 0;
        this.listeningQuizScore = 0;
        this.listeningQuizSelected = null;
        this.listeningQuizActive = true;

        this.renderListeningView();
    },

    renderListeningView: function() {
        const body = document.getElementById('app-body');
        
        if (this.listeningQuizIndex >= this.listeningQuizQuestions.length) {
            body.innerHTML = `
                <div class="card results-card animate-pop-in" style="max-width: 500px; margin: 40px auto;">
                    <div class="results-score-circle">
                        <div class="results-score">${this.listeningQuizScore} / 5</div>
                        <div class="results-score-label">คะแนน</div>
                    </div>
                    <h3 class="results-feedback">${this.listeningQuizScore >= 4 ? '🎉 หูทองคำ! ผ่านเกณฑ์ฝึกฟัง' : '😢 ฝึกฟังบ่อยๆ เพิ่มเติมนะ'}</h3>
                    <p class="results-desc">ตอบคำถามถูกต้อง ${this.listeningQuizScore} จาก 5 ข้อ (เกณฑ์ผ่าน 80% หรือ 4 ข้อขึ้นไป)</p>
                    <button class="btn btn-primary" onclick="HSKExercises.render()">กลับหน้าแบบฝึกหัด</button>
                </div>
            `;
            return;
        }

        const q = this.listeningQuizQuestions[this.listeningQuizIndex];
        const progress = (this.listeningQuizIndex / this.listeningQuizQuestions.length) * 100;

        let optionsHTML = "";
        q.options.forEach((opt, idx) => {
            let stateClass = "";
            let iconHTML = "";
            
            if (this.listeningQuizSelected !== null) {
                if (idx === q.answerIdx) {
                    stateClass = "correct";
                    iconHTML = `<i class="fa-solid fa-check"></i>`;
                } else if (idx === this.listeningQuizSelected) {
                    stateClass = "wrong";
                    iconHTML = `<i class="fa-solid fa-xmark"></i>`;
                }
            }

            optionsHTML += `
                <button class="option-btn ${stateClass}" onclick="HSKExercises.selectListeningAnswer(${idx})" ${this.listeningQuizSelected !== null ? 'disabled' : ''}>
                    <span class="zh-char" style="font-size: 1.25rem;">${idx + 1}. ${HSKUtils.escapeHTML(opt)}</span>
                    ${iconHTML}
                </button>
            `;
        });

        body.innerHTML = `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span>คำถามฝึกฟัง ข้อที่ ${this.listeningQuizIndex + 1} / ${this.listeningQuizQuestions.length}</span>
                    <div class="quiz-progress-bar-wrapper">
                        <div class="quiz-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <span>คะแนน: ${this.listeningQuizScore}</span>
                </div>

                <div class="quiz-question-box" style="padding: 40px 20px;">
                    <div class="quiz-prompt">คลิกไอคอนลำโพงเพื่อฟังเสียงตัวจีน แล้วเลือกคำตอบที่ถูกต้อง</div>
                    <button class="btn btn-primary btn-lg pulse-glow" onclick="HSKTTS.speak('${q.word}')" style="margin-top: 20px; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-volume-high" style="font-size: 2rem;"></i>
                    </button>
                </div>

                <div class="options-grid">
                    ${optionsHTML}
                </div>

                ${this.listeningQuizSelected !== null ? `
                    <div class="quiz-explanation-box ${this.listeningQuizSelected === q.answerIdx ? 'success' : 'error'}">
                        <h4>${this.listeningQuizSelected === q.answerIdx ? '👍 หูไวใช้ได้!' : '❌ ยังไม่ถูกใจ'}</h4>
                        <p style="margin-top: 8px;">ตัวจีน: <strong>${HSKUtils.escapeHTML(q.word)}</strong> | พินอิน: <strong>${HSKUtils.escapeHTML(q.pinyin)}</strong></p>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">คำแปล: ${HSKUtils.escapeHTML(q.thai)}</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 15px; width: 100%;" onclick="HSKExercises.nextListeningQuestion()">
                            ข้อถัดไป <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;


        // Automatically trigger speech upon rendering question!
        setTimeout(() => HSKTTS.speak(q.word), 300);
    },

    selectListeningAnswer: function(idx) {
        if (this.listeningQuizSelected !== null) return;
        this.listeningQuizSelected = idx;
        const q = this.listeningQuizQuestions[this.listeningQuizIndex];

        if (idx === q.answerIdx) {
            this.listeningQuizScore++;
        }

        this.renderListeningView();

        const currentIdx = this.listeningQuizIndex;
        const autoAdvance = () => {
            setTimeout(() => {
                if (this.listeningQuizIndex === currentIdx) {
                    this.nextListeningQuestion();
                }
            }, 500); // Snappy 500ms auto-advance
        };
        HSKTTS.speak(q.word, autoAdvance);

        setTimeout(() => {
            if (this.listeningQuizIndex === currentIdx) {
                this.nextListeningQuestion();
            }
        }, 4000);
    },

    nextListeningQuestion: function() {
        this.listeningQuizSelected = null;
        this.listeningQuizIndex++;
        this.renderListeningView();
    },

    /* =========================================================================
     * SPEAKING PRACTICE SKILL
     * ========================================================================= */
    startSpeakingPractice: function() {
        const level = HSKState.data.currentLevel;
        const grammarDb = window.HSK_DATA.grammar[`hsk${level}`] || [];
        
        if (grammarDb.length === 0) {
            HSKComponents.showAlert("ข้อมูลไม่เพียงพอ", "ไม่มีหัวข้อไวยากรณ์สำหรับการฝึกออกเสียง");
            return;
        }

        // Build the speaking questions pool from grammar exercises (1 sentence per topic)
        const sentencePool = [];
        grammarDb.forEach(g => {
            if (g.orderExercises && g.orderExercises.length > 0) {
                const ex = g.orderExercises[0];
                sentencePool.push({
                    id: `${g.id}_speaking`,
                    word: ex.solution,
                    pinyin: `ไวยากรณ์: ${g.title}`,
                    thai: ex.prompt.replace('เรียงประโยค: ', '').replace('เรียงประโยค:', '').trim(),
                    grammarId: g.id
                });
            } else if (g.composeExercises && g.composeExercises.length > 0) {
                const ex = g.composeExercises[0];
                sentencePool.push({
                    id: `${g.id}_speaking`,
                    word: ex.answer || ex.solution,
                    pinyin: `ไวยากรณ์: ${g.title}`,
                    thai: ex.prompt.replace('แต่งประโยค: ', '').replace('แต่งประโยค:', '').trim(),
                    grammarId: g.id
                });
            }
        });

        if (sentencePool.length === 0) {
            HSKComponents.showAlert("ข้อมูลไม่เพียงพอ", "ไม่มีแบบฝึกหัดไวยากรณ์สำหรับการฝึกออกเสียง");
            return;
        }

        // Shuffle the pool and select 5 sentences for the session
        this.speakingQuestions = HSKUtils.shuffle(sentencePool).slice(0, 5);
        this.speakingCurrentIdx = 0;
        this.speakingScore = 0;
        this.speakingStatusText = 'พร้อมเริ่มพูด';
        this.speakingUserTranscript = '';
        this.speakingMatchScore = null;
        this.speakingActive = true;
        this.speakingIsListening = false;

        this.renderSpeakingView();
    },

    renderSpeakingView: function() {
        const body = document.getElementById('app-body');
        
        if (this.speakingCurrentIdx >= this.speakingQuestions.length) {
            HSKState.addStudyTime(5);
            this.speakingActive = false;
            body.innerHTML = `
                <div class="card results-card animate-pop-in" style="max-width: 500px; margin: 40px auto;">
                    <div class="results-score-circle">
                        <div class="results-score">${this.speakingScore} / 5</div>
                        <div class="results-score-label">คะแนน</div>
                    </div>
                    <h3 class="results-feedback">${this.speakingScore >= 4 ? '🎉 สำเนียงดีมาก!' : '😢 ฝึกฝนเพิ่มเติมนะ'}</h3>
                    <p class="results-desc">ออกเสียงผ่านเกณฑ์ ${this.speakingScore} จาก 5 คำ (เกณฑ์ผ่าน 80% หรือ 4 คำขึ้นไป)</p>
                    <button class="btn btn-primary" onclick="HSKExercises.render()">กลับหน้าแบบฝึกหัด</button>
                </div>`;
            return;
        }

        const q = this.speakingQuestions[this.speakingCurrentIdx];
        const progress = (this.speakingCurrentIdx / this.speakingQuestions.length) * 100;
        const isSupported = ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
        const isListening = this.speakingIsListening;

        // ---- Mic button HTML ----
        let micBtnHTML = '';
        if (!isSupported) {
            micBtnHTML = `
                <div class="spk-mic-wrap">
                    <button class="spk-mic-btn" disabled style="opacity:0.4;">
                        <i class="fa-solid fa-microphone-slash"></i>
                    </button>
                    <div class="spk-mic-label" style="color:var(--error);">เบราว์เซอร์ไม่รองรับ</div>
                    <div class="spk-no-support">แนะนำ Google Chrome / Safari</div>
                </div>`;
        } else {
            micBtnHTML = `
                <div class="spk-mic-wrap">
                    <button id="mic-speaking-btn"
                        class="spk-mic-btn${isListening ? ' listening' : ''}"
                        onclick="HSKExercises.toggleSpeechRecognition()">
                        <i class="fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}"></i>
                        ${isListening ? '<span class="spk-pulse-ring"></span>' : ''}
                    </button>
                    <div class="spk-mic-label">${isListening ? '🎙️ กำลังฟัง...' : 'กดเพื่อพูด'}</div>
                </div>`;
        }

        // ---- Score Ring (shown after recognition) ----
        let scoreDisplayHTML = '';
        if (this.speakingMatchScore !== null) {
            const pct = this.speakingMatchScore;
            const isPassed = pct >= 60;
            const clr = isPassed ? '#10b981' : '#f43f5e';
            const R = 34, C = +(2 * Math.PI * R).toFixed(2);
            const offset = +(C - (pct / 100) * C).toFixed(2);
            scoreDisplayHTML = `
                <div class="spk-result-card ${isPassed ? 'pass' : 'fail'}">
                    <div class="spk-score-ring-wrap">
                        <svg class="spk-score-ring" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="${R}" fill="none" stroke="var(--bg-tertiary)" stroke-width="7"/>
                            <circle cx="40" cy="40" r="${R}" fill="none"
                                stroke="${clr}" stroke-width="7" stroke-linecap="round"
                                stroke-dasharray="${C}" stroke-dashoffset="${offset}"
                                transform="rotate(-90 40 40)"
                                style="transition:stroke-dashoffset .6s ease"/>
                        </svg>
                        <div class="spk-score-pct" style="color:${clr}">${pct}%</div>
                    </div>
                    <div class="spk-result-info">
                        <div class="spk-result-verdict">${isPassed ? '✅ ออกเสียงถูกต้อง!' : '❌ ออกเสียงยังไม่ชัด'}</div>
                        <div class="spk-result-transcript">คุณพูดว่า: <strong class="zh-char">${HSKUtils.escapeHTML(this.speakingUserTranscript || '(ไม่มีเสียง)')}</strong></div>
                        <div class="spk-result-threshold">เกณฑ์ผ่าน 60% &bull; คุณได้ <strong>${pct}%</strong></div>
                    </div>
                </div>`;
        }

        const statusHTML = this.speakingMatchScore === null
            ? `<div class="spk-status">${HSKUtils.escapeHTML(this.speakingStatusText)}</div>`
            : '';

        body.innerHTML = `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span style="font-size:.85rem;">ฝึกออกเสียง ข้อ ${this.speakingCurrentIdx + 1}/${this.speakingQuestions.length}</span>
                    <div class="quiz-progress-bar-wrapper">
                        <div class="quiz-progress-bar" style="width:${progress}%"></div>
                    </div>
                    <span style="color:var(--accent-gold);font-weight:700;font-size:.85rem;">✅ ${this.speakingScore}/${this.speakingQuestions.length}</span>
                </div>

                <div class="spk-word-card">
                    <div class="spk-word-zh zh-char">${HSKUtils.escapeHTML(q.word)}</div>
                    <div class="spk-word-py">${HSKUtils.escapeHTML(q.pinyin)}</div>
                    <div class="spk-word-th">ความหมาย: ${HSKUtils.escapeHTML(q.thai)}</div>
                    <button class="spk-listen-btn" onclick="HSKTTS.speak('${q.word}')">
                        <i class="fa-solid fa-volume-high"></i> ฟังเสียง
                    </button>
                </div>

                <div class="spk-mic-area">
                    ${micBtnHTML}
                    ${statusHTML}
                </div>

                ${scoreDisplayHTML}

                <div class="spk-nav-row">
                    <button class="btn btn-secondary" onclick="HSKExercises.exitSpeakingPractice()">
                        <i class="fa-solid fa-xmark"></i> ออก
                    </button>
                    <button class="btn btn-primary" onclick="HSKExercises.nextSpeakingQuestion()">
                        ข้อถัดไป <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>`;

        if (this.speakingMatchScore === null && !isListening) {
            setTimeout(() => HSKTTS.speak(q.word), 400);
        }
    },


    toggleSpeechRecognition: function() {
        if (this.speakingIsListening) {
            this.stopSpeechRecognition();
        } else {
            this.startSpeechRecognition();
        }
    },

    /**
     * Initialize (or return existing) SpeechRecognition instance.
     * Called once; subsequent calls reuse the same object.
     */
    initRecognition: function() {
        if (this.speakingRecognition) return this.speakingRecognition;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
            console.log('[HSK Spark] Speech recognition started.');
        };

        recognition.onerror = (event) => {
            console.error('[HSK Spark] Speech recognition error:', event.error);
            this.speakingIsListening = false;

            if (event.error === 'no-speech') {
                this.speakingStatusText = '⚠️ ไม่ได้ยินเสียงพูด กรุณาลองใหม่';
            } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                this.speakingStatusText = '🚫 ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน — กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์';
            } else if (event.error === 'aborted') {
                // Intentional abort — don't update status
                return;
            } else {
                this.speakingStatusText = '❌ เกิดข้อผิดพลาดในการบันทึกเสียง ลองใหม่อีกครั้ง';
            }
            this.renderSpeakingView();
        };

        recognition.onend = () => {
            console.log('[HSK Spark] Speech recognition ended.');
            this.speakingIsListening = false;
            if (this.speakingMatchScore === null && !this._aborting) {
                this.renderSpeakingView();
            }
            this._aborting = false;
        };

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            console.log('[HSK Spark] Transcript:', result);
            this.speakingUserTranscript = result;

            const q = this.speakingQuestions[this.speakingCurrentIdx];
            const score = this.calculateChineseMatchScore(q.word, result);

            this.speakingMatchScore = score;
            if (score >= 60) {
                this.speakingScore++;
                if (q.wordId) {
                    HSKState.setVocabStatus(q.wordId, 'mastered');
                } else if (q.grammarId) {
                    const level = HSKState.data.currentLevel;
                    const exerciseKey = `hsk${level}_grammar_${q.grammarId}_complete`;
                    HSKState.data.completedTasks[exerciseKey] = true;
                    HSKState.markPlannerTaskComplete('grammar_exercise', { grammarId: q.grammarId });
                }
            } else {
                if (q.wordId) {
                    HSKState.setVocabStatus(q.wordId, 'studying');
                }
            }

            this.speakingStatusText = 'วิเคราะห์เสียงเสร็จสิ้น';
            this.renderSpeakingView();

            const currentIdx = this.speakingCurrentIdx;
            const autoAdvance = () => {
                setTimeout(() => {
                    if (this.speakingCurrentIdx === currentIdx) {
                        this.nextSpeakingQuestion();
                    }
                }, 500); // Snappy 500ms auto-advance
            };
            HSKTTS.speak(q.word, autoAdvance);

            setTimeout(() => {
                if (this.speakingCurrentIdx === currentIdx) {
                    this.nextSpeakingQuestion();
                }
            }, 4000);
        };

        this.speakingRecognition = recognition;
        return recognition;
    },

    startSpeechRecognition: function() {
        const recognition = this.initRecognition();
        if (!recognition) return;

        this.speakingIsListening = true;
        this.speakingStatusText = '🎙️ กำลังฟัง... กรุณาออกเสียง';
        this.speakingMatchScore = null;
        this.speakingUserTranscript = '';
        this._aborting = false;
        this.renderSpeakingView();

        try {
            recognition.start();
        } catch (e) {
            // Already started — abort and restart
            recognition.abort();
            setTimeout(() => {
                this._aborting = false;
                recognition.start();
            }, 200);
        }
    },

    stopSpeechRecognition: function() {
        if (this.speakingRecognition && this.speakingIsListening) {
            this._aborting = true;
            try {
                this.speakingRecognition.abort(); // abort preserves the instance for reuse
            } catch (e) {
                console.warn('[HSK Spark] Error aborting recognition:', e);
            }
        }
        this.speakingIsListening = false;
        this.speakingStatusText = 'ยกเลิกการฟังเสียง';
        this.renderSpeakingView();
    },

    calculateChineseMatchScore: function(target, transcript) {
        // Clean strings (remove spaces, punctuation)
        const cleanStr = (s) => s.replace(/[\s\p{P}]/gu, '').toLowerCase();
        const t = cleanStr(target);
        const tr = cleanStr(transcript);
        
        if (!t || !tr) return 0;
        if (t === tr) return 100;
        
        // Count how many chars of target appear in transcript
        let matches = 0;
        const trChars = tr.split('');
        for (let i = 0; i < t.length; i++) {
            const char = t[i];
            const idx = trChars.indexOf(char);
            if (idx !== -1) {
                matches++;
                trChars.splice(idx, 1); // remove to prevent double matching
            }
        }
        
        return Math.round((matches / t.length) * 100);
    },

    nextSpeakingQuestion: function() {
        this.speakingMatchScore = null;
        this.speakingUserTranscript = '';
        this.speakingStatusText = 'พร้อมเริ่มพูด';
        this.speakingCurrentIdx++;
        this.renderSpeakingView();
    },

    exitSpeakingPractice: function() {
        this.stopSpeechRecognition();
        this.speakingActive = false;
        this.render();
    }
};

window.HSKExercises = HSKExercises;
