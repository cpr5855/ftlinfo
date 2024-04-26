// ==UserScript==
// @name         FTL info
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Enhance the fencing event pages with interactive competitor data, debugging, event details, and structured tooltip display.
// @author       Your Name
// @match        https://www.fencingtimelive.com/pools/scores/*
// @match        https://www.fencingtimelive.com/pools/details/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @update URL https://github.com/cpr5855/ftlinfo/raw/main/FTL_info.user.js
// @downloadURL https://github.com/cpr5855/ftlinfo/raw/main/FTL_info.user.js
// ==/UserScript==

(function() {
    'use strict';

    const debugMode = false; // Toggle for debug mode


    // Initial CSS for tooltip
    GM_addStyle(`
        .poolCompName .tooltip {
            position: relative;
            display: inline-block;
            cursor: pointer;
            color: black !important; /* Ensure name visibility */
            opacity: 1;
            font-family: Roboto, sans-serif;
            font-size: 17.6px;
            line-height: 19.2px;
            text-size-adjust: 100%;
            font-weight: 700;
        }

        .poolCompName .tooltip .tooltiptext {
            visibility: hidden;
            width: 220px;
            background-color: black;
            color: white;
            text-align: left;
            border-radius: 6px;
            padding: 5px;
            position: absolute;
            z-index: 1000;
            bottom: 150%;
            left: 110%;
            margin-left: -110px;
            opacity: 0;
            transition: visibility 0.2s, opacity 0.2s ease-in-out !important;
        }

        .poolCompName .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1 !important;
        }
    `);

    // Extract the event ID and construct the data URL
    const eventId = window.location.pathname.split('/')[3];
    const dataUrl = `https://www.fencingtimelive.com/events/competitors/data/${eventId}?sort=name`;

    // Initial UI elements for feedback
        const banner = document.createElement('div');
        banner.textContent = `Script running: Event ID - ${eventId}, Fetching from - ${dataUrl}`;
        banner.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background-color: #0f62fe; color: #fff; text-align: center; padding: 10px; z-index: 10000;';
        document.body.appendChild(banner);
    const consoleArea = document.createElement('div');
    consoleArea.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background-color: #3d3d3d; color: #fff; text-align: left; padding: 10px; font-family: monospace; z-index: 10000; overflow: auto; height: 100px;';
    document.body.appendChild(consoleArea);

    // Fetch competitors data
    function fetchCompetitorsData() {
        banner.textContent = `Fetching competitors' data from ${dataUrl}...`;
        GM_xmlhttpRequest({
            method: "GET",
            url: dataUrl,
            onload: function(response) {
                try {
                    const competitors = JSON.parse(response.responseText);
                    if (debugMode) {
                        console.log("Competitors JSON:", competitors);
                        consoleArea.textContent = `Fetched JSON data: ${JSON.stringify(competitors, null, 2)}\n`;
                    }
                    banner.textContent = `Data fetched from ${dataUrl}. Enhancing page...`;
                    enhancePageWithCompetitorLinks(competitors);
                } catch (e) {
                    banner.textContent = `Error parsing JSON data from ${dataUrl}.`;
                    consoleArea.textContent += "Error parsing JSON: " + e.message + "\n";
                }
            },
            onerror: function(error) {
                banner.textContent = `Failed to fetch data from ${dataUrl}.`;
                consoleArea.textContent += "Error fetching data: " + error + "\n";
            }
        });
    }

    // Enhance the page with links and tooltips
    function enhancePageWithCompetitorLinks(competitors) {
        const rows = document.querySelectorAll('table tbody tr.poolRow');
        let found = 0;
        let updated = 0;
        rows.forEach(row => {
            let nameCell = row.querySelector('.poolCompName');
            if (nameCell) {
                const name = nameCell.textContent.trim();
                const competitor = competitors.find(comp => comp.name === name);
                if (competitor) {
                    const tooltipText = `Name: ${competitor.name}<br>Club(s): ${competitor.clubNames}<br>Div: ${competitor.div}<br>Country: ${competitor.country}<br>Rating: ${competitor.weaponRating}`;
                    const tooltip = document.createElement('span');
                    tooltip.className = 'tooltiptext';
                    tooltip.innerHTML = tooltipText; // Use innerHTML to interpret the <br> tags
                    const link = document.createElement('a');
                    link.href = "#";
                    link.textContent = name;
                    link.className = 'tooltip';
                    link.appendChild(tooltip);
                    nameCell.innerHTML = '';
                    nameCell.appendChild(link);
                    updated++;
                }
                found++;
            }
        });
        consoleArea.textContent += `Total competitors found: ${found}\n`;
        consoleArea.textContent += `Competitors updated with links: ${updated}\n`;
        banner.textContent = `Page enhancement complete. Event ID - ${eventId}`;
    }

    fetchCompetitorsData();
})();
