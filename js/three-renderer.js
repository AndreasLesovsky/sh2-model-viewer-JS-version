import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

// Modelle direkt laden Funktion
export function loadModel(canvas, model) {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    5000
  );

  // Kamera-Position direkt aus dem Modell-Objekt setzen
  camera.position.set(...model.cameraPosition);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x555555);

  // Nebel hinzufügen
  scene.fog = new THREE.Fog(0x555555, 700, 1200);

  // Licht
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.99); // Helle Umgebung
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6); // Himmel, Boden, Intensität
  scene.add(hemisphereLight);

  const overheadLight = new THREE.PointLight(0xffffff, 0.8, 1000); // Farbe, Intensität, Reichweite
  overheadLight.position.set(0, 500, 0); // Direkt über der Szene
  scene.add(overheadLight);

  const spotlight = new THREE.SpotLight(0xffffff, 0.3);
  spotlight.position.set(0, 500, 0);
  spotlight.target = scene; // Ziel des Lichts
  scene.add(spotlight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Point Light mit Schatten
  overheadLight.castShadow = true;
  overheadLight.shadow.mapSize.width = 1024; // Qualität erhöhen
  overheadLight.shadow.mapSize.height = 1024;

  // Model für Schatten aktivieren
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true; // Schatten werfen
      child.receiveShadow = true; // Schatten empfangen
    }
  });

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // GLTF-Modell laden
  const loader = new GLTFLoader();
  loader.load(
    model.path,
    (gltf) => {
      const modelScene = gltf.scene;
      // Modell verschieben: Anwenden der Position
      modelScene.position.set(...model.modelPosition);
      // Modell drehen und skalieren
      // Modell drehen: Anwenden der Rotation (wird aus dem Array des Modells übernommen)
      modelScene.rotation.set(...model.rotation); // Dreht das Modell um [X, Y, Z]
      modelScene.rotation.x = Math.PI;
      modelScene.scale.set(...model.scale);

      // BoundingBox berechnen
      const box = new THREE.Box3().setFromObject(modelScene);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // OrbitControls auf das Zentrum des Modells setzen
      controls.target.copy(center);
      controls.update();

      // Modell zur Szene hinzufügen
      scene.add(modelScene);

      // Animation
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    },
    undefined,
    (error) => console.error("Fehler beim Laden des Modells:", error)
  );
}
