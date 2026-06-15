/**
 * HSK Spark 2.0 - HSK Curriculum Planner Configuration
 * Maps HSK 1-4 levels into intensive study plans (Daily & Weekly splits)
 */

window.HSK_DATA = window.HSK_DATA || {};

window.HSK_DATA.curriculum = {
    // Week definitions for each HSK Level
    levels: {
        1: {
            title: "HSK Level 1 (หลักสูตรเร่งรัด 12 สัปดาห์)",
            totalWeeks: 12,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: การทักทายและการแนะนำตัวพื้นฐาน (บทที่ 1-2)", lessons: [1, 2] },
                2: { title: "สัปดาห์ที่ 2: ชีวิตประจำวันและสิ่งของรอบตัว (บทที่ 3-4)", lessons: [3, 4] },
                3: { title: "สัปดาห์ที่ 3: เวลา ครอบครัว และสถานที่ (บทที่ 5-6)", lessons: [5, 6] },
                4: { title: "สัปดาห์ที่ 4: การพูดคุยเรื่องอาชีพและประเทศ (บทที่ 7-8)", lessons: [7, 8] },
                5: { title: "สัปดาห์ที่ 5: การคมนาคม การเดินทาง และวันเวลา (บทที่ 9-10)", lessons: [9, 10] },
                6: { title: "สัปดาห์ที่ 6: การซื้อขายและตัวเลขราคา (บทที่ 11-12)", lessons: [11, 12] },
                7: { title: "สัปดาห์ที่ 7: กิจกรรมและการระบุตำแหน่ง (บทที่ 13-14)", lessons: [13, 14] },
                8: { title: "สัปดาห์ที่ 8: อาหารและเครื่องดื่มในชีวิตจริง (บทที่ 15-16)", lessons: [15, 16] },
                9: { title: "สัปดาห์ที่ 9: อารมณ์และความรู้สึกเบื้องต้น (บทที่ 17-18)", lessons: [17, 18] },
                10: { title: "สัปดาห์ที่ 10: สภาพอากาศและการแต่งตัว (บทที่ 19-20)", lessons: [19, 20] },
                11: { title: "สัปดาห์ที่ 11: การทำกิจกรรมและการใช้ทักษะ (บทที่ 21-22)", lessons: [21, 22] },
                12: { title: "สัปดาห์ที่ 12: การทบทวนคำศัพท์และไวยากรณ์ HSK 1 (บทที่ 23-24)", lessons: [23, 24] }
            }
        },
        2: {
            title: "HSK Level 2 (หลักสูตรเร่งรัด 10 สัปดาห์)",
            totalWeeks: 10,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: การแนะนำตัวเองและการคบค้าสมาคม (บทที่ 1-3)", lessons: [1, 2, 3] },
                2: { title: "สัปดาห์ที่ 2: ครอบครัวและการดำเนินชีวิตประจำวัน (บทที่ 4-6)", lessons: [4, 5, 6] },
                3: { title: "สัปดาห์ที่ 3: การทำงานและอาชีพต่าง ๆ (บทที่ 7-9)", lessons: [7, 8, 9] },
                4: { title: "สัปดาห์ที่ 4: การคมนาคมและการท่องเที่ยวเดินทาง (บทที่ 10-12)", lessons: [10, 11, 12] },
                5: { title: "สัปดาห์ที่ 5: อาหารการกินและร้านอาหาร (บทที่ 13-15)", lessons: [13, 14, 15] },
                6: { title: "สัปดาห์ที่ 6: สุขภาพและการออกกำลังกาย (บทที่ 16-18)", lessons: [16, 17, 18] },
                7: { title: "สัปดาห์ที่ 7: การเรียนและการสอบ (บทที่ 19-21)", lessons: [19, 20, 21] },
                8: { title: "สัปดาห์ที่ 8: กีฬาและงานอดิเรก (บทที่ 22-24)", lessons: [22, 23, 24] },
                9: { title: "สัปดาห์ที่ 9: สภาพแวดล้อมและสภาพอากาศ (บทที่ 25-27)", lessons: [25, 26, 27] },
                10: { title: "สัปดาห์ที่ 10: การเตรียมความพร้อมและจำลองข้อสอบ HSK 2 (บทที่ 28-30)", lessons: [28, 29, 30] }
            }
        },
        3: {
            title: "HSK Level 3 (หลักสูตรเร่งรัด 10 สัปดาห์)",
            totalWeeks: 10,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: การเรียนรู้ สภาพแวดล้อม และอารมณ์ (บทที่ 1-3)", lessons: [1, 2, 3] },
                2: { title: "สัปดาห์ที่ 2: การสื่อสารและการเดินทาง (บทที่ 4-6)", lessons: [4, 5, 6] },
                3: { title: "สัปดาห์ที่ 3: วัฒนธรรม กีฬา และการพักผ่อน (บทที่ 7-9)", lessons: [7, 8, 9] },
                4: { title: "สัปดาห์ที่ 4: เทคโนโลยี สังคม และเศรษฐกิจพื้นฐาน (บทที่ 10-12)", lessons: [10, 11, 12] },
                5: { title: "สัปดาห์ที่ 5: อาชีพการงานและการวางแผนอนาคต (บทที่ 13-15)", lessons: [13, 14, 15] },
                6: { title: "สัปดาห์ที่ 6: การแก้ไขปัญหา ชีวิตเมือง และทักษะชีวิต (บทที่ 16-18)", lessons: [16, 17, 18] },
                7: { title: "สัปดาห์ที่ 7: ธรรมชาติ วิทยาศาสตร์ และสื่อสารมวลชน (บทที่ 19-21)", lessons: [19, 20, 21] },
                8: { title: "สัปดาห์ที่ 8: สภาพการทำธุรกิจและการช้อปปิ้งออนไลน์ (บทที่ 22-24)", lessons: [22, 23, 24] },
                9: { title: "สัปดาห์ที่ 9: จิตวิทยาและความสัมพันธ์กับผู้คน (บทที่ 25-27)", lessons: [25, 26, 27] },
                10: { title: "สัปดาห์ที่ 10: การจำลองข้อสอบและทบทวนความรู้ HSK 3 (บทที่ 28-30)", lessons: [28, 29, 30] }
            }
        },
        4: {
            title: "HSK Level 4 (หลักสูตรเร่งรัด 10 สัปดาห์)",
            totalWeeks: 10,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: สัมพันธภาพและมิตรภาพ (บทที่ 1-3)", lessons: [1, 2, 3] },
                2: { title: "สัปดาห์ที่ 2: ชีวิตการเรียนและการพัฒนาตนเอง (บทที่ 4-6)", lessons: [4, 5, 6] },
                3: { title: "สัปดาห์ที่ 3: สุขภาพและการใช้ชีวิตในสังคม (บทที่ 7-9)", lessons: [7, 8, 9] },
                4: { title: "สัปดาห์ที่ 4: งานช้อปปิ้งและการบริหารเงิน (บทที่ 10-12)", lessons: [10, 11, 12] },
                5: { title: "สัปดาห์ที่ 5: ภูมิอากาศ การท่องเที่ยว และธรรมชาติ (บทที่ 13-15)", lessons: [13, 14, 15] },
                6: { title: "สัปดาห์ที่ 6: อาชีพ สังคมการทำงาน และโอกาส (บทที่ 16-18)", lessons: [16, 17, 18] },
                7: { title: "สัปดาห์ที่ 7: การศึกษา ปรัชญา และวัฒนธรรม (บทที่ 19-21)", lessons: [19, 20, 21] },
                8: { title: "สัปดาห์ที่ 8: เทคโนโลยีและการสื่อสารยุคใหม่ (บทที่ 22-24)", lessons: [22, 23, 24] },
                9: { title: "สัปดาห์ที่ 9: ปัญหาสังคมและการปรับตัวข้ามวัฒนธรรม (บทที่ 25-27)", lessons: [25, 26, 27] },
                10: { title: "สัปดาห์ที่ 10: ความสำเร็จ บทสรุป และการจำลองข้อสอบ HSK 4 (บทที่ 28-30)", lessons: [28, 29, 30] }
            }
        },
        5: {
            title: "HSK Level 5 (หลักสูตรเร่งรัด 12 สัปดาห์)",
            totalWeeks: 12,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: การแลกเปลี่ยนความคิดเห็นระดับกลาง-สูง (บทที่ 1-3)", lessons: [1, 2, 3] },
                2: { title: "สัปดาห์ที่ 2: ความคิดและมุมมองเชิงสังคม (บทที่ 4-6)", lessons: [4, 5, 6] },
                3: { title: "สัปดาห์ที่ 3: ความสัมพันธ์และการทำงานร่วมกัน (บทที่ 7-9)", lessons: [7, 8, 9] },
                4: { title: "สัปดาห์ที่ 4: สภาพแวดล้อมและการดำรงชีวิต (บทที่ 10-12)", lessons: [10, 11, 12] },
                5: { title: "สัปดาห์ที่ 5: ศิลปวัฒนธรรมและความคิดสร้างสรรค์ (บทที่ 13-15)", lessons: [13, 14, 15] },
                6: { title: "สัปดาห์ที่ 6: การอภิปรายประเด็นสังคมและข่าวสาร (บทที่ 16-18)", lessons: [16, 17, 18] },
                7: { title: "สัปดาห์ที่ 7: ธุรกิจและการเจรจาระดับสูง (บทที่ 19-21)", lessons: [19, 20, 21] },
                8: { title: "สัปดาห์ที่ 8: กฎหมายและจริยธรรมเชิงสังคม (บทที่ 22-24)", lessons: [22, 23, 24] },
                9: { title: "สัปดาห์ที่ 9: วิทยาศาสตร์ เทคโนโลยี และนวัตกรรม (บทที่ 25-27)", lessons: [25, 26, 27] },
                10: { title: "สัปดาห์ที่ 10: การวิเคราะห์ข้อมูลและการคิดเชิงตรรกะ (บทที่ 28-30)", lessons: [28, 29, 30] },
                11: { title: "สัปดาห์ที่ 11: ปรัชญาและจิตวิทยาประยุกต์ (บทที่ 31-33)", lessons: [31, 32, 33] },
                12: { title: "สัปดาห์ที่ 12: สรุปความรู้รอบตัวและการจำลองสอบ (บทที่ 34-36)", lessons: [34, 35, 36] }
            }
        },
        6: {
            title: "HSK Level 6 (หลักสูตรเร่งรัด 12 สัปดาห์)",
            totalWeeks: 12,
            weeks: {
                1: { title: "สัปดาห์ที่ 1: วารสารศาสตร์และการแสดงวิสัยทัศน์ (บทที่ 1-3)", lessons: [1, 2, 3] },
                2: { title: "สัปดาห์ที่ 2: วรรณกรรมและประวัติศาสตร์ระดับสูง (บทที่ 4-6)", lessons: [4, 5, 6] },
                3: { title: "สัปดาห์ที่ 3: การเมืองระหว่างประเทศและการทูต (บทที่ 7-9)", lessons: [7, 8, 9] },
                4: { title: "สัปดาห์ที่ 4: การเงิน การวิจัยตลาด และเศรษฐกิจเชิงลึก (บทที่ 10-12)", lessons: [10, 11, 12] },
                5: { title: "สัปดาห์ที่ 5: นิเวศวิทยาและการพัฒนาที่ยั่งยืน (บทที่ 13-15)", lessons: [13, 14, 15] },
                6: { title: "สัปดาห์ที่ 6: การประเมินคุณภาพและมาตรฐานสากล (บทที่ 16-18)", lessons: [16, 17, 18] },
                7: { title: "สัปดาห์ที่ 7: วิศวกรรมศาสตร์ การผลิต และความปลอดภัย (บทที่ 19-21)", lessons: [19, 20, 21] },
                8: { title: "สัปดาห์ที่ 8: สิทธิมนุษยชนและการศึกษาเชิงเปรียบเทียบ (บทที่ 22-24)", lessons: [22, 23, 24] },
                9: { title: "สัปดาห์ที่ 9: ปรากฏการณ์ทางสังคมและการพยากรณ์อนาคต (บทที่ 25-27)", lessons: [25, 26, 27] },
                10: { title: "สัปดาห์ที่ 10: วาทศิลป์และการเจรจาข้ามวัฒนธรรม (บทที่ 28-30)", lessons: [28, 29, 30] },
                11: { title: "สัปดาห์ที่ 11: ศิลปะการป้องกันตัวและจิตวิญญาณแห่งตะวันออก (บทที่ 31-33)", lessons: [31, 32, 33] },
                12: { title: "สัปดาห์ที่ 12: การทดสอบระดับความเข้าใจสูงสุด (บทที่ 34-36)", lessons: [34, 35, 36] }
            }
        }
    },

    /**
     * Dynamically generates the 7-day study plan details for a selected HSK level and week
     * @param {number} level 
     * @param {number} week 
     * @returns {Array} List of 7 day configuration objects
     */
    getPlannerConfig: function(level, week) {
        const lvlKey = `hsk${level}`;
        const levelConfig = this.levels[level];
        if (!levelConfig || !levelConfig.weeks[week]) return [];

        const weekInfo = levelConfig.weeks[week];
        const lessons = weekInfo.lessons;
        
        // Fetch all vocabulary and grammar for these lessons from the database (in real-time)
        const vocabDb = window.HSK_DATA.vocabulary[lvlKey] || [];
        const grammarDb = window.HSK_DATA.grammar[lvlKey] || [];

        const weekVocab = vocabDb.filter(w => lessons.includes(w.lesson));
        const weekGrammar = grammarDb.filter(g => lessons.includes(g.lesson));

        // Distribute vocabulary and grammar across 7 days
        const days = [];
        const vocabPerDay = Math.ceil(weekVocab.length / 5); // Spread vocabulary over Day 1-5

        for (let day = 1; day <= 7; day++) {
            const dayTasks = [];
            let dayTip = "";
            let dayTitle = "";

            if (day <= 5) {
                // Learning days
                const startIdx = (day - 1) * vocabPerDay;
                const endIdx = Math.min(startIdx + vocabPerDay, weekVocab.length);
                const dayWords = weekVocab.slice(startIdx, endIdx);
                const dayGrammars = weekGrammar.filter((_, idx) => idx % 5 === (day - 1) % weekGrammar.length || (weekGrammar.length <= 5 && idx === day - 1));

                dayTitle = `วันที่ ${day} — เรียนรู้บทเรียนใหม่`;
                
                if (dayWords.length > 0) {
                    dayTasks.push({
                        type: 'vocab',
                        label: `เรียนคำศัพท์ใหม่ ${dayWords.length} คำ (บทที่ ${lessons.join(', ')})`,
                        wordIds: dayWords.map(w => w.id)
                    });
                }
                
                dayGrammars.forEach(g => {
                    dayTasks.push({
                        type: 'grammar',
                        label: `หลักไวยากรณ์: ${g.title}`,
                        grammarId: g.id
                    });
                    dayTasks.push({
                        type: 'grammar_exercise',
                        label: `แบบฝึกหัดไวยากรณ์ (${g.title})`,
                        grammarId: g.id
                    });
                });

                dayTasks.push({
                    type: 'quiz_daily',
                    label: `แบบทดสอบคำศัพท์ประจำวัน`
                });

                dayTip = dayWords.length > 0 
                    ? `พยายามฝึกอ่านเสียงพินอินและเปิดฝาตัวจีนดูความหมาย สวดออกเสียงดังๆ เพื่อช่วยจำคำว่า "${dayWords[0].word}"`
                    : "ทบทวนบทเรียนวันนี้และทำแบบฝึกหัดอย่างละเอียด";
            } else if (day === 6) {
                // Weekly Review
                dayTitle = `วันที่ 6 — ทบทวนและควิซใหญ่`;
                dayTasks.push({
                    type: 'review_all',
                    label: `ทบทวนคำศัพท์และไวยากรณ์ประจำสัปดาห์ (${weekVocab.length} คำ)`
                });
                dayTasks.push({
                    type: 'quiz_weekly',
                    label: `🏆 แบบทดสอบประจำสัปดาห์ (ต้องได้ >= 80% เพื่อผ่าน)`
                });
                dayTip = "สัปดาห์นี้เรียนไวยากรณ์และคำศัพท์ใหม่ๆ มาเยอะมาก ลองจับกลุ่มคำศัพท์ที่คล้ายกันมาเปรียบเทียบดู";
            } else {
                // Rest & Weakness Polish
                dayTitle = `วันที่ 7 — พักผ่อนและวิเคราะห์จุดอ่อน`;
                dayTasks.push({
                    type: 'polish_weakness',
                    label: `ฝึกฝนเพิ่มเติมตามคำแนะนำ AI ของระบบ`
                });
                dayTip = "ผ่อนคลายและประเมินผลการเรียน วันนี้ไม่มีแบบทดสอบบังคับ ลองฝึกแต่งประโยคสั้นๆ ในใจ!";
            }

            days.push({
                dayIndex: day,
                title: dayTitle,
                tasks: dayTasks,
                tip: dayTip,
                estimatedMinutes: day <= 5 ? 40 : (day === 6 ? 50 : 20)
            });
        }

        return days;
    }
};
