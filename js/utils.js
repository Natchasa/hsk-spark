/**
 * HSK Spark 2.0 - Utility Helper Functions
 */
const HSKUtils = {
    /**
     * Fisher-Yates shuffle algorithm to uniformly shuffle an array
     * @param {Array} array 
     * @returns {Array} Shuffled shallow copy of array
     */
    shuffle: function(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    /**
     * Safely escape HTML to prevent XSS injection in dynamic innerHTML inserts
     * @param {string} text 
     * @returns {string} Escaped text
     */
    escapeHTML: function(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    },

    /**
     * Generate an array of numbers from start to end (inclusive)
     * @param {number} start 
     * @param {number} end 
     * @returns {Array<number>}
     */
    range: function(start, end) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },

    /**
     * Get level identifier string (e.g. 'hsk1')
     * @param {number|string} lvl 
     * @returns {string}
     */
    getLevelKey: function(lvl) {
        return `hsk${lvl}`;
    },

    /**
     * Open a print-optimized popup window for A4 PDF export of the vocabulary database
     * @param {number} level 
     */
    printVocabulary: function(level) {
        const vocabDb = window.HSK_DATA.vocabulary['hsk' + level] || [];
        if (vocabDb.length === 0) {
            alert('ไม่พบข้อมูลคำศัพท์ระดับ HSK ' + level);
            return;
        }
        
        // Sort alphabetically by pinyin
        const sorted = [...vocabDb].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('กรุณาอนุญาตให้เบราว์เซอร์แสดงป็อปอัป (Allow Popups) เพื่อพิมพ์เอกสาร');
            return;
        }
        
        let tablesHTML = '';
        const chunkSize = 25;
        const totalPages = Math.ceil(sorted.length / chunkSize);
        
        for (let i = 0; i < sorted.length; i += chunkSize) {
            const chunk = sorted.slice(i, i + chunkSize);
            let rowsHTML = '';
            
            chunk.forEach((word, idx) => {
                const globalIdx = i + idx + 1;
                rowsHTML += `
                    <tr style="height: 8.8mm; box-sizing: border-box;">
                        <td style="text-align: center; width: 6%; font-size: 8.5pt;">${globalIdx}</td>
                        <td class="zh-char" style="width: 22%; font-size: 13pt; font-weight: bold; font-family: 'Noto Sans SC', sans-serif;">${word.word}</td>
                        <td class="pinyin-text" style="width: 24%; font-size: 9.5pt; font-family: 'Inter', sans-serif; font-style: italic;">${word.pinyin}</td>
                        <td style="width: 13%; font-size: 8pt; color: #4a5568;">${word.pos}</td>
                        <td style="width: 35%; font-size: 9pt; font-family: 'Noto Sans Thai', sans-serif;">${word.thai}</td>
                    </tr>
                `;
            });
            
            const isLast = (i + chunkSize) >= sorted.length;
            const pageBreakStyle = isLast ? '' : 'page-break-after: always;';
            const currentPage = Math.floor(i / chunkSize) + 1;
            
            const pageHeaderHTML = (i === 0) ? `
                <div class="header" style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                    <h1 style="font-size: 18pt; margin: 0 0 4px 0; color: #1a202c; font-weight: 700;">บัญชีคำศัพท์ HSK ระดับ ${level}</h1>
                    <div class="subtitle" style="font-size: 9pt; color: #4a5568; margin: 0;">คำศัพท์ระบบใหม่ HSK 3.0 • ทั้งหมด ${vocabDb.length} คำ (หน้าละ 25 คำ) • หน้า ${currentPage} / ${totalPages}</div>
                </div>
            ` : `
                <div class="header-running" style="font-size: 8pt; color: #718096; margin-bottom: 8px; border-bottom: 1px solid #cbd5e0; padding-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>บัญชีคำศัพท์ HSK ระดับ ${level} (ต่อ)</span>
                    <span>หน้า ${currentPage} / ${totalPages}</span>
                </div>
            `;
            
            tablesHTML += `
                <div class="page-container" style="${pageBreakStyle}">
                    ${pageHeaderHTML}
                    <table style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 5px;">
                        <thead>
                            <tr style="height: 8.5mm; background-color: #f7fafc;">
                                <th style="text-align: center; width: 6%; border-bottom: 2px solid #cbd5e0; font-size: 9pt; padding: 4px 8px; font-weight: 700;">#</th>
                                <th style="width: 22%; border-bottom: 2px solid #cbd5e0; font-size: 9pt; padding: 4px 8px; font-weight: 700; text-align: left;">อักษรจีน</th>
                                <th style="width: 24%; border-bottom: 2px solid #cbd5e0; font-size: 9pt; padding: 4px 8px; font-weight: 700; text-align: left;">พินอิน</th>
                                <th style="width: 13%; border-bottom: 2px solid #cbd5e0; font-size: 9pt; padding: 4px 8px; font-weight: 700; text-align: left;">ประเภท</th>
                                <th style="width: 35%; border-bottom: 2px solid #cbd5e0; font-size: 9pt; padding: 4px 8px; font-weight: 700; text-align: left;">ความหมายภาษาไทย</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>HSK Level ${level} Vocabulary List</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        font-family: 'Inter', 'Noto Sans Thai', 'Noto Sans SC', sans-serif;
                        color: #1a1a1a;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-container {
                        padding: 15mm 15mm 15mm 15mm;
                        box-sizing: border-box;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    td {
                        border-bottom: 1px solid #e2e8f0;
                        padding: 2px 8px;
                        vertical-align: middle;
                    }
                    .footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 7.5pt;
                        color: #a0aec0;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 3px;
                    }
                </style>
            </head>
            <body>
                <div class="vocab-print-content">
                    ${tablesHTML}
                </div>
                
                <div class="footer">
                    ตารางคำศัพท์ระดับ HSK ${level} (หน้าละ 25 คำ) • HSK Spark 2.0
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 600);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    },

    /**
     * Open a print-optimized popup window for A4 PDF export of the grammar guide (Topics/explanations only)
     * @param {number} level 
     */
    printGrammar: function(level) {
        const grammarDb = window.HSK_DATA.grammar['hsk' + level] || [];
        if (grammarDb.length === 0) {
            alert('ไม่พบข้อมูลหลักไวยากรณ์ระดับ HSK ' + level);
            return;
        }
        
        // Sort by lesson then ID
        const sorted = [...grammarDb].sort((a, b) => (a.lesson - b.lesson) || a.id.localeCompare(b.id));
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('กรุณาอนุญาตให้เบราว์เซอร์แสดงป็อปอัป (Allow Popups) เพื่อพิมพ์เอกสาร');
            return;
        }
        
        let pagesHTML = '';
        const chunkSize = 5;
        const totalPages = Math.ceil(sorted.length / chunkSize);
        
        for (let i = 0; i < sorted.length; i += chunkSize) {
            const chunk = sorted.slice(i, i + chunkSize);
            let itemsHTML = '';
            
            chunk.forEach((g, idx) => {
                const globalIdx = i + idx + 1;
                const isLastItem = idx === chunk.length - 1;
                const borderStyle = isLastItem ? '' : 'border-bottom: 1px dashed #cbd5e0;';
                const paddingBottom = isLastItem ? '0' : '12px';
                const marginBottom = isLastItem ? '0' : '12px';
                
                itemsHTML += `
                    <div class="grammar-item" style="padding-bottom: ${paddingBottom}; margin-bottom: ${marginBottom}; ${borderStyle} box-sizing: border-box; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                            <h2 class="grammar-title" style="font-size: 11pt; font-weight: 700; margin: 0; color: #1a202c; font-family: 'Noto Sans Thai', sans-serif;">${globalIdx}. ${g.title}</h2>
                            <span class="grammar-lesson" style="font-size: 8pt; font-weight: 700; color: #e53e3e; background-color: #fff5f5; border: 1px solid #fed7d7; padding: 1px 5px; border-radius: 4px;">บทที่ ${g.lesson}</span>
                        </div>
                        
                        <div class="grammar-pattern-box" style="background-color: #f7fafc; border-left: 3px solid #e53e3e; padding: 6px 8px; margin-bottom: 6px; border-radius: 0 4px 4px 0;">
                            <div class="pattern-zh" style="font-weight: 700; font-size: 10.5pt; color: #2d3748; font-family: 'Noto Sans SC', sans-serif;">${g.pattern}</div>
                            <div class="pattern-th" style="font-size: 8pt; color: #718096; margin-top: 2px; font-family: 'Noto Sans Thai', sans-serif;">${g.patternThai}</div>
                        </div>
                        
                        <p class="explanation" style="font-size: 8.5pt; line-height: 1.4; margin: 0; color: #4a5568; font-family: 'Noto Sans Thai', sans-serif;">
                            ${g.explanation}
                        </p>
                    </div>
                `;
            });
            
            const isLastPage = (i + chunkSize) >= sorted.length;
            const pageBreakStyle = isLastPage ? '' : 'page-break-after: always;';
            const currentPage = Math.floor(i / chunkSize) + 1;
            
            const pageHeaderHTML = (i === 0) ? `
                <div class="header" style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                    <h1 style="font-size: 18pt; margin: 0 0 4px 0; color: #1a202c; font-weight: 700;">คู่มือสรุปหลักไวยากรณ์ HSK ระดับ ${level} (เฉพาะโครงสร้าง)</h1>
                    <div class="subtitle" style="font-size: 9pt; color: #4a5568; margin: 0;">หลักไวยากรณ์ระบบใหม่ HSK 3.0 • ทั้งหมด ${grammarDb.length} หัวข้อ (หน้าละ 5 หัวข้อ) • หน้า ${currentPage} / ${totalPages}</div>
                </div>
            ` : `
                <div class="header-running" style="font-size: 8pt; color: #718096; margin-bottom: 8px; border-bottom: 1px solid #cbd5e0; padding-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>คู่มือสรุปหลักไวยากรณ์ HSK ระดับ ${level} (ต่อ)</span>
                    <span>หน้า ${currentPage} / ${totalPages}</span>
                </div>
            `;
            
            pagesHTML += `
                <div class="page-container" style="${pageBreakStyle}">
                    ${pageHeaderHTML}
                    <div class="grammar-page-content">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        }
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>HSK Level ${level} Grammar Guide (Summary)</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        font-family: 'Inter', 'Noto Sans Thai', 'Noto Sans SC', sans-serif;
                        color: #1a1a1a;
                        background: #ffffff;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-container {
                        padding: 15mm 15mm 15mm 15mm;
                        box-sizing: border-box;
                    }
                    .footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 7.5pt;
                        color: #a0aec0;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 3px;
                    }
                </style>
            </head>
            <body>
                <div class="grammar-print-content">
                    ${pagesHTML}
                </div>
                
                <div class="footer">
                    คู่มือสรุปไวยากรณ์ระดับ HSK ${level} • HSK Spark 2.0
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 600);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }
};

// Bind to window for global access
window.HSKUtils = HSKUtils;
