// Import styles
import './style.css';

// the elements
const particle = document.getElementById("particle");
const ledge = document.getElementById("ledge");
const button = document.getElementById("launch");
const results = document.getElementById("results");
const pathContainer = document.getElementById("path");

const speedInput = document.getElementById("speed");
const speedRange = document.getElementById("speedRange");
const angleInput = document.getElementById("angle");
const angleRange = document.getElementById("angleRange");
const heightInput = document.getElementById("height");
const heightRange = document.getElementById("heightRange");

const gravity = -9.8;
const scale = 10; // meters to pixels
let animationId;
let isPolar = true;

// sync the sliders and textboxes
function sync(a, b) {
    a.addEventListener("input", () => b.value = a.value);
    b.addEventListener("input", () => a.value = b.value);
}

sync(speedRange, speedInput);
sync(angleRange, angleInput);
sync(heightRange, heightInput);

// the dynamic ledge
// used to ALSO reset the position of the particle
function updateLedge() {
    const h = Number(heightInput.value) * scale;
    ledge.style.height = h + "px";
    particle.style.bottom = h + "px";
    particle.style.left = "0px";
}

heightRange.addEventListener("input", updateLedge);
heightInput.addEventListener("input", updateLedge);
updateLedge();

// the launch
button.addEventListener("click", () => {
    cancelAnimationFrame(animationId);

    results.innerHTML = "";

    const v = Number(speedInput.value);
    const angleDeg = Number(angleInput.value);
    const y0 = Number(heightInput.value);

    if (isNaN(v) || isNaN(angleDeg)) return;

    particle.style.left = "0px";

    const theta = angleDeg * Math.PI / 180;
    let vx, vy;

    if (isPolar) {
        vx = v * Math.cos(theta);
        vy = v * Math.sin(theta);
    } else {
        vx = v;
        vy = angleDeg; // in component mode, angle input is actually vy
    }

    // max height
    const maxHeight = y0 + (vy * vy) / (-2 * gravity);

    // time to hit ground
    const disc = vy * vy - 2 * gravity * y0;
    const t1 = (-vy + Math.sqrt(disc)) / gravity;
    const t2 = (-vy - Math.sqrt(disc)) / gravity;
    const tFlight = Math.max(t1, t2);

    // horizontal range
    const range = vx * tFlight;

    results.innerHTML = `
        <div><strong>Max Height:</strong> ${maxHeight.toFixed(2)} m</div>
        <div><strong>Range:</strong> ${range.toFixed(2)} m</div>
      `;

    // animation loop
    let t = 0;
    const dt = 0.016;

    function animate() {
        t += dt;

        const x = vx * t;
        const y = y0 + vy * t + 0.5 * gravity * t * t;

        // Check if particle is still on the ledge (x within ledge width)
        const ledgeWidth = 12 / scale; // 12px ledge width in meters
        const groundLevel = (x <= ledgeWidth) ? y0 : 0;

        if (y >= groundLevel) {
            particle.style.left = x * scale + "px";
            particle.style.bottom = y * scale + "px";

            // Drop path marker
            const dot = document.createElement("div");
            dot.className = "absolute w-2 h-2 bg-blue-500 rounded-full z-0 opacity-30";
            dot.style.left = (x * scale + 24) + "px";
            dot.style.bottom = (y * scale + 24) + "px";
            pathContainer.appendChild(dot);

            animationId = requestAnimationFrame(animate);
        } else {
            particle.style.bottom = groundLevel * scale + "px";
        }
    }

    animate();
});

// reset button
document.getElementById("reset").addEventListener("click", () => {
    cancelAnimationFrame(animationId);
    results.innerHTML = "";
    pathContainer.innerHTML = "";
    updateLedge();
});

// toggle sidebar
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
const toggleIcon = document.getElementById("toggleIcon");
let sidebarOpen = true;

toggleBtn.addEventListener("click", () => {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
        sidebar.style.width = "18rem";
        sidebar.style.padding = "1rem";
        sidebar.style.opacity = "1";
        toggleIcon.style.transform = "rotate(0deg)";
    } else {
        sidebar.style.width = "0";
        sidebar.style.padding = "0";
        sidebar.style.opacity = "0";
        toggleIcon.style.transform = "rotate(180deg)";
    }
});

// toggle between polar and component mode
const toggleComponentsBtn = document.getElementById("toggleComponents");
const speedLabel = document.getElementById("speedLabel");
const angleLabel = document.getElementById("angleLabel");

toggleComponentsBtn.addEventListener("click", () => {
    const val1 = Number(speedInput.value);
    const val2 = Number(angleInput.value);

    if (isPolar) {
        // convert from polar to components
        const theta = val2 * Math.PI / 180;
        const vx = val1 * Math.cos(theta);
        const vy = val1 * Math.sin(theta);

        speedInput.value = vx.toFixed(2);
        speedRange.value = Math.min(50, Math.max(0, vx));
        angleInput.value = vy.toFixed(2);
        angleRange.value = Math.min(50, Math.max(0, vy));

        speedLabel.textContent = "Vx (m/s)";
        angleLabel.textContent = "Vy (m/s)";
        angleRange.min = 0;
        angleRange.max = 50;
        toggleComponentsBtn.textContent = "Switch to polar";
    } else {
        // convert from components to polar
        const vx = val1;
        const vy = val2;
        const speed = Math.sqrt(vx * vx + vy * vy);
        const angle = Math.atan2(vy, vx) * 180 / Math.PI;

        speedInput.value = speed.toFixed(2);
        speedRange.value = Math.min(50, Math.max(0, speed));
        angleInput.value = angle.toFixed(2);
        angleRange.value = Math.min(90, Math.max(0, angle));

        speedLabel.textContent = "Speed (m/s)";
        angleLabel.textContent = "Angle (°)";
        angleRange.min = 0;
        angleRange.max = 90;
        toggleComponentsBtn.textContent = "Switch to components";
    }

    isPolar = !isPolar;
});
