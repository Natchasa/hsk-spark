/**
 * HSK Spark 2.0 - Grammar Module Controller
 */
const HSKGrammar = {
    subView: 'lessons', // 'lessons' | 'exercises'
    selectedGrammarId: null,
    selectedLessonValue: 'all', // 'all' | 'w{week}'
    
    // Exercise variables
    exerciseType: 'order', // 'order' | 'compose'
    exerciseIndex: 0,
    exerciseScore: 0,
    currentOrderSelection: [], // Array of indices selected in sentence builder
    currentComposeValue: '',
    exerciseSubmitted: false,
    exerciseCorrect: false,

    /**
     * Render the grammar views inside #app-body
     * @param {Object} params Deep-link parameters (optional)
     */
    render: function(params = null) {
        const body = document.getElementById('app-body');
        const level = HSKState.data.currentLevel;
        const levelKey = `hsk${level}`;
        const grammarDb = window.HSK_DATA.grammar[levelKey] || [];

        if (params) {
            if (params.id) {
                this.selectedGrammarId = params.id;
                HSKState.markPlannerTaskComplete('grammar', { grammarId: params.id });
                // Automatically switch the week selector to match the selected grammar point's lesson
                const currentGrammar = grammarDb.find(g => g.id === params.id);
                if (currentGrammar) {
                    const curConfig = window.HSK_DATA.curriculum.levels[level];
                    if (curConfig) {
                        for (let w = 1; w <= curConfig.totalWeeks; w++) {
                            if (curConfig.weeks[w] && curConfig.weeks[w].lessons.includes(currentGrammar.lesson)) {
                                this.selectedLessonValue = `w${w}`;
                                break;
                            }
                        }
                    }
                }
            }
            if (params.exercise) {
                this.subView = 'exercises';
                this.resetExercises(grammarDb);
            }
        }

        let html = `
            <div class="animate-fade-in">
                <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; overflow-x: auto;">
                    <button class="btn ${this.subView === 'lessons' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HSKGrammar.switchSubView('lessons')">
                        <i class="fa-solid fa-scroll"></i> บทเรียนไวยากรณ์
                    </button>
                    ${this.selectedGrammarId ? `
                        <button class="btn ${this.subView === 'exercises' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HSKGrammar.switchSubView('exercises')">
                            <i class="fa-solid fa-pen-to-square"></i> แบบฝึกหัด
                        </button>
                    ` : ''}
                </div>
        `;

        if (this.subView === 'lessons') {
            // Render selector dropdown (similar to Vocabulary day selector)
            const curConfig = window.HSK_DATA.curriculum.levels[level];
            let selectOptions = `<option value="all" ${this.selectedLessonValue === 'all' ? 'selected' : ''}>แสดงหัวข้อไวยากรณ์ทั้งหมดในระดับ HSK ${level}</option>`;
            
            if (curConfig) {
                for (let w = 1; w <= curConfig.totalWeeks; w++) {
                    const weekInfo = curConfig.weeks[w];
                    if (weekInfo) {
                        const lessons = weekInfo.lessons;
                        const weekGrammar = grammarDb.filter(g => lessons.includes(g.lesson));
                        if (weekGrammar.length > 0) {
                            selectOptions += `<option value="w${w}" ${this.selectedLessonValue === `w${w}` ? 'selected' : ''}>สัปดาห์ที่ ${w}: ${weekInfo.title.split(': ')[1] || weekInfo.title} (${weekGrammar.length} หัวข้อ)</option>`;
                        }
                    }
                }
            }

            html += `
                <div class="vocab-selector-container" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: var(--bg-card); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <label for="grammar-lesson-select" style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; margin: 0;">
                            <i class="fa-solid fa-filter" style="color: var(--accent-red);"></i> เลือกสัปดาห์/บทเรียนไวยากรณ์:
                        </label>
                        <select id="grammar-lesson-select" onchange="HSKGrammar.onLessonSelectChange(this.value)" style="padding: 5px 10px; border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 0.85rem; font-weight: 600; outline: none; cursor: pointer; min-width: 260px;">
                            ${selectOptions}
                        </select>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="HSKUtils.printGrammar(${level})" style="display: flex; align-items: center; gap: 8px; font-weight: 600; height: 32px;">
                        <i class="fa-solid fa-print"></i> พิมพ์หลักไวยากรณ์ระดับ HSK ${level} (A4 PDF)
                    </button>
                </div>
            `;

            html += this.renderLessonsHTML(grammarDb);
        } else {
            html += this.renderExercisesHTML(grammarDb);
        }

        html += `</div>`;
        body.innerHTML = html;
    },

    onLessonSelectChange: function(value) {
        this.selectedLessonValue = value;
        this.render();
    },

    switchSubView: function(view) {
        this.subView = view;
        if (view === 'exercises') {
            const level = HSKState.data.currentLevel;
            const grammarDb = window.HSK_DATA.grammar[`hsk${level}`] || [];
            this.resetExercises(grammarDb);
        }
        this.render();
    },

    resetExercises: function(grammarDb) {
        this.exerciseIndex = 0;
        this.exerciseScore = 0;
        this.currentOrderSelection = [];
        this.currentComposeValue = '';
        this.exerciseSubmitted = false;
        
        const currentGrammar = grammarDb.find(g => g.id === this.selectedGrammarId);
        if (currentGrammar) {
            // Toggle randomly between order and compose exercise modes
            this.exerciseType = Math.random() > 0.5 ? 'order' : 'compose';
        }
    },

    /* =========================================================================
     * LESSONS RENDERER
     * ========================================================================= */
    renderLessonsHTML: function(grammarDb) {
        let filteredDb = [...grammarDb];
        const level = HSKState.data.currentLevel;
        if (this.selectedLessonValue && this.selectedLessonValue.startsWith('w')) {
            const week = parseInt(this.selectedLessonValue.substring(1));
            const curConfig = window.HSK_DATA.curriculum.levels[level];
            if (curConfig && curConfig.weeks[week]) {
                const lessons = curConfig.weeks[week].lessons;
                filteredDb = grammarDb.filter(g => lessons.includes(g.lesson));
            }
        }

        if (filteredDb.length === 0) {
            return `
                <div class="card" style="text-align: center; padding: 40px;">
                    <i class="fa-regular fa-folder-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary);">ขออภัย ยังไม่มีหัวข้อไวยากรณ์ในสัปดาห์/บทเรียนนี้</p>
                </div>
            `;
        }

        let html = `<div class="grammar-grid">`;

        filteredDb.forEach(g => {
            const isSelected = g.id === this.selectedGrammarId;
            let examplesHTML = "";
            
            g.examples.forEach(ex => {
                examplesHTML += `
                    <div class="grammar-example-item">
                        <div class="zh-char" style="font-size: 1.15rem; font-weight: 600;">${HSKUtils.escapeHTML(ex.zh)}</div>
                        <div class="pinyin-text">${HSKUtils.escapeHTML(ex.py)}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">${HSKUtils.escapeHTML(ex.th)}</div>
                    </div>
                `;
            });

            html += `
                <div class="card grammar-card" style="border-left-color: ${isSelected ? 'var(--accent-red)' : 'var(--border-color)'}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h3 style="font-size: 1.25rem; font-weight: 700;">${HSKUtils.escapeHTML(g.title)}</h3>
                        <span class="badge badge-gold">บทที่ ${g.lesson}</span>
                    </div>

                    <div class="grammar-formula-box">
                        <span class="formula-zh zh-char">${HSKUtils.escapeHTML(g.pattern)}</span>
                        <div style="font-size: 0.8rem; font-weight: 400; color: var(--text-secondary); margin-top: 4px;">
                            ${HSKUtils.escapeHTML(g.patternThai)}
                        </div>
                    </div>

                    <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 15px;">
                        ${HSKUtils.escapeHTML(g.explanation)}
                    </p>

                    <div class="grammar-examples-list">
                        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px; color: var(--accent-red);">ประโยคตัวอย่าง:</h4>
                        ${examplesHTML}
                    </div>

                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-primary btn-sm" onclick="HSKGrammar.selectGrammarForExercise('${g.id}')">
                            ทำแบบฝึกหัดเรื่องนี้ <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    },

    selectGrammarForExercise: function(id) {
        this.selectedGrammarId = id;
        this.subView = 'exercises';
        const level = HSKState.data.currentLevel;
        const grammarDb = window.HSK_DATA.grammar[`hsk${level}`] || [];
        this.resetExercises(grammarDb);
        this.render();
    },

    /* =========================================================================
     * EXERCISES RENDERER
     * ========================================================================= */
    renderExercisesHTML: function(grammarDb) {
        const currentGrammar = grammarDb.find(g => g.id === this.selectedGrammarId);
        if (!currentGrammar) return "";

        const list = this.exerciseType === 'order' ? currentGrammar.orderExercises : currentGrammar.composeExercises;
        
        if (this.exerciseIndex >= list.length) {
            return this.renderExerciseResultsHTML(currentGrammar);
        }

        const question = list[this.exerciseIndex];

        if (this.exerciseType === 'order') {
            return this.renderOrderExerciseHTML(question, list.length);
        } else {
            return this.renderComposeExerciseHTML(question, list.length);
        }
    },

    renderOrderExerciseHTML: function(q, total) {
        // Render target dropzone
        let dropzoneHTML = "";
        this.currentOrderSelection.forEach(idx => {
            dropzoneHTML += `
                <button class="word-block" onclick="HSKGrammar.removeWordFromSentence(${idx})">
                    ${HSKUtils.escapeHTML(q.words[idx])}
                </button>
            `;
        });

        // Render word pool
        let poolHTML = "";
        q.words.forEach((word, idx) => {
            const isUsed = this.currentOrderSelection.includes(idx);
            poolHTML += `
                <button class="word-block ${isUsed ? 'used' : ''}" onclick="HSKGrammar.addWordToSentence(${idx})">
                    ${HSKUtils.escapeHTML(word)}
                </button>
            `;
        });

        let validationBorder = "";
        if (this.exerciseSubmitted) {
            validationBorder = this.exerciseCorrect ? "success" : "error";
        }

        return `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span>แบบฝึกหัดเรียงประโยค (ข้อ ${this.exerciseIndex + 1} / ${total})</span>
                    <span>คะแนน: ${this.exerciseScore}</span>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <div class="sentence-prompt">แปลประโยค: <strong>${HSKUtils.escapeHTML(q.prompt)}</strong></div>
                    
                    <!-- Dropzone Assembly area -->
                    <div class="sentence-dropzone ${validationBorder}">
                        ${dropzoneHTML || '<span style="color: var(--text-muted); font-size: 0.9rem;">คลิกคำด้านล่างเพื่อเรียงประโยค...</span>'}
                    </div>

                    <!-- Word pool -->
                    <div class="words-pool">
                        ${poolHTML}
                    </div>

                    ${this.currentOrderSelection.length > 0 && !this.exerciseSubmitted ? `
                        <button class="btn btn-secondary btn-sm" style="margin-top: 15px; width: 100%;" onclick="HSKGrammar.resetSentence()">
                            <i class="fa-solid fa-rotate-left"></i> รีเซ็ต
                        </button>
                    ` : ''}
                </div>

                <!-- Action Button -->
                ${!this.exerciseSubmitted ? `
                    <button class="btn btn-primary" style="width: 100%;" ${this.currentOrderSelection.length !== q.words.length ? 'disabled' : ''} onclick="HSKGrammar.checkOrderAnswer()">
                        ตรวจสอบคำตอบ
                    </button>
                ` : `
                    <div class="quiz-explanation-box ${this.exerciseCorrect ? 'success' : 'error'}">
                        <h4>${this.exerciseCorrect ? '👍 ยอดเยี่ยม!' : '❌ เกือบถูกแล้ว'}</h4>
                        <p style="margin-top: 8px;">เฉลย: <strong class="zh-char" style="font-size: 1.25rem;">${HSKUtils.escapeHTML(q.solution)}</strong></p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 15px; width: 100%;" onclick="HSKGrammar.nextExercise()">
                            ข้อถัดไป <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                `}
            </div>
        `;
    },

    renderComposeExerciseHTML: function(q, total) {
        let tagsHTML = "";
        q.vocabUsed.forEach(tag => {
            tagsHTML += `<button class="word-block" onclick="HSKGrammar.appendWordToCompose('${tag}')" style="font-size: 1rem; padding: 4px 10px; margin-right: 6px; margin-bottom: 6px;">${HSKUtils.escapeHTML(tag)}</button>`;
        });

        return `
            <div class="quiz-container animate-fade-in">
                <div class="quiz-header">
                    <span>แบบฝึกหัดแต่งประโยค (ข้อ ${this.exerciseIndex + 1} / ${total})</span>
                    <span>คะแนน: ${this.exerciseScore}</span>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <div class="sentence-prompt">แต่งประโยค: <strong>${HSKUtils.escapeHTML(q.prompt)}</strong></div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">คำอธิบายเสริม: ${HSKUtils.escapeHTML(q.hint)}</p>
                    
                    <textarea id="compose-textarea" class="composition-input-box" placeholder="พิมพ์อักษรจีน หรือคลิกคำศัพท์ด้านล่างเพื่อสะกดประโยค..." ${this.exerciseSubmitted ? 'disabled' : ''}></textarea>
                    
                    ${!this.exerciseSubmitted ? `
                        <button class="btn btn-secondary btn-sm" style="margin-bottom: 15px;" onclick="document.getElementById('compose-textarea').value = ''">
                            <i class="fa-solid fa-eraser"></i> ล้างช่องพิมพ์
                        </button>
                    ` : ''}

                    <div class="composition-hints">
                        <strong>คลิกคำศัพท์เพื่อเติมในประโยค:</strong>
                        <div style="margin-top: 8px;">${tagsHTML}</div>
                    </div>
                </div>

                <!-- Action Button -->
                ${!this.exerciseSubmitted ? `
                    <button class="btn btn-primary" style="width: 100%;" onclick="HSKGrammar.checkComposeAnswer()">
                        ส่งคำตอบ
                    </button>
                ` : `
                    <div class="quiz-explanation-box ${this.exerciseCorrect ? 'success' : 'error'}">
                        <h4>${this.exerciseCorrect ? '👍 ถูกต้อง!' : '❌ ยังไม่ถูก'}</h4>
                        <p style="margin-top: 8px;">ตัวอย่างคำตอบ: <strong class="zh-char" style="font-size: 1.25rem;">${HSKUtils.escapeHTML(q.answer)}</strong></p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 15px; width: 100%;" onclick="HSKGrammar.nextExercise()">
                            ข้อถัดไป <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                `}
            </div>
        `;
    },

    addWordToSentence: function(idx) {
        if (this.exerciseSubmitted) return;
        if (!this.currentOrderSelection.includes(idx)) {
            this.currentOrderSelection.push(idx);
            this.render();
        }
    },

    removeWordFromSentence: function(idx) {
        if (this.exerciseSubmitted) return;
        this.currentOrderSelection = this.currentOrderSelection.filter(i => i !== idx);
        this.render();
    },

    resetSentence: function() {
        this.currentOrderSelection = [];
        this.render();
    },

    checkOrderAnswer: function() {
        this.exerciseSubmitted = true;
        const currentGrammar = window.HSK_DATA.grammar[`hsk${HSKState.data.currentLevel}`].find(g => g.id === this.selectedGrammarId);
        const q = currentGrammar.orderExercises[this.exerciseIndex];
        const solution = q.solution;
        
        const usersAssembly = this.currentOrderSelection.map(idx => q.words[idx]).join('').replace(/[，。！？]/g, '').trim();
        const cleanSolution = solution.replace(/[，。！？]/g, '').trim();

        if (usersAssembly === cleanSolution) {
            this.exerciseCorrect = true;
            this.exerciseScore++;
        } else {
            this.exerciseCorrect = false;
        }

        this.render();

        const currentIdx = this.exerciseIndex;
        const autoAdvance = () => {
            setTimeout(() => {
                if (this.exerciseSubmitted && this.exerciseIndex === currentIdx) {
                    this.nextExercise();
                }
            }, 500); // Snappy 500ms auto-advance
        };
        HSKTTS.speak(solution, autoAdvance);

        setTimeout(() => {
            if (this.exerciseSubmitted && this.exerciseIndex === currentIdx) {
                this.nextExercise();
            }
        }, 4000);
    },

    checkComposeAnswer: function() {
        const level = HSKState.data.currentLevel;
        const grammarDb = window.HSK_DATA.grammar[`hsk${level}`] || [];
        const currentGrammar = grammarDb.find(g => g.id === this.selectedGrammarId);
        if (!currentGrammar) return;
        const q = currentGrammar.composeExercises[this.exerciseIndex];
        const acceptableAnswers = q.acceptableAnswers || [];

        const input = document.getElementById('compose-textarea').value.trim();
        this.exerciseSubmitted = true;

        const cleanInput = input.replace(/[，。！？]/g, '').trim();
        const cleanAcceptables = acceptableAnswers.map(ans => ans.replace(/[，。！？]/g, '').trim());

        if (cleanAcceptables.includes(cleanInput)) {
            this.exerciseCorrect = true;
            this.exerciseScore++;
        } else {
            this.exerciseCorrect = false;
        }

        this.render();

        const currentIdx = this.exerciseIndex;
        const autoAdvance = () => {
            setTimeout(() => {
                if (this.exerciseSubmitted && this.exerciseIndex === currentIdx) {
                    this.nextExercise();
                }
            }, 500); // Snappy 500ms auto-advance
        };
        HSKTTS.speak(q.answer, autoAdvance);

        setTimeout(() => {
            if (this.exerciseSubmitted && this.exerciseIndex === currentIdx) {
                this.nextExercise();
            }
        }, 4000);
    },

    nextExercise: function() {
        this.exerciseSubmitted = false;
        this.exerciseIndex++;
        this.currentOrderSelection = [];
        this.render();
    },

    renderExerciseResultsHTML: function(grammar) {
        const level = HSKState.data.currentLevel;
        const list = this.exerciseType === 'order' ? grammar.orderExercises : grammar.composeExercises;
        const totalQ = list.length;
        const passThreshold = Math.ceil(totalQ * 0.8);
        const passed = this.exerciseScore >= passThreshold;
        
        if (passed) {
            const exerciseKey = `hsk${level}_grammar_${grammar.id}_complete`;
            HSKState.data.completedTasks[exerciseKey] = true;
            
            HSKState.markPlannerTaskComplete('grammar_exercise', { grammarId: grammar.id });
        }

        // Add 5 study minutes on success
        HSKState.addStudyTime(5);

        return `
            <div class="card results-card animate-pop-in">
                <div class="results-score-circle">
                    <div class="results-score">${this.exerciseScore} / ${totalQ}</div>
                    <div class="results-score-label">คะแนน</div>
                </div>
                <h3 class="results-feedback">${passed ? '🎉 เก่งมาก! ผ่านเกณฑ์แล้ว' : '😢 สู้ๆ นะ ลองทบทวนตัวอย่างอีกรอบ'}</h3>
                <p class="results-desc">
                    คุณทำคะแนนได้ ${this.exerciseScore} เต็ม ${totalQ} ข้อ ${passed ? 'ปลดล็อคประวัติการผ่านไวยากรณ์นี้เรียบร้อยครับ!' : `พยายามทำให้ได้อย่างน้อย ${passThreshold} ข้อเพื่อผ่านเกณฑ์นะครับ (เกณฑ์ผ่าน 80%)`}
                </p>
                <div class="results-actions">
                    <button class="btn btn-secondary" onclick="HSKGrammar.switchSubView('lessons')">กลับหน้าบทเรียน</button>
                    <button class="btn btn-primary" onclick="HSKGrammar.switchSubView('exercises')">เริ่มทำใหม่</button>
                </div>
            </div>
        `;
    },

    appendWordToCompose: function(word) {
        if (this.exerciseSubmitted) return;
        const textarea = document.getElementById('compose-textarea');
        if (textarea) {
            textarea.value += word;
            this.currentComposeValue = textarea.value;
        }
    }
};

window.HSKGrammar = HSKGrammar;
