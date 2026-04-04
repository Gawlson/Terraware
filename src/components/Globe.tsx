'use client'
import { useEffect, useRef, MutableRefObject } from "react";
import * as THREE from "three";
import { ClimateEvent } from "../types";

interface GlobeProps {
  events: ClimateEvent[];
  onEventClick: (event: ClimateEvent) => void;
  flyToRef: MutableRefObject<((lat: number, lng: number) => void) | null>;
  isSpinning: boolean;
}

const latLngToVec3 = (lat: number, lng: number, radius = 1): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

export default function Globe({ events, onEventClick, flyToRef, isSpinning }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isSpinningRef = useRef(isSpinning);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    // Lighting
    scene.add(new THREE.AmbientLight(0x334466, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x2244aa, 0.4);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Globe mesh
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0d2137,
      emissive: 0x040d1a,
      specular: 0x224466,
      shininess: 20,
    });
    globeGroup.add(new THREE.Mesh(globeGeo, globeMat));

    // Grid overlay
    const gridGeo = new THREE.SphereGeometry(1.001, 36, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x1a4060,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    globeGroup.add(new THREE.Mesh(gridGeo, gridMat));

    // Atmosphere
    const atmGeo = new THREE.SphereGeometry(1.05, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x1166bb,
      transparent: true,
      opacity: 0.06,
      side: THREE.FrontSide,
    });
    globeGroup.add(new THREE.Mesh(atmGeo, atmMat));

    // Outer glow
    const glowGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x0a3060,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // Stars
    const starVerts: number[] = [];
    for (let i = 0; i < 3000; i++) {
      starVerts.push(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.5 })
      )
    );

    // Markers
    const markerMeshes: THREE.Mesh[] = [];

    events.forEach((ev) => {
      const pos = latLngToVec3(ev.lat, ev.lng, 1.015);
      const col = new THREE.Color(ev.color);

      // Core dot
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.018 * ev.size, 12, 12),
        new THREE.MeshBasicMaterial({ color: col })
      );
      dot.position.copy(pos);
      dot.userData = ev;
      globeGroup.add(dot);
      markerMeshes.push(dot);

      // Pulse ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.026 * ev.size, 0.034 * ev.size, 20),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      ring.userData = { ...ev, isRing: true };
      globeGroup.add(ring);
      markerMeshes.push(ring);

      // Spike
      const spike = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003, 0.008, 0.06 * ev.size, 6),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 })
      );
      const spikePos = latLngToVec3(ev.lat, ev.lng, 1.04);
      spike.position.copy(spikePos);
      spike.lookAt(0, 0, 0);
      spike.rotateX(Math.PI / 2);
      globeGroup.add(spike);
    });

    // Rotation state
    let rotY = -1.6;
    let rotX = 0.35;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let animTime = 0;

    // Expose fly-to via ref
    flyToRef.current = (lat: number, lng: number) => {
      const targetY = (-lng * Math.PI / 180) - Math.PI / 2;
      const targetX = (lat * Math.PI / 180) * 0.7;
      const startY = rotY;
      const startX = rotX;
      let progress = 0;
      const step = () => {
        progress = Math.min(progress + 0.025, 1);
        const ease = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        rotY = startY + (targetY - startY) * ease;
        rotX = startX + (targetX - startX) * ease;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      rotY += (e.clientX - prevMouse.x) * 0.005;
      rotX += (e.clientY - prevMouse.y) * 0.005;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(markerMeshes);
      if (hits.length > 0 && hits[0].object.userData.id) {
        onEventClick(hits[0].object.userData as ClimateEvent);
      }
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z + e.deltaY * 0.002));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Animate
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      animTime += 0.016;
      if (isSpinningRef.current) rotY += 0.0015;
      globeGroup.rotation.y = rotY;
      globeGroup.rotation.x = rotX;

      markerMeshes.forEach((m, i) => {
        if (m.userData.isRing) {
          (m.material as THREE.MeshBasicMaterial).opacity =
            0.25 + 0.35 * Math.sin(animTime * 2.5 + i * 0.7);
          const s = 1 + 0.2 * Math.sin(animTime * 2 + i * 0.7);
          m.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [events]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}
