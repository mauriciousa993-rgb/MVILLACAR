import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VehicleDamageZone, VehicleDamageZoneMarkerPosition } from '../types';

type VehicleModelType = 'suv' | 'pickup' | 'sedan' | 'hatchback';

const DEFAULT_MODEL_FALLBACKS = ['/models/ren-car-v3.fbx', '/models/ren%20carV3.fbx'];
const GLTF_URL_PATTERN = /\.gltf(\?|#|$)|\.glb(\?|#|$)/i;
const EXTERNAL_OR_EMBEDDED_URL_PATTERN = /^(data:|blob:|https?:)/i;

const MODEL_URL_CANDIDATES: Record<VehicleModelType, string[]> = {
  suv: ['/models/suv/scene.gltf', '/models/suv.gltf', '/models/suv.glb', '/models/suv.fbx', '/models/SUV.fbx', '/models/suv-model.fbx', ...DEFAULT_MODEL_FALLBACKS],
  pickup: ['/models/pickup/scene.gltf', '/models/pickup.gltf', '/models/pickup.glb', '/models/pickup.fbx', '/models/Pickup.fbx', '/models/pickup-model.fbx', ...DEFAULT_MODEL_FALLBACKS],
  sedan: ['/models/sedan/scene.gltf', '/models/sedan.gltf', '/models/sedan.glb', '/models/sedan.fbx', '/models/sedan-model.fbx', ...DEFAULT_MODEL_FALLBACKS],
  hatchback: ['/models/hatchback/scene.gltf', '/models/hatchback.gltf', '/models/hatchback.glb', '/models/hatchback.fbx', '/models/hatchback-model.fbx', ...DEFAULT_MODEL_FALLBACKS],
};
const FALLBACK_TEXTURE_URL = '/models/kia-nq5-22my-wheel-small-17inch.png';

interface Vehicle3DModelViewerProps {
  damageZones: VehicleDamageZone[];
  tipoVehiculo?: VehicleModelType;
  onAssignZoneMarker?: (
    zoneKey: string,
    markerPosition: VehicleDamageZoneMarkerPosition,
    markerIndex?: number
  ) => void;
}

export interface Vehicle3DModelViewerHandle {
  captureDamageViews: () => Promise<{
    izquierda: string;
    derecha: string;
    frente: string;
    trasera: string;
  }>;
}

type ZoneMarkerProfile = {
  direction: [number, number, number];
  seed: [number, number, number];
};

type MovingMarkerTarget = {
  zoneKey: string;
  markerIndex: number;
} | null;

type MaterialWithColor = THREE.Material & {
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
};

const replaceAsciiBytes = (bytes: Uint8Array, from: string, to: string) => {
  if (from.length !== to.length) return;
  const fromBytes = new TextEncoder().encode(from);
  const toBytes = new TextEncoder().encode(to);
  const max = bytes.length - fromBytes.length;

  for (let i = 0; i <= max; i += 1) {
    let match = true;
    for (let j = 0; j < fromBytes.length; j += 1) {
      if (bytes[i + j] !== fromBytes[j]) {
        match = false;
        break;
      }
    }
    if (!match) continue;
    for (let j = 0; j < toBytes.length; j += 1) {
      bytes[i + j] = toBytes[j];
    }
  }
};

const patchUnsupportedEmbeddedTextureExtensions = (buffer: ArrayBuffer): ArrayBuffer => {
  const bytes = new Uint8Array(buffer.slice(0));
  // Algunos FBX traen textura PNG/JPEG embebida pero etiquetada como .dds.
  // Reetiquetamos a .png para que FBXLoader pueda parsearla.
  replaceAsciiBytes(bytes, '.dds', '.png');
  replaceAsciiBytes(bytes, '.DDS', '.png');
  return bytes.buffer;
};

const Vehicle3DModelViewer = forwardRef<Vehicle3DModelViewerHandle, Vehicle3DModelViewerProps>(
  ({ damageZones, tipoVehiculo = 'sedan', onAssignZoneMarker }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const zoneMarkerGroupRef = useRef<THREE.Group | null>(null);
  const orbitDistanceRef = useRef<number>(12);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, 0));
  const frameRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isManualPlacementEnabled, setIsManualPlacementEnabled] = useState(false);
  const [pendingMarkerPosition, setPendingMarkerPosition] =
    useState<VehicleDamageZoneMarkerPosition | null>(null);
  const [selectedZoneForPendingMarker, setSelectedZoneForPendingMarker] = useState('');
  const [movingMarkerTarget, setMovingMarkerTarget] = useState<MovingMarkerTarget>(null);
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const lastDragPositionRef = useRef<VehicleDamageZoneMarkerPosition | null>(null);

  const damagedZoneLabels = useMemo(
    () => damageZones.filter((zone) => zone.status === 'mal').map((zone) => zone.label),
    [damageZones]
  );
  const movingZoneLabel = useMemo(() => {
    if (!movingMarkerTarget?.zoneKey) return '';
    return damageZones.find((zone) => zone.key === movingMarkerTarget.zoneKey)?.label || '';
  }, [damageZones, movingMarkerTarget]);
  const canAssignZones = typeof onAssignZoneMarker === 'function';
  const modelCandidates = useMemo(
    () => MODEL_URL_CANDIDATES[tipoVehiculo] || MODEL_URL_CANDIDATES.sedan,
    [tipoVehiculo]
  );

  const getDefaultZoneForSelection = () =>
    damageZones.find((zone) => zone.status !== 'mal')?.key || damageZones[0]?.key || '';

  useEffect(() => {
    if (!selectedZoneForPendingMarker || !damageZones.some((zone) => zone.key === selectedZoneForPendingMarker)) {
      setSelectedZoneForPendingMarker(getDefaultZoneForSelection());
    }
  }, [damageZones, selectedZoneForPendingMarker]);

  useEffect(() => {
    if (!movingMarkerTarget) return;
    const zone = damageZones.find((item) => item.key === movingMarkerTarget.zoneKey);
    const markerCount = (zone?.markerPositions || []).length;
    if (!zone || zone.status !== 'mal' || movingMarkerTarget.markerIndex < 0 || movingMarkerTarget.markerIndex >= markerCount) {
      setMovingMarkerTarget(null);
      setIsDraggingMarker(false);
      dragPointerIdRef.current = null;
      lastDragPositionRef.current = null;
    }
  }, [damageZones, movingMarkerTarget]);

  useEffect(() => {
    if (isManualPlacementEnabled) return;
    setIsDraggingMarker(false);
    setMovingMarkerTarget(null);
    dragPointerIdRef.current = null;
    lastDragPositionRef.current = null;
  }, [isManualPlacementEnabled]);

  const forEachMeshMaterial = (
    material: THREE.Material | THREE.Material[],
    callback: (mat: MaterialWithColor) => void
  ) => {
    if (Array.isArray(material)) {
      material.forEach((mat) => callback(mat as MaterialWithColor));
      return;
    }
    callback(material as MaterialWithColor);
  };

  const getModelMeshes = (model: THREE.Object3D) => {
    const meshes: THREE.Mesh[] = [];
    model.traverse((child: any) => {
      if (child.isMesh) meshes.push(child as THREE.Mesh);
    });
    return meshes;
  };

  const isValidMarkerPosition = (position: VehicleDamageZoneMarkerPosition | null | undefined) => {
    if (!position) return false;
    return Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z);
  };

  const getMarkerRadiusFromModel = (model: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    return Math.max(Math.min(size.x, size.y, size.z) * 0.03, 0.08);
  };

  const hasMeaningfulPositionChange = (
    previous: VehicleDamageZoneMarkerPosition | null,
    next: VehicleDamageZoneMarkerPosition
  ) => {
    if (!previous) return true;
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const dz = next.z - previous.z;
    return dx * dx + dy * dy + dz * dz > 0.0001;
  };

  const setCameraByDirection = (direction: THREE.Vector3) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const target = targetRef.current.clone();
    const dir = direction.clone().normalize();
    camera.position.copy(target.add(dir.multiplyScalar(orbitDistanceRef.current)));
    camera.lookAt(targetRef.current);
    controls.target.copy(targetRef.current);
    controls.update();
  };

  const ZONE_MARKER_PROFILE: Record<string, ZoneMarkerProfile> = {
    frente: {
      direction: [0, 0.05, -1],
      seed: [0, 0.36, -0.98],
    },
    capo: {
      direction: [0, 0.38, -1],
      seed: [0, 0.66, -0.56],
    },
    techo: {
      direction: [0, 1, 0],
      seed: [0, 0.93, 0.04],
    },
    trasera: {
      direction: [0, 0.07, 1],
      seed: [0, 0.38, 0.98],
    },
    lateral_izq: {
      direction: [-1, 0.08, 0],
      seed: [-0.98, 0.52, 0.04],
    },
    lateral_der: {
      direction: [1, 0.08, 0],
      seed: [0.98, 0.52, 0.04],
    },
    puerta_izq: {
      direction: [-1, 0.02, 0.02],
      seed: [-0.9, 0.48, 0.24],
    },
    puerta_der: {
      direction: [1, 0.02, 0.02],
      seed: [0.9, 0.48, 0.24],
    },
  };

  const clearZoneMarkers = () => {
    const markerGroup = zoneMarkerGroupRef.current;
    if (!markerGroup) return;
    while (markerGroup.children.length > 0) {
      const child = markerGroup.children.pop() as THREE.Mesh | undefined;
      if (!child) continue;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  };

  const renderZoneMarkers = (zones: VehicleDamageZone[]) => {
    const model = modelRef.current;
    const markerGroup = zoneMarkerGroupRef.current;
    if (!model || !markerGroup) return;

    clearZoneMarkers();
    const damagedZones = zones.filter((zone) => zone.status === 'mal');
    if (damagedZones.length === 0) return;

    const meshes = getModelMeshes(model);
    if (meshes.length === 0) return;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const halfX = Math.max(size.x / 2, 0.1);
    const halfZ = Math.max(size.z / 2, 0.1);
    const markerRadius = Math.max(Math.min(size.x, size.y, size.z) * 0.03, 0.08);
    const outsideDistance = Math.max(size.x, size.y, size.z) * 1.1;
    const raycaster = new THREE.Raycaster();

    damagedZones.forEach((zone) => {
      const profile = ZONE_MARKER_PROFILE[zone.key];
      const manualPositions = (zone.markerPositions || []).filter((position) => isValidMarkerPosition(position));
      const legacyPosition = isValidMarkerPosition(zone.markerPosition) ? [zone.markerPosition] : [];
      const sourcePositions =
        manualPositions.length > 0
          ? manualPositions
          : legacyPosition.length > 0
            ? legacyPosition
            : [];

      const zoneMarkerPositions: THREE.Vector3[] = sourcePositions.map(
        (position) => new THREE.Vector3(position.x, position.y, position.z)
      );

      if (zoneMarkerPositions.length === 0 && profile) {
        const rayOutDirection = new THREE.Vector3(...profile.direction).normalize();
        const [nx, ny, nz] = profile.seed;
        const seed = new THREE.Vector3(
          center.x + nx * halfX * 0.95,
          box.min.y + ny * size.y,
          center.z + nz * halfZ * 0.95
        );

        const rayStart = seed.clone().addScaledVector(rayOutDirection, outsideDistance);
        raycaster.set(rayStart, rayOutDirection.clone().multiplyScalar(-1));
        const intersections = raycaster.intersectObjects(meshes, false);

        let fallbackPosition = seed.clone();
        if (intersections.length > 0) {
          const hit = intersections[0];
          const hitNormal = hit.face?.normal
            ? hit.face.normal.clone().transformDirection((hit.object as THREE.Mesh).matrixWorld)
            : rayOutDirection;
          fallbackPosition = hit.point.clone().addScaledVector(hitNormal.normalize(), markerRadius * 0.55);
        }
        zoneMarkerPositions.push(fallbackPosition);
      }

      zoneMarkerPositions.forEach((markerPosition, markerIndex) => {
        const isMovingTarget =
          movingMarkerTarget?.zoneKey === zone.key && movingMarkerTarget?.markerIndex === markerIndex;

        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(isMovingTarget ? markerRadius * 1.35 : markerRadius * 1.15, 18, 18),
          new THREE.MeshStandardMaterial({
            color: isMovingTarget ? '#f59e0b' : '#ef4444',
            emissive: isMovingTarget ? '#78350f' : '#7f1d1d',
            emissiveIntensity: isMovingTarget ? 0.82 : 0.64,
            roughness: 0.3,
            metalness: 0.15,
            transparent: true,
            opacity: 0.99,
          })
        );
        marker.position.copy(markerPosition);
        marker.userData = {
          ...(marker.userData || {}),
          zoneKey: zone.key,
          markerIndex,
        };
        marker.castShadow = false;
        marker.receiveShadow = false;
        markerGroup.add(marker);
      });
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setIsLoading(true);
    setLoadError('');

    const width = Math.max(container.clientWidth, 280);
    const height = Math.max(container.clientHeight, 280);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f1720');
    scene.fog = new THREE.Fog('#0f1720', 65, 220);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(12, 6, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight('#e5f2ff', '#1f2937', 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 1.2);
    keyLight.position.set(10, 14, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#bfdbfe', 0.9);
    fillLight.position.set(-8, 5, -6);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight('#ffffff', 0.45);
    backLight.position.set(-6, 6, 10);
    scene.add(backLight);

    const topLight = new THREE.DirectionalLight('#f8fafc', 0.55);
    topLight.position.set(0, 16, 0);
    scene.add(topLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 64),
      new THREE.MeshStandardMaterial({ color: '#0b1220', roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.2;
    floor.receiveShadow = true;
    scene.add(floor);

    const markerGroup = new THREE.Group();
    zoneMarkerGroupRef.current = markerGroup;
    scene.add(markerGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = orbitDistanceRef.current;
    controls.maxDistance = orbitDistanceRef.current;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.copy(targetRef.current);
    controlsRef.current = controls;

    const fbxLoadingManager = new THREE.LoadingManager();
    fbxLoadingManager.setURLModifier((url: string) => {
      const normalized = url.replace(/\\/g, '/');
      if (!normalized || EXTERNAL_OR_EMBEDDED_URL_PATTERN.test(normalized)) return url;
      const fileName = (normalized.split('/').pop() || '').split('?')[0].split('#')[0];
      if (!fileName) return url;
      if (fileName.toLowerCase().includes('wheel-small-17inch')) return FALLBACK_TEXTURE_URL;
      return `/models/${fileName}`;
    });

    const fbxLoader = new FBXLoader(fbxLoadingManager);
    const gltfLoader = new GLTFLoader();

    const loadModelFromUrl = async (url: string): Promise<THREE.Group> => {
      if (GLTF_URL_PATTERN.test(url)) {
        const gltf = await gltfLoader.loadAsync(url);
        if (gltf.scene) return gltf.scene;
        if (gltf.scenes && gltf.scenes[0]) return gltf.scenes[0];
        throw new Error(`El archivo GLTF no contiene escena: ${url}`);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el modelo: ${url}`);
      }
      const rawBuffer = await response.arrayBuffer();
      const patchedBuffer = patchUnsupportedEmbeddedTextureExtensions(rawBuffer);
      return fbxLoader.parse(patchedBuffer, '/models/');
    };

    const applyLoadedModel = (fbx: THREE.Group) => {
        // Normalizar orientacion: altura en eje Y y largo en eje Z
        const preBox = new THREE.Box3().setFromObject(fbx);
        const preSize = preBox.getSize(new THREE.Vector3());
        const minAxis =
          preSize.x <= preSize.y && preSize.x <= preSize.z
            ? 'x'
            : preSize.y <= preSize.x && preSize.y <= preSize.z
              ? 'y'
              : 'z';
        if (minAxis === 'x') {
          fbx.rotateZ(Math.PI / 2);
        } else if (minAxis === 'z') {
          fbx.rotateX(-Math.PI / 2);
        }

        const alignedBox = new THREE.Box3().setFromObject(fbx);
        const alignedSize = alignedBox.getSize(new THREE.Vector3());
        if (alignedSize.x > alignedSize.z) {
          fbx.rotateY(Math.PI / 2);
        }

        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Centrar la geometria en el origen antes de escalar
        fbx.position.set(-center.x, -center.y, -center.z);

        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const scale = 8 / maxAxis;
        fbx.scale.setScalar(scale);
        // Sin rotacion adicional para mantener ejes de zonas consistentes
        fbx.rotation.y = 0;

        fbx.traverse((obj: any) => {
          if (!obj.isMesh) return;
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (!obj.material) return;
          forEachMeshMaterial(obj.material, (mat) => {
            const standardMat = mat as THREE.MeshStandardMaterial;
            if (typeof standardMat.metalness === 'number') {
              standardMat.metalness = standardMat.metalness;
            }
            if (typeof standardMat.roughness === 'number') {
              standardMat.roughness = standardMat.roughness;
            }
            if (mat.color instanceof THREE.Color) {
              mat.userData = { ...(mat.userData || {}), baseColor: mat.color.clone() };
            }
            mat.needsUpdate = true;
          });
        });

        // Ajustar la base del modelo al piso y encuadrar camara automaticamente
        const fittedBox = new THREE.Box3().setFromObject(fbx);
        const fittedSphere = fittedBox.getBoundingSphere(new THREE.Sphere());
        const yShift = -1.8 - fittedBox.min.y;
        fbx.position.y += yShift;

        const finalBox = new THREE.Box3().setFromObject(fbx);
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const target = finalBox.getCenter(new THREE.Vector3());
        target.y = finalBox.min.y + finalSize.y * 0.45;
        targetRef.current.copy(target);

        const radius = Math.max(fittedSphere.radius, 2.2);
        orbitDistanceRef.current = Math.max(radius * 2.1, 7.8);
        controls.minDistance = orbitDistanceRef.current;
        controls.maxDistance = orbitDistanceRef.current;
        setCameraByDirection(new THREE.Vector3(1, 0.5, 1));
        controls.update();

        scene.add(fbx);
        modelRef.current = fbx;
        renderZoneMarkers(damageZones);
        setIsLoading(false);
    };

    const tryLoadModel = async (index: number) => {
      const url = modelCandidates[index];
      if (!url) {
        setLoadError('No se pudo cargar el modelo 3D del vehiculo');
        setIsLoading(false);
        return;
      }

      try {
        const model = await loadModelFromUrl(url);
        applyLoadedModel(model);
      } catch (error) {
        console.error(`Error al cargar modelo 3D (${url}):`, error);
        tryLoadModel(index + 1);
      }
    };

    tryLoadModel(0);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(container.clientWidth, 280);
      const nextHeight = Math.max(container.clientHeight, 280);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      controls.dispose();
      clearZoneMarkers();
      scene.traverse((obj: any) => {
        if (!obj.isMesh) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => mat.dispose && mat.dispose());
          } else {
            obj.material.dispose && obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelCandidates]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    model.traverse((obj: any) => {
      if (!obj.isMesh || !obj.material) return;
      forEachMeshMaterial(obj.material, (mat) => {
        try {
          const baseColor = mat.userData?.baseColor as THREE.Color | undefined;
          if (baseColor && mat.color instanceof THREE.Color) {
            mat.color.copy(baseColor);
          }

          // Restaurar emisión base para no teñir todo el carro
          if (mat.emissive instanceof THREE.Color) {
            mat.emissive.set('#000000');
            mat.emissiveIntensity = 0;
          }

          mat.needsUpdate = true;
        } catch (error) {
          // Evitar que una variación de material rompa toda la app
          console.error('Error aplicando estado visual al material 3D:', error);
        }
      });
    });

    renderZoneMarkers(damageZones);
  }, [damageZones, movingMarkerTarget]);

  const applyCameraPreset = (preset: 'front' | 'rear' | 'left' | 'right' | 'top' | 'iso') => {
    if (preset === 'front') setCameraByDirection(new THREE.Vector3(0, 0.16, 1));
    if (preset === 'rear') setCameraByDirection(new THREE.Vector3(0, 0.16, -1));
    if (preset === 'left') setCameraByDirection(new THREE.Vector3(-1, 0.2, 0));
    if (preset === 'right') setCameraByDirection(new THREE.Vector3(1, 0.2, 0));
    if (preset === 'top') setCameraByDirection(new THREE.Vector3(0.01, 1, 0.01));
    if (preset === 'iso') setCameraByDirection(new THREE.Vector3(1, 0.5, 1));
  };

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enabled = !isManualPlacementEnabled;
    return () => {
      controls.enabled = true;
    };
  }, [isManualPlacementEnabled]);

  const getRaycasterFromClientPosition = (clientX: number, clientY: number): THREE.Raycaster | null => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return null;

    const rect = renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const pointer = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    return raycaster;
  };

  const captureMarkerZoneFromPointer = (
    clientX: number,
    clientY: number
  ): { zoneKey: string; markerIndex: number } | null => {
    const markerGroup = zoneMarkerGroupRef.current;
    if (!markerGroup || markerGroup.children.length === 0) return null;

    const raycaster = getRaycasterFromClientPosition(clientX, clientY);
    if (!raycaster) return null;

    const intersections = raycaster.intersectObjects(markerGroup.children, false);
    if (intersections.length === 0) return null;

    const zoneKey = intersections[0].object.userData?.zoneKey;
    const markerIndex = Number(intersections[0].object.userData?.markerIndex);
    if (typeof zoneKey !== 'string' || !zoneKey) return null;
    if (!Number.isInteger(markerIndex) || markerIndex < 0) return null;
    return { zoneKey, markerIndex };
  };

  const captureMarkerFromPointer = (clientX: number, clientY: number): VehicleDamageZoneMarkerPosition | null => {
    const model = modelRef.current;
    const camera = cameraRef.current;
    if (!model || !camera) return null;

    const meshes = getModelMeshes(model);
    if (meshes.length === 0) return null;

    const raycaster = getRaycasterFromClientPosition(clientX, clientY);
    if (!raycaster) return null;

    const intersections = raycaster.intersectObjects(meshes, false);
    if (intersections.length === 0) return null;

    const hit = intersections[0];
    const normal = hit.face?.normal
      ? hit.face.normal.clone().transformDirection((hit.object as THREE.Mesh).matrixWorld)
      : camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1);
    const markerRadius = getMarkerRadiusFromModel(model);
    const markerPosition = hit.point.clone().addScaledVector(normal.normalize(), markerRadius * 0.55);
    return { x: markerPosition.x, y: markerPosition.y, z: markerPosition.z };
  };

  const handleViewerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isManualPlacementEnabled || !canAssignZones) return;
    event.preventDefault();

    const markerTarget = captureMarkerZoneFromPointer(event.clientX, event.clientY);
    if (markerTarget) {
      setMovingMarkerTarget(markerTarget);
      setSelectedZoneForPendingMarker(markerTarget.zoneKey);
      setPendingMarkerPosition(null);
      setIsDraggingMarker(true);
      dragPointerIdRef.current = event.pointerId;
      lastDragPositionRef.current = null;
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (isDraggingMarker) return;

    const markerPosition = captureMarkerFromPointer(event.clientX, event.clientY);
    if (!markerPosition) return;

    if (movingMarkerTarget) {
      onAssignZoneMarker?.(movingMarkerTarget.zoneKey, markerPosition, movingMarkerTarget.markerIndex);
      setMovingMarkerTarget(null);
      return;
    }

    setPendingMarkerPosition(markerPosition);
    if (!selectedZoneForPendingMarker || !damageZones.some((zone) => zone.key === selectedZoneForPendingMarker)) {
      setSelectedZoneForPendingMarker(getDefaultZoneForSelection());
    }
  };

  const handleViewerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isManualPlacementEnabled || !canAssignZones || !isDraggingMarker || !movingMarkerTarget) return;
    if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;

    const markerPosition = captureMarkerFromPointer(event.clientX, event.clientY);
    if (!markerPosition) return;
    if (!hasMeaningfulPositionChange(lastDragPositionRef.current, markerPosition)) return;

    onAssignZoneMarker?.(
      movingMarkerTarget.zoneKey,
      markerPosition,
      movingMarkerTarget.markerIndex
    );
    lastDragPositionRef.current = markerPosition;
  };

  const stopMarkerDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingMarker) return;
    if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingMarker(false);
    setMovingMarkerTarget(null);
    dragPointerIdRef.current = null;
    lastDragPositionRef.current = null;
  };

  const handleAssignPendingMarker = () => {
    if (!pendingMarkerPosition || !selectedZoneForPendingMarker) return;
    onAssignZoneMarker?.(selectedZoneForPendingMarker, pendingMarkerPosition);
    setPendingMarkerPosition(null);
  };

  const waitFrames = (count: number = 2) =>
    new Promise<void>((resolve) => {
      const step = (pending: number) => {
        if (pending <= 0) {
          resolve();
          return;
        }
        requestAnimationFrame(() => step(pending - 1));
      };
      step(count);
    });

  const capturePreset = async (
    preset: 'front' | 'rear' | 'left' | 'right'
  ): Promise<string> => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) {
      throw new Error('El visor 3D no esta listo para capturar');
    }

    applyCameraPreset(preset);
    await waitFrames(2);
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  };

  useImperativeHandle(
    ref,
    () => ({
      captureDamageViews: async () => {
        if (isLoading) throw new Error('El modelo 3D aun esta cargando');
        if (loadError) throw new Error('No se puede capturar porque el modelo 3D fallo al cargar');

        const camera = cameraRef.current;
        const controls = controlsRef.current;
        if (!camera || !controls) throw new Error('Camara no disponible');

        const previousPosition = camera.position.clone();
        const previousTarget = controls.target.clone();

        try {
          const frente = await capturePreset('front');
          const trasera = await capturePreset('rear');
          const izquierda = await capturePreset('left');
          const derecha = await capturePreset('right');
          return { izquierda, derecha, frente, trasera };
        } finally {
          camera.position.copy(previousPosition);
          controls.target.copy(previousTarget);
          camera.lookAt(previousTarget);
          controls.update();
        }
      },
    }),
    [isLoading, loadError]
  );

  const FallbackVehicle = () => (
    <div className="h-72 w-full rounded-lg border border-[#2f3238] bg-[#111827] flex items-center justify-center">
      <svg viewBox="0 0 420 220" className="w-[320px] h-[170px]">
        <rect x="86" y="96" width="248" height="70" rx="26" fill="#1f2937" stroke="#4b5563" />
        <rect x="140" y="68" width="142" height="44" rx="18" fill="#334155" stroke="#64748b" />
        <circle cx="145" cy="170" r="24" fill="#0f172a" stroke="#6b7280" />
        <circle cx="274" cy="170" r="24" fill="#0f172a" stroke="#6b7280" />
      </svg>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => applyCameraPreset('iso')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Isometrica
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('front')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('right')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Lateral der
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('left')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Lateral izq
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('rear')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Trasera
        </button>
        <button
          type="button"
          onClick={() => applyCameraPreset('top')}
          className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:text-white hover:border-primary-500"
        >
          Superior
        </button>
        {canAssignZones && (
          <button
            type="button"
            onClick={() => {
              const nextState = !isManualPlacementEnabled;
              setIsManualPlacementEnabled(nextState);
              if (!nextState) {
                setPendingMarkerPosition(null);
                setMovingMarkerTarget(null);
                setIsDraggingMarker(false);
                dragPointerIdRef.current = null;
                lastDragPositionRef.current = null;
              }
            }}
            className={`px-3 py-1 text-xs rounded-md border ${
              isManualPlacementEnabled
                ? 'border-yellow-500 text-yellow-200 bg-yellow-500/10'
                : 'border-[#3b404a] text-ink-200 hover:text-white hover:border-yellow-500'
            }`}
          >
            {isManualPlacementEnabled ? 'Modo manual activo' : 'Agregar punto manual'}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#2f3238] bg-[#0b1220] p-2 relative">
        <div
          ref={containerRef}
          onPointerDown={handleViewerPointerDown}
          onPointerMove={handleViewerPointerMove}
          onPointerUp={stopMarkerDragging}
          onPointerCancel={stopMarkerDragging}
          className={`h-72 w-full rounded-lg overflow-hidden ${
            isManualPlacementEnabled && canAssignZones ? 'cursor-crosshair' : 'cursor-grab'
          }`}
        />
        {loadError && (
          <div className="absolute inset-2">
            <FallbackVehicle />
          </div>
        )}
      </div>

      {isLoading && <p className="text-xs text-ink-300 mt-2">Cargando modelo 3D...</p>}
      {loadError && <p className="text-xs text-red-300 mt-2">{loadError}</p>}
      {isManualPlacementEnabled && canAssignZones && (
        <p className="text-xs text-yellow-200 mt-2">
          {movingMarkerTarget
            ? `Mover punto activo: arrastra el marcador de "${movingZoneLabel || movingMarkerTarget.zoneKey}" a la nueva posicion.`
            : 'Modo manual activo: toca/clic sobre el vehiculo para capturar un punto nuevo o arrastra un marcador para moverlo.'}
        </p>
      )}
      {movingMarkerTarget && canAssignZones && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              setMovingMarkerTarget(null);
              setIsDraggingMarker(false);
              dragPointerIdRef.current = null;
              lastDragPositionRef.current = null;
            }}
            className="px-3 py-1 text-xs rounded-md border border-[#3b404a] text-ink-200 hover:border-yellow-500/60"
          >
            Cancelar mover punto
          </button>
        </div>
      )}

      {pendingMarkerPosition && canAssignZones && (
        <div className="mt-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
          <p className="text-xs text-yellow-100 mb-2">
            Punto capturado. Selecciona la parte del vehiculo para asignarlo.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <select
              value={selectedZoneForPendingMarker}
              onChange={(event) => setSelectedZoneForPendingMarker(event.target.value)}
              className="input-field text-sm"
            >
              {damageZones.map((zone) => (
                <option key={zone.key} value={zone.key}>
                  {zone.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAssignPendingMarker}
              className="px-3 py-2 rounded-md text-sm border border-yellow-400 text-yellow-100 hover:bg-yellow-400/20"
            >
              Asignar punto
            </button>
            <button
              type="button"
              onClick={() => setPendingMarkerPosition(null)}
              className="px-3 py-2 rounded-md text-sm border border-[#3b404a] text-ink-200 hover:border-yellow-500/60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-ink-300 mt-2">
        {isManualPlacementEnabled
          ? movingMarkerTarget
            ? 'Paso actual: manten presionado el marcador y arrastralo sobre el carro para reubicarlo.'
            : 'Toca para ubicar puntos nuevos o arrastra un marcador existente para moverlo. Desactiva el modo manual para volver a rotar.'
          : 'Arrastra para rotar. La distancia esta fija para mantener escala constante.'}
      </p>

      {damagedZoneLabels.length > 0 ? (
        <p className="text-xs text-red-300 mt-1">
          Zonas con dano reportado: {damagedZoneLabels.join(', ')}.
        </p>
      ) : (
        <p className="text-xs text-green-300 mt-1">Sin danos visuales marcados.</p>
      )}
    </div>
  );
});

Vehicle3DModelViewer.displayName = 'Vehicle3DModelViewer';

export default Vehicle3DModelViewer;
