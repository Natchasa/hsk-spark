/**
 * HSK Spark 2.0 - App State Manager
 */
const HSKState = {
    // Default initial state
    data: {
        theme: 'dark',
        showPinyin: true,
        currentView: 'dashboard',
        currentLevel: 1, // HSK 1
        
        // Progress logs
        vocabStatuses: {},      // { wordId: 'studying' | 'mastered' }
        completedTasks: {},     // { 'hsk1_w1_d1_task0': true }
        completedDays: {},      // { 'hsk1_w1_d1': true }
        completedWeeks: {},     // { 'hsk1_w1': true }
        activeWeeks: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, // Current selected week per level
        
        // Quiz scores
        quizScores: {},         // { 'hsk1_w1_d1_daily': 4 }
        
        // Stats
        streak: 0,
        lastActiveDate: null,
        totalStudyMinutes: 0
    },

    listeners: [],

    /**
     * Subscribe to state change notifications
     * @param {Function} callback 
     */
    subscribe: function(callback) {
        this.listeners.push(callback);
    },

    /**
     * Notify all subscribers that state has changed
     */
    notify: function() {
        this.listeners.forEach(callback => callback(this.data));
    },

    /**
     * Load state from LocalStorage
     */
    load: function() {
        try {
            const saved = localStorage.getItem('hsk_spark_2_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Deep merge defaults to support backwards compatibility
                this.data = { ...this.data, ...parsed };
                // Ensure activeWeeks handles all keys
                this.data.activeWeeks = { ...{ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, ...parsed.activeWeeks };
            }
            this.checkStreak();
            this.checkAndAutoCompleteVocabTasks();
        } catch (e) {
            console.error("Failed to load local storage state:", e);
        }
    },

    /**
     * Save state to LocalStorage
     */
    save: function() {
        try {
            localStorage.setItem('hsk_spark_2_state', JSON.stringify(this.data));
            this.notify();
        } catch (e) {
            console.error("Failed to save state to local storage:", e);
        }
    },

    /**
     * Update a state property and save
     * @param {string} prop 
     * @param {*} value 
     */
    set: function(prop, value) {
        this.data[prop] = value;
        this.save();
    },

    /**
     * Set selected week for curriculum planner
     * @param {number} level 
     * @param {number} weekNum 
     */
    setActiveWeek: function(level, weekNum) {
        this.data.activeWeeks[level] = weekNum;
        this.save();
    },

    /**
     * Set a vocabulary word status
     * @param {string} wordId 
     * @param {'studying'|'mastered'} status 
     */
    setVocabStatus: function(wordId, status) {
        this.data.vocabStatuses[wordId] = status;
        this.checkAndAutoCompleteVocabTasks();
        this.save();
    },

    /**
     * Scan all curriculum vocabulary tasks and auto-complete them if all words are mastered
     */
    checkAndAutoCompleteVocabTasks: function() {
        if (!window.HSK_DATA || !window.HSK_DATA.curriculum) return;
        for (let lvl = 1; lvl <= 6; lvl++) {
            const curConfig = window.HSK_DATA.curriculum.levels[lvl];
            if (!curConfig) continue;

            for (let w = 1; w <= curConfig.totalWeeks; w++) {
                const dayPlans = window.HSK_DATA.curriculum.getPlannerConfig(lvl, w);
                dayPlans.forEach(day => {
                    const totalTasks = day.tasks.length;
                    const dayKey = `hsk${lvl}_w${w}_d${day.dayIndex}`;

                    day.tasks.forEach((task, idx) => {
                        if (task.type === 'vocab' && task.wordIds) {
                            const allMastered = task.wordIds.every(id => this.data.vocabStatuses[id] === 'mastered');
                            const taskKey = `${dayKey}_task${idx}`;
                            if (allMastered) {
                                if (!this.data.completedTasks[taskKey]) {
                                    this.data.completedTasks[taskKey] = true;
                                    
                                    // Recalculate day completed status
                                    let allDone = true;
                                    for (let i = 0; i < totalTasks; i++) {
                                        if (!this.data.completedTasks[`${dayKey}_task${i}`]) {
                                            allDone = false;
                                            break;
                                        }
                                    }
                                    this.data.completedDays[dayKey] = allDone;
                                }
                            }
                        }
                    });
                });
            }
        }
    },

    /**
     * Automatically complete planner tasks based on user activities
     * @param {string} taskType 
     * @param {Object} taskData 
     */
    markPlannerTaskComplete: function(taskType, taskData = {}) {
        const level = this.data.currentLevel;
        if (!window.HSK_DATA || !window.HSK_DATA.curriculum) return;
        const curConfig = window.HSK_DATA.curriculum.levels[level];
        if (!curConfig) return;
        
        for (let w = 1; w <= curConfig.totalWeeks; w++) {
            const dayPlans = window.HSK_DATA.curriculum.getPlannerConfig(level, w);
            dayPlans.forEach(day => {
                day.tasks.forEach((task, idx) => {
                    let match = false;
                    if (task.type === taskType) {
                        if (taskType === 'vocab') {
                            if (taskData.wordIds && taskData.wordIds.every(id => task.wordIds.includes(id))) {
                                match = true;
                            }
                        } else if (taskType === 'grammar' || taskType === 'grammar_exercise') {
                            if (task.grammarId === taskData.grammarId) {
                                match = true;
                            }
                        } else if (taskType === 'quiz_daily') {
                            if (taskData.dayIndex !== undefined && taskData.weekIndex !== undefined) {
                                if (day.dayIndex === taskData.dayIndex && w === taskData.weekIndex) {
                                    match = true;
                                }
                            } else if (taskData.dayIndex !== undefined) {
                                if (day.dayIndex === taskData.dayIndex && w === (this.data.activeWeeks[level] || 1)) {
                                    match = true;
                                }
                            } else {
                                match = true;
                            }
                        } else if (taskType === 'quiz_weekly' || taskType === 'polish_weakness' || taskType === 'review_all') {
                            if (taskData.weekIndex !== undefined) {
                                if (w === taskData.weekIndex) {
                                    match = true;
                                }
                            } else if (w === (this.data.activeWeeks[level] || 1)) {
                                match = true;
                            }
                        }
                    }
                    
                    if (match) {
                        const taskKey = `hsk${level}_w${w}_d${day.dayIndex}_task${idx}`;
                        this.data.completedTasks[taskKey] = true;
                        
                        // Re-check if all tasks for this day are done
                        const dayKey = `hsk${level}_w${w}_d${day.dayIndex}`;
                        let allDone = true;
                        for (let i = 0; i < day.tasks.length; i++) {
                            if (!this.data.completedTasks[`${dayKey}_task${i}`]) {
                                allDone = false;
                                break;
                            }
                        }
                        this.data.completedDays[dayKey] = allDone;
                    }
                });
            });
        }
        this.save();
    },

    /**
     * Complete (or toggle) a daily task and check if day is finished
     * @param {number} level
     * @param {number} week
     * @param {number} day
     * @param {number} taskIdx
     * @param {number} totalTasks  - total number of tasks for this day
     */
    completeTask: function(level, week, day, taskIdx, totalTasks) {
        const taskKey = `hsk${level}_w${week}_d${day}_task${taskIdx}`;
        const dayKey  = `hsk${level}_w${week}_d${day}`;

        // Toggle the task
        if (this.data.completedTasks[taskKey]) {
            delete this.data.completedTasks[taskKey];
        } else {
            this.data.completedTasks[taskKey] = true;
        }

        // Re-check if all tasks are done
        let allDone = true;
        for (let i = 0; i < totalTasks; i++) {
            if (!this.data.completedTasks[`${dayKey}_task${i}`]) {
                allDone = false;
                break;
            }
        }
        this.data.completedDays[dayKey] = allDone;
        this.save();
        return allDone;
    },

    /**
     * Check if all tasks for a day are completed
     * @param {number} level
     * @param {number} week
     * @param {number} day
     * @param {number} totalTasks
     * @returns {boolean}
     */
    isDayComplete: function(level, week, day, totalTasks) {
        const dayKey = `hsk${level}_w${week}_d${day}`;
        // Use cached completedDays if available, else compute
        if (this.data.completedDays[dayKey] !== undefined) {
            return this.data.completedDays[dayKey];
        }
        for (let i = 0; i < totalTasks; i++) {
            if (!this.data.completedTasks[`${dayKey}_task${i}`]) return false;
        }
        return totalTasks > 0;
    },

    /**
     * Set daily quiz score and check completion
     */
    setQuizScore: function(quizKey, score, passed) {
        this.data.quizScores[quizKey] = score;
        if (passed) {
            this.data.completedTasks[quizKey] = true;
        }
        this.save();
    },

    /**
     * Verify and update login streak
     */
    checkStreak: function() {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = this.data.lastActiveDate;
        
        if (!lastDate) {
            this.data.streak = 1;
            this.data.lastActiveDate = today;
        } else if (lastDate !== today) {
            const lastActive = new Date(lastDate);
            const current = new Date(today);
            const diffTime = Math.abs(current - lastActive);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                this.data.streak += 1;
            } else if (diffDays > 1) {
                this.data.streak = 1;
            }
            this.data.lastActiveDate = today;
        }
    },

    /**
     * Add study time in minutes
     * @param {number} mins 
     */
    addStudyTime: function(mins) {
        this.data.totalStudyMinutes += mins;
        this.save();
    }
};

window.HSKState = HState = HSKState;
