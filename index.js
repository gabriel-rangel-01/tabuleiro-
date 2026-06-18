const Engine = {
    turn: 0,

    camera: { x: 0, y: 0, zoom: 1, shake: 0 },

    nodes: [
        { x: 200, y: 300, type: "start" },
        { x: 400, y: 200, type: "benefit" },
        { x: 400, y: 400, type: "penalty" },
        { x: 600, y: 300, type: "event" },
        { x: 800, y: 200, type: "path" },
        { x: 800, y: 400, type: "path" },
        { x: 1000, y: 300, type: "star" },
        { x: 1200, y: 200, type: "event" },
        { x: 1200, y: 400, type: "benefit" },
        { x: 1400, y: 300, type: "start" }
    ],

    paths: {
        0: [1, 2],
        1: [3],
        2: [3],
        3: [4, 5],
        4: [6],
        5: [6],
        6: [7, 8],
        7: [9],
        8: [9]
    },

    players: [
        { name: "🟢 P1", pos: 0, coins: 0, stars: 0, isBot: false },
        { name: "🔵 P2", pos: 0, coins: 0, stars: 0, isBot: true },
        { name: "🟡 P3", pos: 0, coins: 0, stars: 0, isBot: true },
        { name: "🔴 P4", pos: 0, coins: 0, stars: 0, isBot: true }
    ]
};

/* =========================
   🔊 SOM SIMPLES (beep)
========================= */
function beep(freq = 400, time = 80) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), time);
}

/* =========================
   🎲 DADO MAIS “FÍSICO”
========================= */
function rollDice(cb) {
    let i = 0;

    const anim = setInterval(() => {
        document.getElementById("dice").innerText =
            "🎲 " + (Math.floor(Math.random() * 6) + 1);
        i++;

        if (i > 12) {
            clearInterval(anim);
            const final = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dice").innerText = "🎲 " + final;
            beep(600, 120);
            cb(final);
        }
    }, 50);
}

/* =========================
   🚶 MOVIMENTO SUAVE (ENGINE REAL)
========================= */
function movePlayer(p, steps, cb) {
    let i = 0;

    function step() {
        if (i >= steps) return cb();

        const options = Engine.paths[p.pos];

        if (!options) return cb();

        const next = options[Math.floor(Math.random() * options.length)];

        p.pos = next;

        updateCamera(p);
        render();

        beep(300 + Math.random() * 200);

        i++;
        setTimeout(step, 260);
    }

    step();
}

/* =========================
   🎥 CÂMERA AVANÇADA
========================= */
function updateCamera(p) {
    const n = Engine.nodes[p.pos];

    const targetX = -n.x + window.innerWidth / 2;
    const targetY = -n.y + window.innerHeight / 2;

    Engine.camera.x += (targetX - Engine.camera.x) * 0.08;
    Engine.camera.y += (targetY - Engine.camera.y) * 0.08;

    Engine.camera.shake *= 0.9;

    const shakeX = (Math.random() - 0.5) * Engine.camera.shake;
    const shakeY = (Math.random() - 0.5) * Engine.camera.shake;

    world.style.transform =
        `translate(${Engine.camera.x + shakeX}px, ${Engine.camera.y + shakeY}px) scale(${Engine.camera.zoom})`;
}

/* =========================
   🎮 TILE SYSTEM MELHORADO
========================= */
function applyTile(p) {
    const node = Engine.nodes[p.pos];

    switch (node.type) {
        case "benefit":
            p.coins += 3;
            Engine.camera.shake = 5;
            return "💚 benefício +3 moedas";

        case "penalty":
            p.coins -= 2;
            Engine.camera.shake = 8;
            return "💀 prejuízo -2 moedas";

        case "event":
            if (Math.random() < 0.5) {
                p.coins += 5;
                return "🎉 evento positivo +5";
            } else {
                p.pos = 0;
                return "🌀 voltou ao início";
            }

        case "star":
            if (p.coins >= 10) {
                p.stars++;
                p.coins -= 10;
                Engine.camera.zoom = 1.2;

                setTimeout(() => Engine.camera.zoom = 1, 400);

                return "⭐ estrela obtida!";
            }
            return "⭐ precisa 10 moedas";
    }

    return "";
}

/* =========================
   🧠 IA MELHORADA
========================= */
function botDecision(p) {
    const options = Engine.paths[p.pos];

    if (!options) return;

    // tenta escolher caminho melhor (simples AI)
    let best = options[0];

    for (let o of options) {
        const node = Engine.nodes[o];

        if (node.type === "star" && p.coins >= 10) {
            best = o;
        }
    }

    p.pos = best;
}

/* =========================
   🏆 WIN CHECK
========================= */
function checkWin(p) {
    return p.stars >= 3;
}

/* =========================
   🔁 TURN SYSTEM
========================= */
function nextTurn() {
    Engine.turn = (Engine.turn + 1) % Engine.players.length;

    const p = Engine.players[Engine.turn];

    if (p.isBot) {
        setTimeout(() => EngineRoll(), 700);
    }
}

/* =========================
   🎮 MAIN ENGINE ACTION
========================= */
function EngineRoll() {
    const p = Engine.players[Engine.turn];

    rollDice(d => {
        movePlayer(p, d, () => {

            const msg = applyTile(p);

            updateCamera(p);
            render();

            document.getElementById("info").innerHTML =
                Engine.players.map(x =>
                    `${x.name} ⭐${x.stars} 🪙${x.coins}`
                ).join("<br>");

            if (checkWin(p)) {
                document.getElementById("info").innerHTML =
                    "🏆 " + p.name + " VENCEU!";
                return;
            }

            nextTurn();
        });
    });
}

/* =========================
   🔗 EXPORT GLOBAL
========================= */
window.EngineRoll = EngineRoll;