const overlay = document.getElementById('intro-overlay');
const enterBtn = document.getElementById('enter-btn');

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
overlay.appendChild(renderer.domElement);

// Block scrolling while intro is active
document.body.classList.add('intro-active');

// ========================================
// Create Dynamic Neural Network
// ========================================

const nodes = [];
const nodeCount = 80;

// Node Geometry & Material
const nodeGeometry = new THREE.IcosahedronGeometry(0.8, 1);
const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    transparent: true,
    opacity: 0.9
});

// Create nodes with individual properties
for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());

    // Random position in sphere
    const radius = 25 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    node.position.x = radius * Math.sin(phi) * Math.cos(theta);
    node.position.y = radius * Math.sin(phi) * Math.sin(theta);
    node.position.z = radius * Math.cos(phi);

    // Random scale
    const scale = 0.5 + Math.random() * 1.5;
    node.scale.set(scale, scale, scale);

    // Store animation properties
    node.userData = {
        rotationSpeedX: (Math.random() - 0.5) * 0.03,
        rotationSpeedY: (Math.random() - 0.5) * 0.03,
        floatSpeed: 0.5 + Math.random() * 1.5,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: node.position.y,
        pulseSpeed: 1 + Math.random() * 2,
        pulseOffset: Math.random() * Math.PI * 2
    };

    scene.add(node);
    nodes.push(node);
}

// ========================================
// Connection Lines Between Nodes
// ========================================

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff41,
    transparent: true,
    opacity: 0.15
});

const connections = [];
const maxDistance = 15;

// Create connections between nearby nodes
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].position.distanceTo(nodes[j].position);
        if (distance < maxDistance) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                nodes[i].position,
                nodes[j].position
            ]);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            line.userData = { nodeA: i, nodeB: j };
            scene.add(line);
            connections.push(line);
        }
    }
}

// ========================================
// Central Core (Glowing Sphere)
// ========================================

const coreGeometry = new THREE.IcosahedronGeometry(3, 2);
const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff41,
    wireframe: true,
    transparent: true,
    opacity: 0.4
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// ========================================
// Mouse Interaction
// ========================================

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// ========================================
// Resize Handler
// ========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========================================
// Animation Loop
// ========================================

let isEntering = false;
let time = 0;
let warpSpeed = 0;

function animate() {
    if (!overlay || overlay.style.display === 'none') return;

    requestAnimationFrame(animate);
    time += 0.016; // ~60fps

    // Camera follows mouse slightly
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Animate each node
    nodes.forEach((node, index) => {
        // Individual rotation
        node.rotation.x += node.userData.rotationSpeedX;
        node.rotation.y += node.userData.rotationSpeedY;

        // Floating motion
        node.position.y = node.userData.originalY +
            Math.sin(time * node.userData.floatSpeed + node.userData.floatOffset) * 2;

        // Pulse opacity
        const pulse = 0.5 + Math.sin(time * node.userData.pulseSpeed + node.userData.pulseOffset) * 0.4;
        node.material.opacity = pulse;
    });

    // Update connection lines
    connections.forEach(line => {
        const nodeA = nodes[line.userData.nodeA];
        const nodeB = nodes[line.userData.nodeB];
        const positions = line.geometry.attributes.position.array;
        positions[0] = nodeA.position.x;
        positions[1] = nodeA.position.y;
        positions[2] = nodeA.position.z;
        positions[3] = nodeB.position.x;
        positions[4] = nodeB.position.y;
        positions[5] = nodeB.position.z;
        line.geometry.attributes.position.needsUpdate = true;
    });

    // Core animation
    core.rotation.x += 0.005;
    core.rotation.y += 0.008;
    core.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;

    // Warp speed effect on enter
    if (isEntering) {
        warpSpeed += 0.3;
        camera.position.z -= warpSpeed;
        camera.fov += 0.5;
        camera.updateProjectionMatrix();

        // Stretch nodes for warp effect
        nodes.forEach(node => {
            node.position.z -= warpSpeed * 0.5;
        });
    }

    renderer.render(scene, camera);
}

animate();

// ========================================
// Enter Button Handler
// ========================================

if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        isEntering = true;
        overlay.classList.add('fade-out');

        // After transition, hide overlay and scroll to home
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.remove('intro-active');

            // Scroll to home section
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
    });
}
