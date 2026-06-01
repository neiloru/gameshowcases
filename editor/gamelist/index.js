(function () {
    "use strict";

    let games = [];

    const gameListEl = document.getElementById("game-list");
    const gameCountEl = document.getElementById("game-count");
    const btnAddGame = document.getElementById("btn-add-game");
    const btnImport = document.getElementById("btn-import");
    const btnExport = document.getElementById("btn-export");
    const btnClear = document.getElementById("btn-clear");
    const importInput = document.getElementById("import-input");

    // ── Render ───────────────────────────────────────────────

    function render() {
        gameListEl.innerHTML = "";

        if (games.length === 0) {
            gameCountEl.textContent = "";
            gameListEl.innerHTML = `
                <div class="empty-state">
                    <p>No games yet</p>
                    <span>Click <strong>+ Add Game</strong> or <strong>Import JSON</strong> to get started.</span>
                </div>`;
            return;
        }

        gameCountEl.textContent = `${games.length} game${games.length !== 1 ? "s" : ""}`;

        games.forEach((game, gameIndex) => {
            const card = document.createElement("div");
            card.className = "game-card";

            // Header
            const header = document.createElement("div");
            header.className = "card-header";

            const number = document.createElement("span");
            number.className = "game-number";
            number.textContent = `#${gameIndex + 1}`;

            const actions = document.createElement("div");
            actions.className = "card-actions";

            const moveUpBtn = createButton("↑", "btn-secondary btn-small", () => {
                moveGame(gameIndex, -1);
            });
            const moveDownBtn = createButton("↓", "btn-secondary btn-small", () => {
                moveGame(gameIndex, 1);
            });
            const removeBtn = createButton("✕ Remove", "btn-danger btn-small", () => {
                games.splice(gameIndex, 1);
                render();
            });

            if (gameIndex === 0) moveUpBtn.disabled = true;
            if (gameIndex === games.length - 1) moveDownBtn.disabled = true;

            actions.append(moveUpBtn, moveDownBtn, removeBtn);
            header.append(number, actions);
            card.appendChild(header);

            // Fields
            card.appendChild(createField("Name", game.name, (val) => {
                game.name = val;
            }));
            card.appendChild(createField("Release Date", game.release_date, (val) => {
                game.release_date = val;
            }, "e.g. 2026, Q1 2027, TBA"));
            card.appendChild(createField("Trailer URL", game.trailer, (val) => {
                game.trailer = val;
            }, "https://..."));

            // Platforms
            const platformsSection = document.createElement("div");
            platformsSection.className = "platforms-section";

            const sectionHeader = document.createElement("div");
            sectionHeader.className = "section-header";

            const sectionTitle = document.createElement("h4");
            sectionTitle.textContent = "Platforms";

            const addPlatformBtn = createButton("+ Platform", "btn-primary btn-small", () => {
                game.platforms.push({ platform: "", store: "" });
                render();
            });

            sectionHeader.append(sectionTitle, addPlatformBtn);
            platformsSection.appendChild(sectionHeader);

            game.platforms.forEach((plat, platIndex) => {
                const entry = document.createElement("div");
                entry.className = "platform-entry";

                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.placeholder = "Platform name";
                nameInput.value = plat.platform;
                nameInput.addEventListener("input", (e) => {
                    plat.platform = e.target.value;
                });

                const storeInput = document.createElement("input");
                storeInput.type = "text";
                storeInput.placeholder = "Store URL";
                storeInput.value = plat.store;
                storeInput.addEventListener("input", (e) => {
                    plat.store = e.target.value;
                });

                const removePlatBtn = createButton("✕", "btn-danger btn-small", () => {
                    game.platforms.splice(platIndex, 1);
                    render();
                });

                entry.append(nameInput, storeInput, removePlatBtn);
                platformsSection.appendChild(entry);
            });

            card.appendChild(platformsSection);
            gameListEl.appendChild(card);
        });
    }

    // ── Helpers ──────────────────────────────────────────────

    function createButton(text, className, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = className;
        btn.addEventListener("click", onClick);
        return btn;
    }

    function createField(label, value, onChange, placeholder) {
        const row = document.createElement("div");
        row.className = "form-row";

        const lbl = document.createElement("label");
        lbl.textContent = label;

        const input = document.createElement("input");
        input.type = "text";
        input.value = value || "";
        input.placeholder = placeholder || "";
        input.addEventListener("input", (e) => onChange(e.target.value));

        row.append(lbl, input);
        return row;
    }

    function moveGame(index, direction) {
        const target = index + direction;
        if (target < 0 || target >= games.length) return;
        [games[index], games[target]] = [games[target], games[index]];
        render();
    }

    function newGame() {
        return {
            name: "",
            release_date: "",
            trailer: "",
            platforms: []
        };
    }

    // ── Import / Export ──────────────────────────────────────

    function exportJSON() {
        const json = JSON.stringify(games, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "games.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) {
                    alert("Invalid format: JSON root must be an array.");
                    return;
                }
                // Normalize each entry
                games = data.map((item) => ({
                    name: item.name || "",
                    release_date: item.release_date || "",
                    trailer: item.trailer || "",
                    platforms: Array.isArray(item.platforms)
                        ? item.platforms.map((p) => ({
                            platform: p.platform || "",
                            store: p.store || ""
                        }))
                        : []
                }));
                render();
            } catch (err) {
                alert("Failed to parse JSON file.\n" + err.message);
            }
        };
        reader.readAsText(file);
    }

    // ── Events ───────────────────────────────────────────────

    btnAddGame.addEventListener("click", () => {
        games.push(newGame());
        render();
        // Scroll to the new card
        requestAnimationFrame(() => {
            gameListEl.lastElementChild.scrollIntoView({ behavior: "smooth" });
        });
    });

    btnImport.addEventListener("click", () => {
        importInput.click();
    });

    importInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            importJSON(e.target.files[0]);
        }
        importInput.value = "";
    });

    btnExport.addEventListener("click", exportJSON);

    btnClear.addEventListener("click", () => {
        if (games.length === 0) return;
        if (confirm("Are you sure you want to clear all games?")) {
            games = [];
            render();
        }
    });

    // ── Init ─────────────────────────────────────────────────

    render();
})();