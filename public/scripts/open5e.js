
// Open5e integration for the D&D Character Creator.
// Keeps local SRD 5.2.1 data as the authority for character mechanics.
// Open5e content is supplemental; always verify the source document.

(function () {
    "use strict";

    const API = "https://api.open5e.com/v2";
    const DOCUMENT = "srd-2024";
    const MAX_PAGES = 20;
    const cache = {};

    // Load all pages of an Open5e collection.
    async function getCollection(category) {

        if (cache[category]) {
            return cache[category];
        }

        const allowed = [
            "species",
            "classes",
            "backgrounds",
            "spells",
            "feats"
        ];

        if (!allowed.includes(category)) {
            throw new Error(
                "Unsupported Open5e category: " + category
            );
        }

        let url =
            API + "/" + category +
            "/?document__key__in=" +
            encodeURIComponent(DOCUMENT);

        const items = [];
        let page = 0;

        while (url && page < MAX_PAGES) {

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    "Open5e returned HTTP " + response.status
                );
            }

            const body = await response.json();

            if (!Array.isArray(body.results)) {
                throw new Error(
                    "Unexpected Open5e response format"
                );
            }

            // Avoid mixing other editions or sources.
            for (const item of body.results) {

                const source = item.document;

                const sourceKey =
                    typeof source === "string"
                        ? source
                        : (source &&
                            (source.key || source.slug));

                if (!sourceKey || sourceKey === DOCUMENT) {
                    items.push(item);
                }
            }

            if (body.next) {

                const next = new URL(body.next, API);

                if (next.origin !== new URL(API).origin) {
                    throw new Error(
                        "Unexpected pagination URL"
                    );
                }

                url = next.href;

            } else {
                url = null;
            }

            page++;
        }

        if (url) {
            throw new Error(
                "Open5e pagination limit reached"
            );
        }

        cache[category] = items;

        return items;
    }

    // Find an API entry matching a selected name.
    function matchingItem(items, name) {

        const normalized =
            String(name).trim().toLowerCase();

        return items.find(function(item) {

            return String(item.name || "")
                .trim()
                .toLowerCase() === normalized;
        });
    }

    // Get a plain-text description from an entry.
    function safeDescription(item) {

        const keys = [
            "description",
            "desc",
            "summary"
        ];

        for (const key of keys) {

            if (
                typeof item[key] === "string" &&
                item[key].trim()
            ) {

                return item[key]
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            }
        }

        return "This entry has no plain-text " +
            "description in the API response.";
    }

    // Connect an Open5e collection to a dropdown.
    async function attachDetails(
        selectId,
        category,
        containerId
    ) {

        const select =
            document.getElementById(selectId);

        const container =
            document.getElementById(containerId);

        if (!select || !container) {
            return;
        }

        let items;

        try {

            container.textContent =
                "Loading Open5e " + category + "...";

            items = await getCollection(category);

            if (items.length === 0) {

                container.textContent =
                    "No matching 2024 SRD entries " +
                    "were returned by Open5e.";

                return;
            }

        } catch (error) {

            container.textContent =
                "Open5e unavailable. " +
                "Local SRD options still work.";

            console.warn(error);

            return;
        }

        // Update the displayed details.
        function update() {

            container.replaceChildren();

            if (!select.value) {

                container.textContent =
                    "Choose an option to view " +
                    "its Open5e details.";

                return;
            }

            const item = matchingItem(
                items,
                select.value
            );

            if (!item) {

                container.textContent =
                    "No matching Open5e entry for " +
                    select.value +
                    ". The local SRD option is still available.";

                return;
            }

            const title =
                document.createElement("h3");

            title.textContent = item.name;

            const description =
                document.createElement("p");

            description.textContent =
                safeDescription(item);

            container.append(
                title,
                description
            );
        }

        select.addEventListener(
            "change",
            update
        );

        update();
    }

    // Make functions available to other JS files.
    window.Open5e = {
        getCollection,
        matchingItem,
        attachDetails
    };

})();
