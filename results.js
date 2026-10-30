/* =========================================================
   RESULTS PAGE — LEARN WITH ALTHAF
   SUMMARY + A/L RESULTS BOOK
   ========================================================= */


/* =========================================================
   GOOGLE SHEETS
   ========================================================= */

const SHEET_ID =
    "1wtrulC2FhlUtc7AWanZd1BMu7Nl4syHrsyQ7Cn45Juw";

const RESULTS_GID = "0";

const SUMMARY_GID = "534886672";


const RESULTS_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${RESULTS_GID}`;

const SUMMARY_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SUMMARY_GID}`;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadSummary();

    loadResultsBook();

});


/* =========================================================
   LOAD SUMMARY
   ========================================================= */

function loadSummary() {

    const summaryContainer =
        document.getElementById("results-summary");

    if (!summaryContainer) return;


    fetch(SUMMARY_URL)

        .then(response => response.text())

        .then(text => {

            const data = parseGoogleSheet(text);

            const table = data.table;

            const columns = table.cols;

            const rows = table.rows;


            /* ---------------------------------------------
               FIND COLUMNS
               --------------------------------------------- */

            const headers = columns.map((col, index) => {

                return {

                    index: index,

                    name:
                        (col.label || col.id || "")
                        .toString()
                        .trim()
                        .toLowerCase()

                };

            });


            function findColumn(possibleNames) {

                for (const possible of possibleNames) {

                    const found =
                        headers.find(
                            h => h.name === possible.toLowerCase()
                        );

                    if (found) return found.index;

                }

                return -1;

            }


            const YEAR_COL =
                findColumn([
                    "year",
                    "exam year",
                    "al year",
                    "a/l year"
                ]);


            const PASS_COL =
                findColumn([
                    "pass %",
                    "pass",
                    "pass rate"
                ]);


            const AB_COL =
                findColumn([
                    "a & b %",
                    "a&b %",
                    "a and b %",
                    "a & b"
                ]);


            const ZSCORE_COL =
                findColumn([
                    "2.0000+ %",
                    "2.0000+",
                    "2.0+",
                    "2.0% ",
                    "z-score 2.0000+",
                    "z score 2.0000+",
                    "zscore 2.0000+",
                    "z-score",
                    "z score",
                    "zscore"
                ]);


            const INFORMED_COL =
                findColumn([
                    "informed results",
                    "results informed",
                    "students informed",
                    "informed"
                ]);


            const SPECIAL_COL =
                findColumn([
                    "special list",
                    "special",
                    "special results",
                    "special achievements"
                ]);


            /* ---------------------------------------------
               GET CELL VALUE
               --------------------------------------------- */

            function getValue(row, columnIndex) {

                if (
                    columnIndex === -1 ||
                    !row.c ||
                    !row.c[columnIndex]
                ) {
                    return "";
                }

                const cell = row.c[columnIndex];

                if (
                    cell.v === null ||
                    cell.v === undefined
                ) {
                    return "";
                }

                return String(
                    cell.f !== undefined
                        ? cell.f
                        : cell.v
                ).trim();

            }


            /* ---------------------------------------------
               CREATE SUMMARY DATA
               --------------------------------------------- */

            const summaries = [];


            rows.forEach(row => {

                const year =
                    getValue(row, YEAR_COL);

                if (!year) return;


                summaries.push({

                    year: year,

                    pass:
                        getValue(row, PASS_COL),

                    ab:
                        getValue(row, AB_COL),

                    zscore:
                        getValue(row, ZSCORE_COL),

                    informed:
                        getValue(row, INFORMED_COL),

                    special:
                        getValue(row, SPECIAL_COL)

                });

            });


            if (!summaries.length) {

                summaryContainer.innerHTML =
                    `<div class="summary-loading">
                        No summary results found.
                    </div>`;

                return;

            }


            /* ---------------------------------------------
               SORT LATEST YEAR FIRST
               --------------------------------------------- */

            summaries.sort(
                (a, b) =>
                    getYearNumber(b.year) -
                    getYearNumber(a.year)
            );


            /* ---------------------------------------------
               LATEST YEAR
               --------------------------------------------- */

            const latest =
                summaries[0];


            const previousYears =
                summaries.slice(1);


            /* ---------------------------------------------
               BUILD FEATURED SUMMARY
               --------------------------------------------- */

            let html = `

                <div class="summary-featured">

                    <div class="summary-featured-top">

                        <div>

                            <div class="summary-featured-label">
                                G.C.E. ADVANCED LEVEL
                            </div>

                            <h2 class="summary-featured-year">
                                ${escapeHTML(latest.year)} A/L
                            </h2>

                        </div>

                        <div class="summary-header-right">

                            <div class="summary-latest-badge">
                                Latest Results
                            </div>

                            ${latest.informed ? `
                                <div class="summary-informed-small">
                                    ${escapeHTML(latest.informed)} informed
                                </div>
                            ` : ""}

                        </div>

                    </div>


                    <div class="summary-stat-grid">

                        ${createFeaturedStat(
                            latest.pass || "—",
                            "Pass Rate"
                        )}

                        ${createFeaturedStat(
                            latest.ab || "—",
                            "A & B"
                        )}

                        ${createFeaturedStat(
                            latest.zscore || "—",
                            "Z-Score 2.0000+"
                        )}

                    </div>


                    ${createSpecialAchievements(
                        latest.special
                    )}

                </div>

            `;


            /* ---------------------------------------------
               PREVIOUS YEARS
               --------------------------------------------- */

            if (previousYears.length) {

                html += `
                    <div class="summary-other-years">
                `;


                previousYears.forEach(yearData => {

                    html += createPreviousYearCard(
                        yearData
                    );

                });


                html += `
                    </div>
                `;

            }


            summaryContainer.innerHTML = html;

        })

        .catch(error => {

            console.error(
                "Summary Error:",
                error
            );

            summaryContainer.innerHTML =
                `<div class="summary-loading">
                    Unable to load results summary.
                </div>`;

        });

}


