(function () {

    const SHEET_ID = "1wtrulC2FhlUtc7AWanZd1BMu7Nl4syHrsyQ7Cn45Juw";
    const SHEET_GID = "76925690";

    const sheetURL =
        "https://docs.google.com/spreadsheets/d/" +
        SHEET_ID +
        "/gviz/tq?tqx=out:json&gid=" +
        SHEET_GID;

    const loading = document.getElementById("tt-loading");
    const programs = document.getElementById("tt-programs");


    /* =========================================
       GET GOOGLE SHEET DATA
    ========================================= */

    fetch(sheetURL)
        .then(function (response) {
            return response.text();
        })

        .then(function (text) {

            const start = text.indexOf("{");
            const end = text.lastIndexOf("}");

            if (start === -1 || end === -1) {
                throw new Error("Invalid Google Sheet response");
            }

            const json = JSON.parse(
                text.substring(start, end + 1)
            );

            const rows = json.table.rows || [];


            const data = rows.map(function (row) {

                const cells = row.c || [];


                function get(index) {

                    return cells[index] &&
                        cells[index].v != null
                        ? String(cells[index].v).trim()
                        : "";

                }


                return {

                    program: get(0),

                    location: get(1),

                    locationLink: get(2),

                    dayTime: get(3),

                    fee1: get(4),

                    fee2: get(5),

                    admission: get(6),

                    currentUnit: get(7),

                    progress: get(8)

                };

            });


            renderTimetable(data);

        })


        .catch(function (error) {

            console.error(error);

            loading.innerHTML =
                "Unable to load timetable.";

        });



    /* =========================================
       RENDER TIMETABLE
    ========================================= */

    function renderTimetable(data) {

        loading.style.display = "none";


        if (!data.length) {

            programs.innerHTML =
                '<div class="tt-loading">No timetable available.</div>';

            return;

        }


        const grouped = {};


        data.forEach(function (item) {

            if (!item.program) return;


            if (!grouped[item.program]) {

                grouped[item.program] = [];

            }


            grouped[item.program].push(item);

        });



        Object.keys(grouped).forEach(function (programName) {


            const yearBox =
                document.createElement("div");

            yearBox.className = "tt-year";


            const header =
                document.createElement("div");

            header.className = "tt-year-header";


            const title =
                document.createElement("div");

            title.textContent = programName;


            const arrow =
                document.createElement("div");

            arrow.className = "tt-year-arrow";

            arrow.innerHTML = "▼";


            header.appendChild(title);

            header.appendChild(arrow);


            const content =
                document.createElement("div");

            content.className =
                "tt-year-content";


            grouped[programName].forEach(function (item) {

                content.appendChild(
                    createClassCard(item)
                );

            });


            yearBox.appendChild(header);

            yearBox.appendChild(content);

            programs.appendChild(yearBox);



            /* PROGRAM ACCORDION */

            header.addEventListener(
                "click",
                function () {

                    const isOpen =
                        yearBox.classList.contains("open");


                    document
                        .querySelectorAll(
                            "#tt-programs .tt-year"
                        )
                        .forEach(function (box) {

                            box.classList.remove("open");


                            const a =
                                box.querySelector(
                                    ".tt-year-arrow"
                                );


                            if (a) {

                                a.innerHTML = "▼";

                            }

                        });


                    if (!isOpen) {

                        yearBox.classList.add("open");

                        arrow.innerHTML = "▲";

                    }

                }
            );

        });

    }



    /* =========================================
       CREATE CLASS CARD
    ========================================= */

    function createClassCard(item) {


        const card =
            document.createElement("div");

        card.className = "tt-class";



        /* =========================================
           HEADER
        ========================================= */

        const header =
            document.createElement("div");

        header.className =
            "tt-class-header";


        const locationName =
            document.createElement("div");

        locationName.className =
            "tt-location-name";

        locationName.textContent =
            item.location;



        const right =
            document.createElement("div");

        right.className =
            "tt-header-right";


        const arrow =
            document.createElement("div");

        arrow.className =
            "tt-class-arrow";

        arrow.innerHTML = "▼";


        right.appendChild(arrow);

        header.appendChild(locationName);

        header.appendChild(right);



        /* =========================================
           CONTENT
        ========================================= */

        const content =
            document.createElement("div");

        content.className =
            "tt-class-content";



        /* =========================================
           LOCATION / LMS BUTTON
        ========================================= */

        if (item.locationLink) {


            const actionRow =
                document.createElement("div");

            actionRow.className =
                "tt-action-row";


            const locationButton =
                document.createElement("a");


            locationButton.className =
                "tt-location-btn";


            locationButton.href =
                item.locationLink;


            locationButton.target =
                "_blank";


            locationButton.rel =
                "noopener noreferrer";



            const locationLower =
                item.location.toLowerCase();


            const isOnline =
                locationLower.includes("online");



            if (isOnline) {

                locationButton.textContent =
                    "LMS Access →";

            }

            else {

                locationButton.textContent =
                    "View Location →";

            }



            actionRow.appendChild(
                locationButton
            );


            content.appendChild(
                actionRow
            );

        }



        /* =========================================
           DAY & TIME
        ========================================= */

        if (item.dayTime) {


            const detail =
                document.createElement("div");

            detail.className =
                "tt-detail";


            const label =
                document.createElement("div");

            label.className =
                "tt-detail-label";

            label.textContent =
                "Day & Time";


            const value =
                document.createElement("div");

            value.className =
                "tt-detail-value";

            value.textContent =
                item.dayTime;


            detail.appendChild(label);

            detail.appendChild(value);

            content.appendChild(detail);

        }



        /* =========================================
           FEES
        ========================================= */

        if (item.fee1 || item.fee2) {


            const fees =
                document.createElement("div");

            fees.className =
                "tt-fees";


            const label =
                document.createElement("div");

            label.className =
                "tt-fees-label";

            label.textContent =
                "Fees";


            const list =
                document.createElement("div");

            list.className =
                "tt-fees-list";



            if (
                item.fee1 &&
                item.fee1 !== "NA"
            ) {


                const fee1 =
                    document.createElement("div");


                fee1.className =
                    "tt-fee-line";


                fee1.textContent =
                    item.fee1;


                list.appendChild(fee1);

            }



            if (
                item.fee2 &&
                item.fee2 !== "NA"
            ) {


                const fee2 =
                    document.createElement("div");


                fee2.className =
                    "tt-fee-line";


                fee2.textContent =
                    item.fee2;


                list.appendChild(fee2);

            }



            fees.appendChild(label);

            fees.appendChild(list);

            content.appendChild(fees);

        }



        /* =========================================
           ADMISSION
        ========================================= */

        if (item.admission) {


            const admission =
                document.createElement("div");

            admission.className =
                "tt-admission";


            const label =
                document.createElement("div");

            label.className =
                "tt-admission-label";

            label.textContent =
                "Admission";


            const value =
                document.createElement("div");

            value.className =
                "tt-admission-value";

            value.textContent =
                item.admission;


            admission.appendChild(label);

            admission.appendChild(value);

            content.appendChild(admission);

        }



        /* =========================================
           CURRENT UNIT
        ========================================= */

        if (item.currentUnit) {


            const unit =
                document.createElement("div");

            unit.className =
                "tt-current-unit";


            const label =
                document.createElement("div");

            label.className =
                "tt-current-unit-label";

            label.textContent =
                "Current Unit";


            const value =
                document.createElement("div");

            value.className =
                "tt-current-unit-value";

            value.textContent =
                item.currentUnit;


            unit.appendChild(label);

            unit.appendChild(value);

            content.appendChild(unit);

        }



        /* =========================================
           COURSE PROGRESS
        ========================================= */

        const progress =
            parseProgress(item.progress);


        const progressBox =
            document.createElement("div");

        progressBox.className =
            "tt-progress";


        const progressTop =
            document.createElement("div");

        progressTop.className =
            "tt-progress-top";


        const progressLabel =
            document.createElement("div");

        progressLabel.className =
            "tt-progress-label";

        progressLabel.textContent =
            "COURSE PROGRESS";


        const progressValue =
            document.createElement("div");

        progressValue.className =
            "tt-progress-value";

        progressValue.textContent =
            progress + "%";


        progressTop.appendChild(
            progressLabel
        );

        progressTop.appendChild(
            progressValue
        );



        const track =
            document.createElement("div");

        track.className =
            "tt-progress-track";


        const fill =
            document.createElement("div");

        fill.className =
            "tt-progress-fill";


        fill.style.width =
            progress + "%";


        track.appendChild(fill);


        progressBox.appendChild(
            progressTop
        );

        progressBox.appendChild(
            track
        );


        content.appendChild(
            progressBox
        );



        /* =========================================
           ASSEMBLE
        ========================================= */

        card.appendChild(header);

        card.appendChild(content);



        /* =========================================
           CARD ACCORDION
        ========================================= */

        header.addEventListener(
            "click",
            function () {


                const isOpen =
                    card.classList.contains("open");


                card.classList.toggle("open");


                arrow.innerHTML =
                    isOpen ? "▼" : "▲";

            }
        );


        return card;

    }



    /* =========================================
       PROGRESS PARSER
    ========================================= */

    function parseProgress(value) {


        if (!value) return 0;


        let text =
            String(value)
                .trim()
                .replace("%", "");


        let number =
            parseFloat(text);


        if (isNaN(number)) return 0;


        if (
            number > 0 &&
            number <= 1
        ) {

            number = number * 100;

        }


        number =
            Math.max(
                0,
                Math.min(100, number)
            );


        return Math.round(
            number * 100
        ) / 100;

    }

})();