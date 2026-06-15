/**
 * HSK Spark - Dashboard & Planner View Controller
 */
const HSKDashboard = {
    /**
     * Render the main dashboard screen inside #app-body
     */
    render: function() {
        const body = document.getElementById('app-body');
        const level = HSKState.data.currentLevel;
        const levelKey = `hsk${level}`;
        
        // Calculate progress stats
        const vocabDb = window.HSK_DATA.vocabulary[levelKey] || [];
        const grammarDb = window.HSK_DATA.grammar[levelKey] || [];
        
        const totalVocab = vocabDb.length;
        const totalGrammar = grammarDb.length;
        
        let masteredVocab = 0;
        vocabDb.forEach(w => {
            if (HSKState.data.vocabStatuses[w.id] === 'mastered') {
                masteredVocab++;
            }
        });

        // Let's assume grammar is completed if its corresponding tasks are finished
        let completedGrammar = 0;
        grammarDb.forEach(g => {
            const exerciseKey = `hsk${level}_grammar_${g.id}_complete`;
            if (HSKState.data.completedTasks[exerciseKey]) {
                completedGrammar++;
            }
        });

        const vocabPercent = totalVocab > 0 ? (masteredVocab / totalVocab) * 100 : 0;
        const grammarPercent = totalGrammar > 0 ? (completedGrammar / totalGrammar) : 0; // Simple ratio
        const overallPercent = (vocabPercent + (grammarPercent * 100)) / 2;

        // Active week config
        const activeWeek = HSKState.data.activeWeeks[level] || 1;
        const curConfig = window.HSK_DATA.curriculum.levels[level];
        const weekConfig = curConfig.weeks[activeWeek];
        const dayPlans = window.HSK_DATA.curriculum.getPlannerConfig(level, activeWeek);

        // Generate recommendations based on state
        const recommendationHTML = this.getRecommendationsHTML(vocabDb, level);

        let html = `
            <div class="animate-fade-in">
                <!-- Welcome Section -->
                <div class="dashboard-hero">
                    <div class="hero-content">
                        <span class="badge badge-red" style="margin-bottom: 8px;">สถิติส่วนตัว</span>
                        <h2 class="hero-title">ยินดีต้อนรับสู่ HSK Level ${level}</h2>
                        <p class="hero-desc">คุณกำลังอยู่ในหลักสูตรการติวเข้มเร่งรัด มาลุยเป้าหมายและทำแบบฝึกหัดวันนี้ให้สำเร็จกันเถอะ!</p>
                        <div style="margin-top: 12px;">
                            <button class="btn btn-gold btn-sm" onclick="HSKApp.navigateTo('vocabulary', { review: true })" style="padding: 6px 12px; font-weight: 700; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border-radius: 4px; border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s ease;">
                                <i class="fa-solid fa-rotate-left"></i> ทบทวนคำศัพท์ที่ยังไม่แม่น (${vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying').length} คำ)
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: var(--accent-red);">${HSKState.data.streak}</div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">Streak (วัน)</div>
                        </div>
                        <div style="text-align: center; border-left: 1px solid var(--border-color); padding-left: 20px;">
                            <div style="font-size: 2rem; font-weight: 800; color: var(--accent-gold);">${HSKState.data.totalStudyMinutes}</div>
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">เรียนไปแล้ว (นาที)</div>
                        </div>
                    </div>
                </div>

                <!-- AI Recommendations -->
                ${recommendationHTML}

                <!-- Stats Counters -->
                <div class="stat-grid">
                    <div class="card stat-card">
                        <div class="stat-info">
                            <h4>ความก้าวหน้ารวม HSK ${level}</h4>
                            <div class="stat-number">${Math.round(overallPercent)}%</div>
                        </div>
                        ${HSKComponents.renderProgressRing(overallPercent, 'vocab')}
                    </div>
                    <div class="card stat-card">
                        <div class="stat-info">
                            <h4>คำศัพท์ HSK ${level} ที่จำได้</h4>
                            <div class="stat-number">${masteredVocab} / ${totalVocab}</div>
                        </div>
                        ${HSKComponents.renderProgressRing(vocabPercent, 'vocab')}
                    </div>
                    <div class="card stat-card">
                        <div class="stat-info">
                            <h4>ไวยากรณ์ HSK ${level} ที่เข้าใจ</h4>
                            <div class="stat-number">${completedGrammar} / ${totalGrammar}</div>
                        </div>
                        ${HSKComponents.renderProgressRing(grammarPercent * 100, 'grammar')}
                    </div>
                </div>

                <!-- Study Plan Section -->
                <div class="planner-section">
                    <div class="section-header">
                        <h3 class="section-title">📅 แผนการเรียนสัปดาห์นี้: ${weekConfig ? HSKUtils.escapeHTML(weekConfig.title) : ''}</h3>
                    </div>

                    <!-- Timeline Weeks Bar -->
                    <div class="timeline-container">
        `;

        // Render week switches
        for (let w = 1; w <= curConfig.totalWeeks; w++) {
            const isWeekActive = w === activeWeek;
            const weekText = curConfig.weeks[w] ? `สัปดาห์ที่ ${w}` : `เดือนที่ ${w}`;
            html += `
                <div class="timeline-item ${isWeekActive ? 'active' : ''}" onclick="HSKDashboard.changeWeek(${w})">
                    ${weekText}
                </div>
            `;
        }

        html += `
                    </div>

                    <!-- Day Cards Grid -->
                    <div class="day-grid">
        `;

        // Render 7 days planner cards
        dayPlans.forEach(day => {
            const totalTasks = day.tasks.length;
            const dayKey = `hsk${level}_w${activeWeek}_d${day.dayIndex}`;
            let doneCount = 0;
            let tasksHTML = "";

            day.tasks.forEach((task, idx) => {
                const taskKey = `${dayKey}_task${idx}`;
                const isTaskDone = HSKState.data.completedTasks[taskKey] || false;
                if (isTaskDone) doneCount++;

                let actionAttr = "";

                // Determine routing actions for label click (navigate)
                if (task.type === 'vocab') {
                    actionAttr = `onclick="HSKApp.navigateTo('vocabulary', { words: '${task.wordIds.join(',')}' })"`;
                } else if (task.type === 'grammar') {
                    actionAttr = `onclick="HSKApp.navigateTo('grammar', { id: '${task.grammarId}' })"`;
                } else if (task.type === 'grammar_exercise') {
                    actionAttr = `onclick="HSKApp.navigateTo('grammar', { id: '${task.grammarId}', exercise: true })"`;
                } else if (task.type === 'quiz_daily') {
                    actionAttr = `onclick="HSKApp.startDailyQuiz(${level}, ${activeWeek}, ${day.dayIndex})"`;
                } else if (task.type === 'quiz_weekly') {
                    actionAttr = `onclick="HSKApp.startWeeklyQuiz(${level}, ${activeWeek})"`;
                } else if (task.type === 'review_all') {
                    actionAttr = `onclick="HSKApp.navigateTo('vocabulary', { review: true })"`;
                } else {
                    actionAttr = `onclick="HSKApp.navigateTo('exercises')"`;
                }

                tasksHTML += `
                    <div class="task-item ${isTaskDone ? 'done' : ''}">
                        <label class="task-check-label">
                            <input type="checkbox"
                                class="task-checkbox"
                                ${isTaskDone ? 'checked' : ''}
                                onchange="HSKDashboard.toggleTask(${level}, ${activeWeek}, ${day.dayIndex}, ${idx}, ${totalTasks})"
                            >
                            <span class="task-check-box"></span>
                        </label>
                        <span class="task-label" ${actionAttr}>${HSKUtils.escapeHTML(task.label)}</span>
                    </div>
                `;
            });

            const isDayDone = doneCount === totalTasks && totalTasks > 0;
            const hasStarted = doneCount > 0;

            let statusBadge, borderColor;
            if (isDayDone) {
                statusBadge = `<span class="badge badge-done">✅ เรียนจบแล้ว</span>`;
                borderColor = 'var(--success)';
            } else if (hasStarted) {
                statusBadge = `<span class="badge badge-red">📖 กำลังเรียน</span>`;
                borderColor = 'var(--accent-red)';
            } else {
                statusBadge = `<span class="badge badge-muted">⬜ ยังไม่เริ่ม</span>`;
                borderColor = 'var(--border-color)';
            }

            html += `
                <div class="card day-card" id="day-card-${day.dayIndex}" style="border-top: 4px solid ${borderColor}">
                    <div class="day-header">
                        <h4 class="day-title">${HSKUtils.escapeHTML(day.title)}</h4>
                        ${statusBadge}
                    </div>
                    <div class="day-tasks">
                        ${tasksHTML}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px;">
                        💡 ${HSKUtils.escapeHTML(day.tip)}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        body.innerHTML = html;
    },

    /**
     * Toggle a task checkbox, auto-update day card UI without full re-render
     */
    toggleTask: function(level, week, day, taskIdx, totalTasks) {
        HSKState.completeTask(level, week, day, taskIdx, totalTasks);
        // Re-render the full dashboard to reflect updated state
        this.render();
    },

    /**
     * Swith target study week
     */
    changeWeek: function(weekNum) {
        HSKState.setActiveWeek(HSKState.data.currentLevel, weekNum);
        this.render();
    },

    /**
     * Compute smart advice recommendations based on studying vocabulary
     */
    getRecommendationsHTML: function(vocabDb, level) {
        // Collect studying words
        const studyingWords = vocabDb.filter(w => HSKState.data.vocabStatuses[w.id] === 'studying');
        
        if (studyingWords.length > 0) {
            const sampleWords = HSKUtils.shuffle(studyingWords).slice(0, 3).map(w => w.word).join(', ');
            return `
                <div class="card recommendation-card animate-fade-in" style="border-left-color: var(--accent-gold);">
                    <div class="rec-icon" style="color: var(--accent-gold); align-self: flex-start; margin-top: 4px;"><i class="fa-solid fa-lightbulb"></i></div>
                    <div class="rec-content" style="width: 100%;">
                        <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 6px;">💡 คำแนะนำและทบทวนคำที่ยังไม่แม่นยำ</h4>
                        <p style="color: var(--text-secondary); line-height: 1.45; font-size: 0.9rem;">
                            คุณมีคำศัพท์ที่ยังไม่แม่นยำหรือเคยตอบควิซผิดในระดับ HSK ${level} เช่น <strong>${HSKUtils.escapeHTML(sampleWords)}</strong> และคำอื่นๆ อีกรวมทั้งหมด <strong>${studyingWords.length} คำ</strong> แนะนำให้ใช้ปุ่มด้านล่างเพื่อเริ่มทบทวนคำศัพท์เหล่านี้ครับ
                        </p>
                        <div style="margin-top: 14px;">
                            <button class="btn btn-gold btn-sm" onclick="HSKApp.navigateTo('vocabulary', { review: true })" style="padding: 6px 12px; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                                <i class="fa-solid fa-rotate-left"></i> เริ่มทบทวนคำที่ไม่แม่น (${studyingWords.length} คำ)
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card recommendation-card animate-fade-in" style="border-left-color: var(--success);">
                <div class="rec-icon" style="color: var(--success);"><i class="fa-solid fa-circle-check"></i></div>
                <div class="rec-content">
                    <h4>เป้าหมายราบรื่น!</h4>
                    <p>เยี่ยมมาก! คุณได้จดจำคำศัพท์ของระดับ HSK ${level} ได้อย่างแม่นยำทุกคำแล้ว ลุยบทเรียนหลักสูตรรายวันต่อไปได้เลยครับ!</p>
                </div>
            </div>
        `;
    }
};

window.HSKDashboard = HSKDashboard;