/* =========================================================
   FEATURED STAT
   ========================================================= */

function createFeaturedStat(value, label) {

    return `

        <div class="summary-stat">

            <span class="summary-stat-value">
                ${escapeHTML(value)}
            </span>

            <span class="summary-stat-label">
                ${escapeHTML(label)}
            </span>

        </div>

    `;

}


/* =========================================================
   PREVIOUS YEAR CARD
   ========================================================= */

function createPreviousYearCard(data) {

    return `

        <div class="summary-year-card">

            <div class="summary-year-card-top">

                <h3 class="summary-year-card-year">
                    ${escapeHTML(data.year)} A/L
                </h3>

                ${data.informed ? `
                    <span class="summary-small-informed-tag">
                        ${escapeHTML(data.informed)} informed
                    </span>
                ` : ""}

            </div>


            <div class="summary-small-stats">

                ${createSmallStat(
                    data.pass || "—",
                    "Pass Rate"
                )}

                ${createSmallStat(
                    data.ab || "—",
                    "A & B"
                )}

                ${createSmallStat(
                    data.zscore || "—",
                    "2.0000+"
                )}

            </div>


            ${createPreviousSpecial(
                data.special
            )}

        </div>

    `;

}


/* =========================================================
   SMALL STAT
   ========================================================= */

function createSmallStat(value, label) {

    return `

        <div class="summary-small-stat">

            <span class="summary-small-value">
                ${escapeHTML(value)}
            </span>

            <span class="summary-small-label">
                ${escapeHTML(label)}
            </span>

        </div>

    `;

}


/* =========================================================
   SPECIAL ACHIEVEMENTS — FEATURED
   ========================================================= */

function createSpecialAchievements(value) {

    const items =
        splitSpecialResults(value);


    if (!items.length) {

        return "";

    }


    return `

        <div class="summary-special">

            <div class="summary-special-heading">

                <span class="summary-star">
                    ★
                </span>

                <span>
                    Special Achievements
                </span>

            </div>


            <div class="summary-special-list">

                ${items.map(item => `

                    <span class="summary-special-item">
                        ${escapeHTML(item)}
                    </span>

                `).join("")}

            </div>

        </div>

    `;

}


