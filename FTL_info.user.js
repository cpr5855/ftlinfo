// ==UserScript==
// @name         FTL rating info
// @namespace    http://digitaldumptser.net/
// @version      1.5
// @description  Enhance the fencing event pages with interactive competitor data, debugging, event details, and reliable tooltip display.
// @author       Your Name
// @match        https://www.fencingtimelive.com/pools/scores/*
// @match        https://www.fencingtimelive.com/pools/details/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const debugMode = false; // Toggle for debug mode

    // Initial UI elements for feedback
    const banner = document.createElement('div');
    banner.textContent = 'Initializing...';
    banner.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background-color: #0f62fe; color: #fff; text-align: center; padding: 10px; z-index: 10000; display: none;';
    document.body.appendChild(banner);

    const consoleArea = document.createElement('div');
    consoleArea.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background-color: #3d3d3d; color: #fff; text-align: left; padding: 10px; font-family: monospace; z-index: 10000; overflow: auto; height: 100px; display: none;';
    document.body.appendChild(consoleArea);

    if (debugMode) {
        banner.style.display = 'block';
        consoleArea.style.display = 'block';
    }

    // Extract the event ID and construct the data URL
    const eventId = window.location.pathname.split('/')[3];
    const dataUrl = `https://www.fencingtimelive.com/events/competitors/data/${eventId}?sort=name`;

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
                    nameCell.textContent = `${name} | ${competitor.weaponRating}`;
                    updated++;
                }
                found++;
            }
        });
        if (debugMode) {
            consoleArea.textContent += `Total competitors found: ${found}\n`;
            consoleArea.textContent += `Competitors updated with ratings: ${updated}\n`;
            banner.textContent = `Page enhancement complete. Event ID - ${eventId}`;
        }
    }

    fetchCompetitorsData();
})();
