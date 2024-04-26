// ==UserScript==
// @name         Fencing Event Competitor Info Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Enhance the fencing event pages with interactive competitor data and dynamic content update.
// @author       Your Name
// @match        https://www.fencingtimelive.com/pools/scores/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const debugMode = true; // Set to false to disable debug banners

    // Initial UI elements for feedback, shown only if debug mode is enabled
    const banner = document.createElement('div');
    const consoleArea = document.createElement('div');
    if (debugMode) {
        banner.textContent = "The Fencing Event Competitor Info Enhancer Script is running...";
        banner.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background-color: #0f62fe; color: #fff; text-align: center; padding: 10px; z-index: 10000;';
        document.body.appendChild(banner);

        consoleArea.style.cssText = 'position: fixed; bottom: 0; left: 0; width: 100%; background-color: #3d3d3d; color: #fff; text-align: left; padding: 10px; font-family: monospace; z-index: 10000; overflow: auto; height: 100px;';
        document.body.appendChild(consoleArea);
    }

    // Extract the event ID from the URL
    const eventId = window.location.pathname.split('/')[3];
    const dataUrl = `https://www.fencingtimelive.com/events/competitors/data/${eventId}?sort=name`;

    // Fetch competitors data
    function fetchCompetitorsData() {
        if (debugMode) banner.textContent = "Fetching competitors' data...";
        GM_xmlhttpRequest({
            method: "GET",
            url: dataUrl,
            onload: function(response) {
                if (response.status_code === 200) {
                    const competitors = JSON.parse(response.responseText);
                    enhancePageWithCompetitorData(competitors);
                    if (debugMode) banner.textContent = "Data fetched and page enhanced.";
                } else {
                    if (debugMode) banner.textContent = "Failed to fetch data.";
                }
            }
        });
    }

    // Enhance the page by appending weapon rating to the poolAffil span
    function enhancePageWithCompetitorData(competitors) {
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const nameCell = row.querySelector('.poolCompName');
            if (nameCell) {
                const name = nameCell.textContent.trim();
                const competitor = competitors.find(comp => comp.name === name);
                if (competitor && competitor.weaponRating) {
                    const affilCell = row.querySelector('.poolAffil');
                    const weaponRatingSpan = document.createElement('span');
                    weaponRatingSpan.className = 'WeaponRating';
                    weaponRatingSpan.textContent = competitor.weaponRating;
                    affilCell.appendChild(document.createElement('br'));
                    affilCell.appendChild(weaponRatingSpan);
                }
            }
        });
        if (debugMode) {
            consoleArea.textContent = `Page enhancement complete. ${competitors.length} competitors processed.`;
        }
    }

    fetchCompetitorsData();
})();