/* =========================================================
   SPECIAL ACHIEVEMENTS — PREVIOUS YEARS
   ========================================================= */

function createPreviousSpecial(value) {

    const items =
        splitSpecialResults(value);


    if (!items.length) {

        return "";

    }


    return `

        <div class="summary-card-special">

            <span class="summary-card-special-label">
                ★ Special:
            </span>

            <span class="summary-card-special-list">

                ${items.map(item => `

                    <span class="summary-card-special-item">
                        ${escapeHTML(item)}
                    </span>

                `).join("")}

            </span>

        </div>

    `;

}


/* =========================================================
   SPLIT SPECIAL RESULTS
   ========================================================= */

function splitSpecialResults(value) {

    if (!value) return [];


    return String(value)

        .split(/\r?\n|;/)

        .map(item =>
            item
                .replace(/^\s*[-•*]\s*/, "")
                .trim()
        )

        .filter(item => item !== "");

}


/* =========================================================
   LOAD A/L RESULTS BOOK
   ========================================================= */

function loadResultsBook() {

    const resultsBook =
        document.getElementById("results-book");

    if (!resultsBook) return;


    resultsBook.innerHTML = `

        <div class="results-loading">
            Loading results...
        </div>

    `;


    fetch(RESULTS_URL)

        .then(response => response.text())

        .then(text => {

            const data =
                parseGoogleSheet(text);

            const table =
                data.table;

            const columns =
                table.cols;

            const rows =
                table.rows;


            /* ---------------------------------------------
               HEADERS
               --------------------------------------------- */

            const headers =
                columns.map((col, index) => {

                    return {

                        index: index,

                        name:
                            (col.label || col.id || "")
                            .toString()
                            .trim()
                            .toLowerCase()

                    };

                });


            function findColumn(possibleNames) {

                for (const possible of possibleNames) {

                    const found =
                        headers.find(
                            h =>
                                h.name ===
                                possible.toLowerCase()
                        );

                    if (found) {
                        return found.index;
                    }

                }

                return -1;

            }


            /* ---------------------------------------------
               COLUMN MAPPING
               --------------------------------------------- */

            const YEAR_COL =
                findColumn([
                    "year",
                    "exam year",
                    "al year",
                    "a/l year"
                ]);


            const NAME_COL =
                findColumn([
                    "name",
                    "student name",
                    "student",
                    "student's name"
                ]);


            const PHOTO_COL =
                findColumn([
                    "photo",
                    "picture",
                    "image",
                    "student photo",
                    "student image"
                ]);


            const SCHOOL_COL =
                findColumn([
                    "school",
                    "school name",
                    "school / college",
                    "school/college"
                ]);


            const ACCOUNTING_COL =
                findColumn([
                    "accounting",
                    "accounting grade",
                    "grade",
                    "result"
                ]);


            const ZSCORE_COL =
                findColumn([
                    "z-score",
                    "z score",
                    "zscore",
                    "z score value"
                ]);


            const DISTRICT_RANK_COL =
                findColumn([
                    "district rank",
                    "district ranking",
                    "district rank no"
                ]);


            const DISTRICT_COL =
                findColumn([
                    "district",
                    "district name"
                ]);


            const ISLAND_RANK_COL =
                findColumn([
                    "island rank",
                    "island ranking",
                    "island rank no",
                    "national rank"
                ]);


            const UNIVERSITY_COL =
                findColumn([
                    "university",
                    "university / institute",
                    "university/institute"
                ]);


            const CLUB_COL =
                findColumn([
                    "3a club",
                    "3a",
                    "club",
                    "3a club status",
                    "3a_club",
                    "3a-club",
                    "3a status"
                ]);


            /* ---------------------------------------------
               GET VALUE
               --------------------------------------------- */

            function getValue(row, columnIndex) {

                if (
                    columnIndex === -1 ||
                    !row.c ||
                    !row.c[columnIndex]
                ) {
                    return "";
                }


                const cell =
                    row.c[columnIndex];


                if (
                    cell.v === null ||
                    cell.v === undefined
                ) {
                    return "";
                }


                return String(
                    cell.f !== undefined
                        ? cell.f
                        : cell.v
                ).trim();

            }


            /* ---------------------------------------------
               IMAGE URL
               --------------------------------------------- */

            function getImageUrl(url) {

                if (!url) return "";

                url = String(url).trim();


                let match =
                    url.match(
                        /drive\.google\.com\/file\/d\/([^/]+)/
                    )
                    ||
                    url.match(
                        /drive\.google\.com\/.*[?&]id=([^&]+)/
                    );


                if (match) {

                    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`.trim();

                }


                return url;

            }


            /* ---------------------------------------------
               STUDENTS
               --------------------------------------------- */

            const students = [];


            rows.forEach(row => {

                const name =
                    getValue(row, NAME_COL);


                if (!name) return;


                students.push({

                    year:
                        getValue(row, YEAR_COL) ||
                        "Results",

                    name:
                        name,

                    photo:
                        getImageUrl(
                            getValue(row, PHOTO_COL)
                        ),

                    school:
                        getValue(row, SCHOOL_COL),

                    accounting:
                        getValue(row, ACCOUNTING_COL),

                    zscore:
                        getValue(row, ZSCORE_COL),

                    districtRank:
                        getValue(
                            row,
                            DISTRICT_RANK_COL
                        ),

                    district:
                        getValue(
                            row,
                            DISTRICT_COL
                        ),

                    islandRank:
                        getValue(
                            row,
                            ISLAND_RANK_COL
                        ),

                    university:
                        getValue(
                            row,
                            UNIVERSITY_COL
                        ),

                    club:
                        getValue(
                            row,
                            CLUB_COL
                        )

                });

            });


            if (!students.length) {

                resultsBook.innerHTML = `

                    <div class="results-error">
                        No results found.
                    </div>

                `;

                return;

            }


            /* ---------------------------------------------
               GROUP BY YEAR
               --------------------------------------------- */

            const grouped = {};


            students.forEach(student => {

                if (!grouped[student.year]) {

                    grouped[student.year] = [];

                }


                grouped[student.year].push(
                    student
                );

            });


            /* ---------------------------------------------
               LATEST YEAR FIRST
               --------------------------------------------- */

            const sortedYears =
                Object.keys(grouped)
                    .sort(
                        (a, b) =>
                            getYearNumber(b) -
                            getYearNumber(a)
                    );


            /* ---------------------------------------------
               BUILD HTML
               --------------------------------------------- */

            let html = "";


            sortedYears.forEach(year => {

                const yearStudents =
                    grouped[year];


                html += `

                    <div class="result-year">

                        <div
                            class="result-year-header"
                            onclick="toggleResultYear(this)"
                        >

                            <h2>
                                ${escapeHTML(year)} A/L
                            </h2>

                            <div class="result-year-arrow">
                                ▼
                            </div>

                        </div>


                        <div class="result-year-content">

                `;


                yearStudents.forEach(student => {

                    /* ---------------------------------
                       PHOTO
                       --------------------------------- */

                    const photoHTML =
                        student.photo

                            ?

                        `<img
                            class="student-photo"
                            src="${escapeHTML(student.photo)}"
                            alt="${escapeHTML(student.name)}"
                            loading="lazy"
                        >`

                            :

                        `<div class="student-photo-placeholder">
                            PHOTO
                        </div>`;


                    /* ---------------------------------
                       3A CLUB
                       --------------------------------- */

                    const rawClubVal =
                        (student.club || "")
                            .trim()
                            .toLowerCase();


                    const is3a =
                        rawClubVal !== "" &&
                        rawClubVal !== "-" &&
                        ![
                            "no",
                            "false",
                            "0",
                            "n/a",
                            "none"
                        ].includes(rawClubVal);


                    const clubHTML =
                        is3a

                            ?

                        `

                            <span class="badge-3a">

                                <span class="badge-3a-icon">
                                    3A
                                </span>

                                CLUB

                            </span>

                        `

                            :

                        "";


                    /* ---------------------------------
                       ACCOUNTING
                       --------------------------------- */

                    const accountingHTML = `

                        <span class="badge-accounting">

                            Accounting
                            ${escapeHTML(
                                student.accounting || "—"
                            )}

                        </span>

                    `;


                    /* ---------------------------------
                       STUDENT CARD
                       --------------------------------- */

                    html += `

                        <div class="student-card">

                            <div class="student-main">


                                <!-- LEFT -->

                                <div class="student-left">

                                    ${photoHTML}


                                    <div class="student-basic">

                                        <h3 class="student-name">
                                            ${escapeHTML(
                                                student.name
                                            )}
                                        </h3>


                                        <p class="student-school">
                                            ${escapeHTML(
                                                student.school || "—"
                                            )}
                                        </p>


                                        <div class="student-badges">

                                            ${clubHTML}

                                            ${accountingHTML}

                                        </div>

                                    </div>

                                </div>


                                <!-- RIGHT -->

                                <div class="student-right">


                                    <div class="result-item">

                                        <span class="result-label">
                                            Z-Score
                                        </span>

                                        <span class="result-value">
                                            ${escapeHTML(
                                                student.zscore || "—"
                                            )}
                                        </span>

                                    </div>


                                    <div class="result-item">

                                        <span class="result-label">
                                            District Rank
                                        </span>

                                        <span class="result-value">
                                            ${escapeHTML(
                                                student.districtRank || "—"
                                            )}
                                        </span>

                                    </div>


                                    <div class="result-item">

                                        <span class="result-label">
                                            District
                                        </span>

                                        <span class="result-value">
                                            ${escapeHTML(
                                                student.district || "—"
                                            )}
                                        </span>

                                    </div>


                                    <div class="result-item">

                                        <span class="result-label">
                                            Island Rank
                                        </span>

                                        <span class="result-value">
                                            ${escapeHTML(
                                                student.islandRank || "—"
                                            )}
                                        </span>

                                    </div>


                                    <div class="result-item">

                                        <span class="result-label">
                                            University
                                        </span>

                                        <span
                                            class="result-value"
                                            title="${escapeHTML(
                                                student.university || "—"
                                            )}"
                                        >
                                            ${escapeHTML(
                                                student.university || "—"
                                            )}
                                        </span>

                                    </div>


                                </div>

                            </div>

                        </div>

                    `;

                });


                html += `

                        </div>

                    </div>

                `;

            });


            resultsBook.innerHTML = html;

        })

        .catch(error => {

            console.error(
                "A/L Results Book Error:",
                error
            );


            resultsBook.innerHTML = `

                <div class="results-error">
                    Unable to load results.
                </div>

            `;

        });

}


/* =========================================================
   TOGGLE YEAR
   ========================================================= */

function toggleResultYear(header) {

    const section =
        header.closest(".result-year");


    if (!section) return;


    const isOpen =
        section.classList.contains("open");


    /* Close all other years */

    document
        .querySelectorAll(".result-year.open")
        .forEach(otherSection => {

            if (otherSection !== section) {

                otherSection.classList.remove("open");

            }

        });


    /* Open / close selected */

    if (isOpen) {

        section.classList.remove("open");

    } else {

        section.classList.add("open");

    }

}


window.toggleResultYear =
    toggleResultYear;


/* =========================================================
   GOOGLE SHEET JSON PARSER
   ========================================================= */

function parseGoogleSheet(text) {

    const jsonText =
        text
            .replace(/^[^(]*\(/, "") .replace(/\);?\s*$/, "");


    return JSON.parse(jsonText);

}


/* =========================================================
   YEAR NUMBER
   ========================================================= */

function getYearNumber(year) {

    const match =
        String(year).match(/\d{4}/);


    return match
        ? parseInt(match[0], 10)
        : 0;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}