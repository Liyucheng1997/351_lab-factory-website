// 数字工厂设备与人物模型（程序化建模，单位：米）
// 约定：每个工位模型原点在地面、操作员一侧朝 +z；人朝 -z 面对设备。
// 每种设备先拼出细节，再按材质合并成少量网格（bake），然后复用，保证几十台设备也流畅。
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  cartonTexture,
  markerTexture,
  screenTexture,
  shutterTexture,
  wallTexture,
  wireDeckTexture,
  woodTexture,
  floorTexture,
  pegboardTexture,
  tileTexture,
  parquetTexture,
  hatchTexture,
  hazardTexture,
} from "./textures";

/* ------------------------------------------------------------------ */
/* 材质                                                                */
/* ------------------------------------------------------------------ */

const matCache = new Map<string, THREE.Material>();
function std(key: string, p: THREE.MeshStandardMaterialParameters) {
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial(p);
    m.userData.shared = true;
    matCache.set(key, m);
  }
  return m as THREE.MeshStandardMaterial;
}

export const MAT = {
  machineCream: () => std("machineCream", { color: "#efece4", roughness: 0.35, metalness: 0.15 }),
  machineGrey: () => std("machineGrey", { color: "#cfd3d8", roughness: 0.4, metalness: 0.25 }),
  machineDark: () => std("machineDark", { color: "#2c3038", roughness: 0.45, metalness: 0.5 }),
  chrome: () => std("chrome", { color: "#d7dbe0", roughness: 0.18, metalness: 1 }),
  steel: () => std("steel", { color: "#8e959f", roughness: 0.4, metalness: 0.8 }),
  frame: () => std("frame", { color: "#3a3f47", roughness: 0.5, metalness: 0.6 }),
  rubber: () => std("rubber", { color: "#1c1e22", roughness: 0.9, metalness: 0 }),
  red: () => std("red", { color: "#9a3b33", roughness: 0.4, metalness: 0.2 }),
  orange: () => std("orange", { color: "#a8865a", roughness: 0.45, metalness: 0.3 }),
  rackBlue: () => std("rackBlue", { color: "#3b3833", roughness: 0.45, metalness: 0.45 }),
  yellow: () => std("yellow", { color: "#c8ab7f", roughness: 0.45, metalness: 0.2 }),
  laminate: () => std("laminate", { color: "#e2d3b6", roughness: 0.55, metalness: 0 }),
  whiteTop: () => std("whiteTop", { color: "#f4f5f6", roughness: 0.5, metalness: 0 }),
  ironCover: () => std("ironCover", { color: "#c4c9d0", roughness: 0.95, metalness: 0 }),
  plasticBlack: () => std("plasticBlack", { color: "#24272c", roughness: 0.6, metalness: 0.05 }),
  plasticBlue: () => std("plasticBlue", { color: "#2b2a28", roughness: 0.4, metalness: 0.1 }),
  skin: () => std("skin", { color: "#e7bd98", roughness: 0.7, metalness: 0 }),
  hair: () => std("hair", { color: "#1f1a17", roughness: 0.8, metalness: 0 }),
  jeans: () => std("jeans", { color: "#2e3b57", roughness: 0.9, metalness: 0 }),
  shoe: () => std("shoe", { color: "#2a2a2c", roughness: 0.6, metalness: 0 }),
  glassScreen: () =>
    std("screen", { color: "#ffffff", map: screenTexture(), emissive: "#ffffff", emissiveMap: screenTexture(), emissiveIntensity: 0.9, roughness: 0.3 }),
  lamp: () => std("lamp", { color: "#ffffff", emissive: "#fff3d6", emissiveIntensity: 2.2, roughness: 0.3 }),
  ledBlue: () => std("ledBlue", { color: "#59d0ff", emissive: "#59d0ff", emissiveIntensity: 1.6 }),
  ledGreen: () => std("ledGreen", { color: "#38e08a", emissive: "#38e08a", emissiveIntensity: 1.6 }),
  wood: () => std("wood", { color: "#ffffff", map: woodTexture(), roughness: 0.85 }),
  carton: () => std("carton", { color: "#ffffff", map: cartonTexture(), roughness: 0.9 }),
  marker: () => std("marker", { color: "#ffffff", map: markerTexture(), roughness: 0.9 }),
  wire: () =>
    std("wire", { color: "#a5adb8", alphaMap: wireDeckTexture(), alphaTest: 0.5, transparent: false, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide }),
  wall: () => std("wall", { color: "#ffffff", map: wallTexture(), roughness: 0.8 }),
  shutter: () => std("shutter", { color: "#ffffff", map: shutterTexture(), roughness: 0.5, metalness: 0.4 }),
  floor: () => std("floor", { color: "#ffffff", map: floorTexture(), roughness: 0.32, metalness: 0.05 }),
  glass: () => std("glass", { color: "#bcd6ee", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.45, emissive: "#a9cdf0", emissiveIntensity: 0.25 }),
  film: () => std("film", { color: "#e8f2ff", roughness: 0.1, transparent: true, opacity: 0.25 }),
  green: () => std("green", { color: "#1f9d55", emissive: "#1f9d55", emissiveIntensity: 0.9 }),
  shelfWhite: () => std("shelfWhite", { color: "#f1f2f4", roughness: 0.42, metalness: 0.25 }),
  pegboard: () => std("pegboard", { color: "#ffffff", map: pegboardTexture(), roughness: 0.6, metalness: 0.1 }),
  plaster: () => std("plaster", { color: "#eef0f1", roughness: 0.9, metalness: 0 }),
  outerWall: () => std("outerWall", { color: "#e4e1da", roughness: 0.85, metalness: 0 }),
  wallCap: () => std("wallCap", { color: "#3d4452", roughness: 0.7, metalness: 0 }),
  skirting: () => std("skirting", { color: "#9aa2ad", roughness: 0.6, metalness: 0.1 }),
  concrete: () => std("concrete", { color: "#c9c6bf", roughness: 0.85, metalness: 0 }),
  tile: () => std("tile", { color: "#ffffff", map: tileTexture(), roughness: 0.35, metalness: 0 }),
  parquet: () => std("parquet", { color: "#ffffff", map: parquetTexture(), roughness: 0.55, metalness: 0 }),
  hatch: () => std("hatch", { color: "#ffffff", map: hatchTexture(), roughness: 0.9, metalness: 0 }),
  hazard: () => std("hazard", { color: "#ffffff", map: hazardTexture(), roughness: 0.6, metalness: 0 }),
  ceramic: () => std("ceramic", { color: "#fbfbfa", roughness: 0.15, metalness: 0 }),
  mirror: () => std("mirror", { color: "#dfe8f0", roughness: 0.02, metalness: 1 }),
  leaf: () => std("leaf", { color: "#3f7d3a", roughness: 0.75, metalness: 0 }),
  doorLeaf: () => std("doorLeaf", { color: "#d9d4ca", roughness: 0.5, metalness: 0.05 }),
  exitDoor: () => std("exitDoor", { color: "#8f98a5", roughness: 0.45, metalness: 0.5 }),
  officeTop: () => std("officeTop", { color: "#f2efe9", roughness: 0.45, metalness: 0 }),
};

export function fabric(color: string) {
  return std(`fabric-${color}`, { color, roughness: 0.95, metalness: 0 });
}
export function paint(color: string, rough = 0.5, metal = 0.2) {
  return std(`paint-${color}-${rough}-${metal}`, { color, roughness: rough, metalness: metal });
}

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */

type V3 = [number, number, number];

function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  parent.add(m);
  return m;
}
const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const RB = (w: number, h: number, d: number, r = 0.02, seg = 2) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const C = (rt: number, rb: number, h: number, seg = 20) => new THREE.CylinderGeometry(rt, rb, h, seg);
const S = (r: number, seg = 16) => new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.75));
const CAP = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 4, 10);

/** 沿一串点生成管子（软管、电线） */
function tube(points: V3[], r: number) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, 24, r, 8, false);
}

/** 按材质合并成少量网格 */
export function bake(root: THREE.Object3D, shadows = true) {
  root.updateMatrixWorld(true);
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    let g = mesh.geometry.clone();
    if (g.index) g = g.toNonIndexed();
    g.applyMatrix4(mesh.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.clearGroups();
    const mat = mesh.material as THREE.Material;
    if (!groups.has(mat)) groups.set(mat, []);
    groups.get(mat)!.push(g);
  });
  const out = new THREE.Group();
  for (const [mat, list] of groups) {
    const merged = mergeGeometries(list, false);
    list.forEach((g) => g.dispose());
    if (!merged) continue;
    merged.userData.shared = true;
    const mesh = new THREE.Mesh(merged, mat);
    const transparent = (mat as THREE.MeshStandardMaterial).transparent;
    mesh.castShadow = shadows && !transparent;
    mesh.receiveShadow = true;
    out.add(mesh);
  }
  return out;
}

/* 原型缓存：同一种设备只建模一次，之后 clone（共享几何体与材质） */
const protoCache = new Map<string, THREE.Group>();
export function proto(key: string, build: () => THREE.Object3D) {
  let p = protoCache.get(key);
  if (!p) {
    p = bake(build());
    protoCache.set(key, p);
  }
  return p.clone();
}

export function disposeModels() {
  for (const p of protoCache.values()) p.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
  protoCache.clear();
  for (const m of matCache.values()) m.dispose();
  matCache.clear();
}

/* ------------------------------------------------------------------ */
/* 车缝：工业平车（单针平缝机）                                         */
/* ------------------------------------------------------------------ */

function sewingTable(g: THREE.Group, topW = 1.2, topD = 0.6) {
  const H = 0.76;
  add(g, RB(topW, 0.035, topD, 0.012), MAT.laminate(), [0, H, 0]);
  // 台面封边
  add(g, B(topW, 0.012, 0.01), MAT.plasticBlack(), [0, H, topD / 2]);
  // K 形钢架：两侧立腿 + 底脚 + 横撑
  for (const sx of [-topW / 2 + 0.08, topW / 2 - 0.08]) {
    add(g, B(0.035, H - 0.02, 0.035), MAT.frame(), [sx, (H - 0.02) / 2, -topD / 2 + 0.1]);
    add(g, B(0.035, H - 0.02, 0.035), MAT.frame(), [sx, (H - 0.02) / 2, topD / 2 - 0.1]);
    add(g, B(0.04, 0.03, topD + 0.05), MAT.frame(), [sx, 0.015, 0]);
    for (const fz of [-topD / 2, topD / 2]) add(g, C(0.025, 0.025, 0.012), MAT.rubber(), [sx, 0.006, fz]);
  }
  add(g, B(topW - 0.16, 0.03, 0.03), MAT.frame(), [0, 0.18, -topD / 2 + 0.1]);
  // 抽屉
  add(g, RB(0.38, 0.11, topD - 0.08, 0.01), MAT.machineGrey(), [-topW / 2 + 0.3, H - 0.08, 0]);
  add(g, B(0.12, 0.015, 0.01), MAT.chrome(), [-topW / 2 + 0.3, H - 0.08, topD / 2 - 0.035]);
  // 伺服电机（台板下）
  add(g, C(0.075, 0.075, 0.2), MAT.machineDark(), [0.12, H - 0.12, -0.05], [0, 0, Math.PI / 2]);
  add(g, RB(0.16, 0.1, 0.12, 0.015), MAT.machineDark(), [0.12, H - 0.1, 0.08]);
  // 踏板 + 连杆
  add(g, RB(0.32, 0.025, 0.2, 0.008), MAT.frame(), [0.05, 0.08, 0.12], [-0.18, 0, 0]);
  add(g, C(0.006, 0.006, 0.55), MAT.chrome(), [0.12, 0.38, 0.0]);
  // 膝控抬压脚
  add(g, B(0.03, 0.18, 0.03), MAT.chrome(), [-0.02, H - 0.13, topD / 2 - 0.05]);
  add(g, RB(0.08, 0.04, 0.03, 0.01), MAT.rubber(), [-0.02, H - 0.24, topD / 2 - 0.03]);
}

function threadStand(g: THREE.Group, x: number, z: number, cones: number, H = 0.76) {
  add(g, C(0.006, 0.006, 0.62), MAT.chrome(), [x, H + 0.31, z]);
  add(g, B(0.22, 0.006, 0.006), MAT.chrome(), [x, H + 0.6, z]);
  add(g, RB(0.24, 0.012, 0.09, 0.004), MAT.machineDark(), [x, H + 0.03, z]);
  const colors = ["#f4f1ea", "#1d2a4f", "#2a2b30", "#c8402e", "#4b6a3a"];
  for (let i = 0; i < cones; i++) {
    const cx = x - 0.08 + (i % 2) * 0.16 - (cones > 2 ? 0.0 : 0);
    const cz = z + (cones > 2 ? (i < 2 ? -0.02 : 0.03) : 0);
    const cxx = cones > 2 ? x - 0.09 + (i % 4) * 0.06 : cx;
    add(g, C(0.022, 0.034, 0.12, 16), fabric(colors[i % colors.length]), [cxx, H + 0.1, cz]);
    add(g, C(0.004, 0.004, 0.55 - 0.1), MAT.chrome(), [cxx, H + 0.39, cz]);
  }
}

/** 平车机身侧面轮廓（C 形：底板-立柱-横臂-机头），挤出成实体 */
function lockstitchBodyGeo() {
  const s = new THREE.Shape();
  s.moveTo(-0.26, 0);
  s.lineTo(0.25, 0);
  s.lineTo(0.25, 0.3);
  s.quadraticCurveTo(0.25, 0.385, 0.165, 0.385);
  s.lineTo(-0.17, 0.395);
  s.quadraticCurveTo(-0.265, 0.395, -0.265, 0.315);
  s.lineTo(-0.265, 0.14);
  s.quadraticCurveTo(-0.2, 0.125, -0.13, 0.14);
  s.lineTo(-0.13, 0.255);
  s.quadraticCurveTo(-0.12, 0.27, -0.09, 0.27);
  s.lineTo(0.09, 0.27);
  s.quadraticCurveTo(0.12, 0.27, 0.12, 0.235);
  s.lineTo(0.12, 0.075);
  s.quadraticCurveTo(0.12, 0.06, 0.1, 0.06);
  s.lineTo(-0.26, 0.06);
  s.lineTo(-0.26, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.018, bevelSegments: 4, curveSegments: 10 });
  geo.translate(0, 0, -0.055);
  return geo;
}

export function sewingStation() {
  const g = new THREE.Group();
  sewingTable(g);
  const H = 0.78;
  const hx = 0;
  // 底板（比机身宽）+ 针板 + 送布牙
  add(g, RB(0.52, 0.06, 0.2, 0.015, 3), MAT.machineCream(), [hx - 0.005, H + 0.025, 0.0]);
  add(g, B(0.11, 0.004, 0.07), MAT.chrome(), [hx - 0.2, H + 0.057, 0.02]);
  add(g, B(0.06, 0.004, 0.06), MAT.chrome(), [hx - 0.08, H + 0.057, 0.03]); // 滑板
  // 机身（C 形）
  add(g, lockstitchBodyGeo(), MAT.machineCream(), [hx, H + 0.02, -0.005]);
  // 机头面板（左端盖板）+ 针杆 + 压脚
  add(g, RB(0.012, 0.24, 0.12, 0.005, 2), MAT.machineGrey(), [hx - 0.29, H + 0.28, -0.005]);
  add(g, C(0.0045, 0.0045, 0.15), MAT.chrome(), [hx - 0.2, H + 0.13, 0.02]);
  add(g, C(0.0012, 0.0012, 0.04), MAT.chrome(), [hx - 0.2, H + 0.075, 0.02]); // 机针
  add(g, C(0.004, 0.004, 0.15), MAT.chrome(), [hx - 0.17, H + 0.135, 0.02]);
  add(g, RB(0.035, 0.012, 0.045, 0.004), MAT.chrome(), [hx - 0.2, H + 0.064, 0.025]);
  add(g, RB(0.012, 0.05, 0.02, 0.004), MAT.chrome(), [hx - 0.17, H + 0.21, 0.04], [0, 0, -0.5]); // 手动抬压脚扳手
  // 夹线器（正面两组过线盘）+ 挑线杆 + 过线钩
  for (const [x, y] of [[-0.22, 0.31], [-0.08, 0.38]]) {
    add(g, C(0.016, 0.016, 0.008, 18), MAT.chrome(), [hx + x, H + y, 0.085], [Math.PI / 2, 0, 0]);
    add(g, C(0.016, 0.016, 0.008, 18), MAT.chrome(), [hx + x, H + y, 0.095], [Math.PI / 2, 0, 0]);
    add(g, C(0.009, 0.009, 0.02, 12), MAT.machineDark(), [hx + x, H + y, 0.107], [Math.PI / 2, 0, 0]);
  }
  add(g, RB(0.06, 0.01, 0.012, 0.004), MAT.red(), [hx - 0.25, H + 0.37, 0.08], [0, 0, 0.35]); // 挑线杆
  add(g, new THREE.TorusGeometry(0.008, 0.002, 6, 10), MAT.chrome(), [hx - 0.15, H + 0.4, 0.07]);
  // 右侧：皮带罩、手轮、绕线器
  add(g, RB(0.04, 0.22, 0.13, 0.02, 3), MAT.machineGrey(), [hx + 0.29, H + 0.16, -0.005]);
  add(g, C(0.06, 0.06, 0.035, 32), MAT.machineDark(), [hx + 0.33, H + 0.29, -0.005], [0, 0, Math.PI / 2]);
  add(g, C(0.035, 0.035, 0.04, 24), MAT.chrome(), [hx + 0.335, H + 0.29, -0.005], [0, 0, Math.PI / 2]);
  for (let k = 0; k < 4; k++) add(g, B(0.002, 0.11, 0.008), MAT.plasticBlack(), [hx + 0.352, H + 0.29, -0.005], [k * 0.785, 0, 0]);
  add(g, C(0.018, 0.018, 0.03, 16), MAT.chrome(), [hx + 0.18, H + 0.435, -0.02]); // 绕线器
  add(g, C(0.014, 0.014, 0.012, 16), MAT.chrome(), [hx + 0.18, H + 0.455, -0.02]);
  // 立柱正面：针距旋钮 + 倒缝扳手；横臂上：操作面板 + 品牌铭牌
  add(g, C(0.026, 0.026, 0.014, 24), MAT.machineDark(), [hx + 0.19, H + 0.2, 0.085], [Math.PI / 2, 0, 0]);
  add(g, RB(0.016, 0.07, 0.016, 0.006), MAT.machineDark(), [hx + 0.155, H + 0.11, 0.085], [0, 0, 0.3]);
  add(g, RB(0.11, 0.024, 0.065, 0.008), MAT.plasticBlack(), [hx + 0.02, H + 0.425, -0.005]);
  add(g, B(0.06, 0.002, 0.035), MAT.ledBlue(), [hx + 0.02, H + 0.438, -0.005]);
  add(g, RB(0.08, 0.022, 0.003, 0.002), MAT.red(), [hx + 0.0, H + 0.33, 0.077]);
  // LED 机头灯（软管灯）
  add(g, tube([[hx - 0.26, H + 0.36, 0.06], [hx - 0.3, H + 0.3, 0.12], [hx - 0.24, H + 0.22, 0.12]], 0.005), MAT.machineDark());
  add(g, RB(0.05, 0.016, 0.022, 0.006), MAT.lamp(), [hx - 0.24, H + 0.215, 0.12]);
  // 线架 + 两个线锥 + 走线（线锥 → 线架顶 → 机头）
  threadStand(g, 0.43, -0.2, 2);
  const threadMat = fabric("#f4f1ea");
  for (const [cx, col] of [[0.35, threadMat], [0.51, fabric("#3a312b")]] as const) {
    add(g, tube([[cx, H + 0.17, -0.2], [cx, H + 0.62, -0.2], [0.43, H + 0.6, -0.2]], 0.0015), col);
  }
  add(g, tube([[0.43, H + 0.6, -0.2], [0.2, H + 0.48, -0.12], [hx - 0.08, H + 0.4, 0.06], [hx - 0.22, H + 0.32, 0.09], [hx - 0.2, H + 0.1, 0.03]], 0.0015), threadMat);
  // 待缝的裁片、缝好的半成品、小工具盒
  add(g, B(0.26, 0.03, 0.2), fabric("#a98559"), [-0.42, 0.79, 0.12], [0, 0.2, 0]);
  add(g, B(0.24, 0.015, 0.18), fabric("#e9e2d1"), [0.32, 0.785, 0.15], [0, -0.3, 0]);
  add(g, B(0.2, 0.004, 0.16), fabric("#a98559"), [hx - 0.16, H + 0.06, 0.08], [0, 0.1, 0]); // 正在缝的布
  add(g, RB(0.08, 0.04, 0.05, 0.01), MAT.plasticBlue(), [0.42, 0.8, 0.05]);
  officeChair(g, [0, 0, 0.62]);
  return g;
}

/** 锁边机（包缝机）：机身紧凑、四个线锥 */
export function overlockStation() {
  const g = new THREE.Group();
  sewingTable(g, 1.0, 0.55);
  const H = 0.78;
  add(g, RB(0.3, 0.06, 0.22, 0.02), MAT.machineCream(), [0, H + 0.02, 0]);
  add(g, RB(0.26, 0.2, 0.2, 0.05, 4), MAT.machineCream(), [0.02, H + 0.15, -0.01]);
  add(g, RB(0.12, 0.12, 0.18, 0.03, 3), MAT.machineGrey(), [-0.12, H + 0.13, -0.01]);
  add(g, C(0.05, 0.05, 0.03, 24), MAT.machineDark(), [0.16, H + 0.17, -0.01], [0, 0, Math.PI / 2]);
  add(g, RB(0.08, 0.04, 0.12, 0.01), MAT.machineGrey(), [-0.1, H + 0.04, 0.12]); // 吸风口
  add(g, C(0.02, 0.02, 0.4), MAT.plasticBlack(), [-0.1, H - 0.2, 0.18]); // 吸线管
  add(g, B(0.18, 0.01, 0.12), MAT.lamp(), [0.0, H + 0.26, 0.08]);
  threadStand(g, 0.0, -0.18, 4);
  add(g, B(0.3, 0.025, 0.22), fabric("#8d929b"), [-0.36, 0.79, 0.1], [0, 0.15, 0]);
  officeChair(g, [0, 0, 0.58]);
  return g;
}

function officeChair(g: THREE.Group, at: V3) {
  const [x, , z] = at;
  add(g, RB(0.44, 0.07, 0.42, 0.03, 3), paint("#3a312b", 0.75, 0), [x, 0.47, z]);
  add(g, RB(0.4, 0.34, 0.05, 0.03, 3), paint("#3a312b", 0.75, 0), [x, 0.78, z + 0.21], [-0.1, 0, 0]);
  add(g, B(0.04, 0.3, 0.03), MAT.frame(), [x, 0.6, z + 0.22]);
  add(g, C(0.025, 0.025, 0.3), MAT.chrome(), [x, 0.3, z]);
  add(g, C(0.05, 0.05, 0.08), MAT.plasticBlack(), [x, 0.16, z]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    add(g, B(0.03, 0.025, 0.28), MAT.plasticBlack(), [x + Math.sin(a) * 0.13, 0.07, z + Math.cos(a) * 0.13], [0, a, 0]);
    add(g, S(0.025, 10), MAT.rubber(), [x + Math.sin(a) * 0.27, 0.025, z + Math.cos(a) * 0.27]);
  }
}

/* ------------------------------------------------------------------ */
/* 裁剪：手动裁床（直刀裁剪机） / 自动裁床（CNC）                         */
/* ------------------------------------------------------------------ */

function longTable(g: THREE.Group, W: number, L: number, H: number, topMat: THREE.Material) {
  add(g, RB(W, 0.05, L, 0.015), topMat, [0, H, 0]);
  const n = Math.max(2, Math.round(L / 1.2) + 1);
  for (let i = 0; i < n; i++) {
    const z = -L / 2 + 0.1 + (i * (L - 0.2)) / (n - 1);
    for (const sx of [-W / 2 + 0.08, W / 2 - 0.08]) add(g, B(0.05, H - 0.03, 0.05), MAT.frame(), [sx, (H - 0.03) / 2, z]);
    add(g, B(W - 0.16, 0.04, 0.04), MAT.frame(), [0, 0.15, z]);
  }
  // 两侧导轨（铺布机走的）
  for (const sx of [-W / 2 - 0.01, W / 2 + 0.01]) add(g, B(0.03, 0.04, L), MAT.steel(), [sx, H - 0.01, 0]);
}

function straightKnife(g: THREE.Group, at: V3) {
  const [x, y, z] = at;
  add(g, RB(0.24, 0.02, 0.16, 0.01), MAT.chrome(), [x, y + 0.01, z]);
  add(g, B(0.03, 0.3, 0.05), MAT.chrome(), [x, y + 0.17, z - 0.02]);
  add(g, B(0.004, 0.26, 0.035), paint("#e9edf2", 0.1, 1), [x + 0.02, y + 0.15, z - 0.02]);
  add(g, C(0.065, 0.065, 0.16, 20), MAT.red(), [x, y + 0.37, z - 0.02]);
  add(g, RB(0.1, 0.05, 0.08, 0.02), MAT.machineDark(), [x, y + 0.47, z - 0.02]);
  add(g, new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), MAT.plasticBlack(), [x, y + 0.5, z - 0.02]);
  add(g, tube([[x, y + 0.45, z - 0.02], [x + 0.1, y + 0.7, z - 0.2], [x + 0.3, y + 1.0, z - 0.6]], 0.008), MAT.plasticBlack());
}

/** 手动裁床：铺好的多层布 + 唛架纸 + 直刀裁剪机 + 已裁好的衣片 */
export function cuttingStation(variant: number) {
  const g = new THREE.Group();
  const W = 1.8;
  const L = 3.8;
  const H = 0.88;
  longTable(g, W, L, H, MAT.whiteTop());
  const colors = ["#a98559", "#1f1e22", "#e9e1d3", "#7d6a58", "#c9a9a6"];
  const c = colors[variant % colors.length];
  // 多层布（侧面能看出层次）
  for (let i = 0; i < 6; i++) {
    add(g, B(1.55, 0.012, 2.9), fabric(i % 2 ? c : new THREE.Color(c).offsetHSL(0, 0, 0.06).getStyle()), [0, H + 0.03 + i * 0.012, -0.35]);
  }
  add(g, B(1.55, 0.002, 2.9), MAT.marker(), [0, H + 0.105, -0.35]);
  straightKnife(g, [0.25, H + 0.106, 0.6]);
  // 已裁好、捆好的裁片
  for (let i = 0; i < 3; i++) add(g, RB(0.42, 0.08, 0.32, 0.02), fabric(c), [-0.45 + i * 0.45, H + 0.07, 1.45]);
  // 桌尾的布卷架
  for (const sx of [-0.85, 0.85]) add(g, B(0.04, 0.5, 0.04), MAT.steel(), [sx, H + 0.25, -L / 2 + 0.1]);
  add(g, C(0.16, 0.16, 1.66, 24), fabric(c), [0, H + 0.48, -L / 2 + 0.1], [0, 0, Math.PI / 2]);
  add(g, C(0.03, 0.03, 1.74), MAT.chrome(), [0, H + 0.48, -L / 2 + 0.1], [0, 0, Math.PI / 2]);
  if (variant === 0) spreader(g, W, H, -0.6, c);
  return g;
}

/** 铺布机：骑在裁床导轨上的龙门 */
function spreader(g: THREE.Group, W: number, H: number, z: number, color: string) {
  for (const sx of [-W / 2 - 0.05, W / 2 + 0.05]) {
    add(g, RB(0.12, 0.55, 0.5, 0.03), MAT.machineGrey(), [sx, H + 0.3, z]);
    add(g, C(0.05, 0.05, 0.06, 16), MAT.rubber(), [sx, H + 0.03, z - 0.18], [0, 0, Math.PI / 2]);
    add(g, C(0.05, 0.05, 0.06, 16), MAT.rubber(), [sx, H + 0.03, z + 0.18], [0, 0, Math.PI / 2]);
  }
  add(g, RB(W + 0.2, 0.18, 0.42, 0.04), MAT.machineCream(), [0, H + 0.62, z]);
  add(g, C(0.2, 0.2, W - 0.1, 28), fabric(color), [0, H + 0.88, z - 0.05], [0, 0, Math.PI / 2]);
  add(g, RB(0.28, 0.2, 0.06, 0.02), MAT.plasticBlack(), [W / 2 - 0.1, H + 0.75, z + 0.24]);
  add(g, B(0.2, 0.12, 0.002), MAT.glassScreen(), [W / 2 - 0.1, H + 0.76, z + 0.272]);
  add(g, B(0.3, 0.04, 0.04), MAT.yellow(), [0, H + 0.5, z + 0.22]);
}

/** 自动裁床（CNC）：黑色毛刷床面 + 吸附薄膜 + 横梁龙门 + 刀头 + 控制台 */
export function cncCutter() {
  const g = new THREE.Group();
  const W = 1.9;
  const L = 3.9;
  const H = 0.9;
  // 床身
  add(g, RB(W + 0.1, 0.5, L, 0.03), MAT.machineGrey(), [0, H - 0.3, 0]);
  add(g, B(W + 0.11, 0.06, L + 0.01), MAT.machineDark(), [0, H - 0.52, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, C(0.05, 0.06, 0.32), MAT.frame(), [sx * (W / 2 - 0.05), 0.16, sz * (L / 2 - 0.15)]);
  add(g, B(W - 0.1, 0.02, L - 0.1), paint("#3b3f46", 0.95, 0), [0, H - 0.04, 0]); // 毛刷床面
  for (let i = 0; i < 4; i++) add(g, B(1.6, 0.01, 0.9), fabric("#1f1e22"), [0, H - 0.025 + i * 0.01, -0.9]);
  add(g, B(1.7, 0.003, 2.4), MAT.film(), [0, H + 0.02, -0.6]);
  // 龙门横梁 + 两侧行走机构
  const gz = 0.3;
  for (const sx of [-W / 2 - 0.06, W / 2 + 0.06]) {
    add(g, RB(0.16, 0.42, 0.34, 0.03), MAT.machineCream(), [sx, H + 0.15, gz]);
    add(g, B(0.02, 0.06, L), MAT.steel(), [sx, H - 0.06, 0]);
  }
  add(g, RB(W + 0.3, 0.16, 0.24, 0.04, 3), MAT.machineCream(), [0, H + 0.38, gz]);
  add(g, B(W + 0.3, 0.02, 0.02), MAT.orange(), [0, H + 0.31, gz + 0.12]);
  // 刀头
  add(g, RB(0.24, 0.3, 0.26, 0.03, 3), MAT.machineDark(), [0.25, H + 0.26, gz + 0.12]);
  add(g, B(0.2, 0.04, 0.005), MAT.ledGreen(), [0.25, H + 0.33, gz + 0.252]);
  add(g, C(0.015, 0.015, 0.14), MAT.chrome(), [0.25, H + 0.05, gz + 0.12]);
  // 拖链
  add(g, B(W * 0.6, 0.04, 0.08), MAT.plasticBlack(), [-0.3, H + 0.5, gz - 0.04]);
  // 送料端收料台
  add(g, RB(W, 0.04, 0.6, 0.01), MAT.steel(), [0, H - 0.06, L / 2 + 0.3]);
  // 控制台
  add(g, C(0.03, 0.03, 1.2), MAT.frame(), [W / 2 + 0.35, 0.6, L / 2 - 0.2]);
  add(g, RB(0.5, 0.34, 0.06, 0.02), MAT.plasticBlack(), [W / 2 + 0.35, 1.32, L / 2 - 0.2], [-0.25, -0.6, 0]);
  add(g, B(0.44, 0.28, 0.005), MAT.glassScreen(), [W / 2 + 0.335, 1.33, L / 2 - 0.165], [-0.25, -0.6, 0]);
  add(g, RB(0.4, 0.02, 0.18, 0.01), MAT.plasticBlack(), [W / 2 + 0.33, 1.02, L / 2 - 0.08], [0.1, -0.6, 0]);
  // 真空泵
  add(g, RB(0.6, 0.7, 0.5, 0.04), paint("#5a7da8", 0.5, 0.3), [-W / 2 - 0.55, 0.35, -L / 2 + 0.5]);
  add(g, tube([[-W / 2 - 0.3, 0.5, -L / 2 + 0.5], [-W / 2 - 0.1, 0.4, -L / 2 + 0.8], [-W / 2 + 0.05, 0.5, -L / 2 + 1]], 0.05), MAT.plasticBlack());
  // 警示灯塔
  add(g, C(0.015, 0.015, 0.4), MAT.chrome(), [W / 2 + 0.06, H + 0.6, gz]);
  add(g, C(0.035, 0.035, 0.06), MAT.ledGreen(), [W / 2 + 0.06, H + 0.82, gz]);
  add(g, C(0.035, 0.035, 0.06), paint("#f5a623", 0.4, 0.1), [W / 2 + 0.06, H + 0.88, gz]);
  add(g, C(0.035, 0.035, 0.06), paint("#c0392b", 0.4, 0.1), [W / 2 + 0.06, H + 0.94, gz]);
  return g;
}

/* ------------------------------------------------------------------ */
/* 整烫：抽湿烫台 + 吊瓶熨斗 + 蒸汽锅炉 / 立体整烫机                     */
/* ------------------------------------------------------------------ */

/** 烫板：圆头长板 */
function boardGeo(len: number, w: number, t: number) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(len / 2, -r);
  s.lineTo(-len / 2 + r * 1.6, -r);
  s.quadraticCurveTo(-len / 2, -r * 0.8, -len / 2, 0);
  s.quadraticCurveTo(-len / 2, r * 0.8, -len / 2 + r * 1.6, r);
  s.lineTo(len / 2, r);
  s.lineTo(len / 2, -r);
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, 0);
  return geo;
}

function ironGeo() {
  const s = new THREE.Shape();
  s.moveTo(0.12, -0.055);
  s.lineTo(-0.06, -0.055);
  s.quadraticCurveTo(-0.13, -0.03, -0.14, 0);
  s.quadraticCurveTo(-0.13, 0.03, -0.06, 0.055);
  s.lineTo(0.12, 0.055);
  s.lineTo(0.12, -0.055);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** 抽湿烫台（带吊瓶熨斗、袖烫板、踏板）。操作员站在 +z 一侧 */
export function ironTable(variant: number) {
  const g = new THREE.Group();
  // 机柜
  add(g, RB(1.0, 0.78, 0.52, 0.03), MAT.machineCream(), [0.05, 0.42, -0.05]);
  for (let i = 0; i < 6; i++) add(g, B(0.6, 0.008, 0.005), MAT.machineGrey(), [0.05, 0.25 + i * 0.05, 0.215]);
  add(g, B(1.02, 0.04, 0.54), MAT.machineDark(), [0.05, 0.02, -0.05]);
  // 立柱 + 烫板（抽湿、带烫布）
  add(g, C(0.04, 0.04, 0.12), MAT.steel(), [0.05, 0.86, -0.05]);
  add(g, boardGeo(1.3, 0.48, 0.05), MAT.ironCover(), [0, 0.9, -0.05]);
  add(g, boardGeo(1.32, 0.5, 0.012), MAT.machineGrey(), [0, 0.89, -0.05]);
  // 摆臂袖烫板
  add(g, C(0.015, 0.015, 0.2), MAT.steel(), [-0.42, 0.88, 0.24]);
  add(g, boardGeo(0.48, 0.13, 0.03), MAT.ironCover(), [-0.55, 0.99, 0.32]);
  // 熨斗垫 + 熨斗
  add(g, RB(0.26, 0.012, 0.16, 0.005), paint("#7a8089", 0.9, 0), [0.45, 0.975, -0.05]);
  add(g, ironGeo(), MAT.chrome(), [0.46, 0.985, -0.05]);
  add(g, RB(0.2, 0.06, 0.1, 0.025, 3), MAT.plasticBlue(), [0.47, 1.05, -0.05]);
  add(g, RB(0.14, 0.03, 0.03, 0.012), MAT.plasticBlack(), [0.49, 1.14, -0.05]);
  for (const hx of [0.43, 0.55]) add(g, B(0.015, 0.06, 0.02), MAT.plasticBlack(), [hx, 1.1, -0.05]);
  // 吊瓶支架 + 弹簧吊线 + 蒸汽软管
  add(g, C(0.018, 0.018, 1.25), MAT.steel(), [0.55, 1.5, -0.32]);
  add(g, C(0.014, 0.014, 0.55), MAT.steel(), [0.42, 2.1, -0.18], [Math.PI / 2.6, 0, Math.PI / 2.2]);
  add(g, C(0.05, 0.05, 0.1, 16), MAT.machineDark(), [0.3, 2.06, -0.05]);
  add(g, tube([[0.3, 2.0, -0.05], [0.42, 1.6, -0.05], [0.48, 1.18, -0.05]], 0.006), MAT.rubber());
  add(g, tube([[0.55, 1.95, -0.3], [0.62, 1.5, -0.12], [0.56, 1.12, -0.05]], 0.012), paint("#c9a227", 0.6, 0));
  // 踏板（抽湿 / 喷汽）
  for (const px of [-0.12, 0.18]) add(g, RB(0.18, 0.04, 0.24, 0.01), MAT.plasticBlack(), [px, 0.04, 0.35], [-0.15, 0, 0]);
  // 正在烫的衣服
  const shirt = ["#a98559", "#ece2cc", "#8d929b", "#55633a"][variant % 4];
  add(g, RB(0.5, 0.012, 0.36, 0.006), fabric(shirt), [-0.12, 0.965, -0.05], [0, 0.1, 0]);
  return g;
}

/** 蒸汽锅炉（单独摆放，软管接到烫台） */
export function boilerUnit() {
  const g = new THREE.Group();
  steamBoiler(g, [0, 0, 0]);
  return g;
}

/** 立体整烫机（单独摆放） */
export function formFinisherUnit(shirt = "#a98559") {
  const g = new THREE.Group();
  formFinisher(g, [0, 0, 0], shirt);
  return g;
}

/** 蒸汽锅炉（电热） */
function steamBoiler(g: THREE.Group, at: V3) {
  const [x, , z] = at;
  add(g, RB(0.55, 0.12, 0.45, 0.02), MAT.frame(), [x, 0.06, z]);
  add(g, C(0.2, 0.2, 0.7, 28), MAT.machineCream(), [x, 0.5, z]);
  add(g, S(0.2, 24), MAT.machineCream(), [x, 0.85, z]);
  add(g, C(0.05, 0.05, 0.02, 20), MAT.chrome(), [x + 0.13, 0.7, z + 0.15], [Math.PI / 2.4, 0, -0.6]);
  add(g, C(0.042, 0.042, 0.022, 20), MAT.whiteTop(), [x + 0.135, 0.7, z + 0.155], [Math.PI / 2.4, 0, -0.6]);
  add(g, RB(0.16, 0.22, 0.06, 0.02), MAT.machineDark(), [x - 0.12, 0.55, z + 0.21]);
  add(g, B(0.03, 0.03, 0.005), MAT.ledGreen(), [x - 0.12, 0.6, z + 0.243]);
  add(g, tube([[x, 0.9, z], [x - 0.2, 1.05, z + 0.1], [x - 0.5, 0.9, z + 0.4], [x - 0.6, 0.6, z + 0.6]], 0.02), MAT.chrome());
  add(g, C(0.02, 0.02, 0.3), MAT.chrome(), [x + 0.15, 0.25, z - 0.12], [0, 0, Math.PI / 2]);
}

/** 立体整烫机：人台 + 衬衫 + 底座 */
function formFinisher(g: THREE.Group, at: V3, shirt: string) {
  const [x, , z] = at;
  add(g, RB(0.6, 0.85, 0.55, 0.04), MAT.machineGrey(), [x, 0.43, z]);
  add(g, RB(0.3, 0.16, 0.04, 0.02), MAT.plasticBlack(), [x, 0.75, z + 0.29]);
  for (let i = 0; i < 3; i++) add(g, C(0.018, 0.018, 0.02, 12), [MAT.ledGreen(), MAT.red(), MAT.yellow()][i], [x - 0.08 + i * 0.08, 0.75, z + 0.315], [Math.PI / 2, 0, 0]);
  add(g, C(0.05, 0.05, 0.3), MAT.chrome(), [x, 1.0, z]);
  // 人台（旋转体）
  const prof = [
    [0.0, 0.0],
    [0.17, 0.0],
    [0.19, 0.12],
    [0.17, 0.3],
    [0.2, 0.5],
    [0.21, 0.6],
    [0.12, 0.68],
    [0.05, 0.72],
    [0.0, 0.72],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.LatheGeometry(prof, 28);
  torso.scale(1, 1, 0.65);
  add(g, torso, fabric(shirt), [x, 1.15, z]);
  add(g, C(0.045, 0.05, 0.1, 16), fabric(shirt), [x, 1.9, z]);
  for (const sx of [-1, 1]) add(g, CAP(0.055, 0.28), fabric(shirt), [x + sx * 0.25, 1.6, z], [0, 0, sx * 0.35]);
}

/** 挂衣架：一排挂好的成衣 */
export function garmentRack(colors: string[]) {
  const g = new THREE.Group();
  for (const sx of [-0.7, 0.7]) {
    add(g, C(0.015, 0.015, 1.6), MAT.chrome(), [sx, 0.85, 0]);
    add(g, B(0.04, 0.03, 0.5), MAT.chrome(), [sx, 0.06, 0]);
    for (const sz of [-0.22, 0.22]) add(g, S(0.03, 10), MAT.rubber(), [sx, 0.03, sz]);
  }
  add(g, C(0.012, 0.012, 1.42), MAT.chrome(), [0, 1.65, 0], [0, 0, Math.PI / 2]);
  const shirt = new THREE.Shape();
  shirt.moveTo(-0.08, 0);
  shirt.lineTo(-0.2, -0.06);
  shirt.lineTo(-0.25, -0.22);
  shirt.lineTo(-0.17, -0.25);
  shirt.lineTo(-0.15, -0.16);
  shirt.lineTo(-0.15, -0.66);
  shirt.lineTo(0.15, -0.66);
  shirt.lineTo(0.15, -0.16);
  shirt.lineTo(0.17, -0.25);
  shirt.lineTo(0.25, -0.22);
  shirt.lineTo(0.2, -0.06);
  shirt.lineTo(0.08, 0);
  shirt.quadraticCurveTo(0, -0.05, -0.08, 0);
  const sg = new THREE.ExtrudeGeometry(shirt, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 });
  colors.forEach((c, i) => {
    const x = -0.6 + (i * 1.2) / Math.max(1, colors.length - 1);
    add(g, sg, fabric(c), [x, 1.58, 0.02], [0, Math.PI / 2 - 0.1, 0]);
    add(g, new THREE.TorusGeometry(0.03, 0.004, 6, 12, Math.PI * 1.4), MAT.chrome(), [x, 1.63, 0], [0, Math.PI / 2, 0]);
  });
  return g;
}

/* ------------------------------------------------------------------ */
/* 验收：灯箱验货台                                                     */
/* ------------------------------------------------------------------ */

export function inspectionStation(variant: number) {
  const g = new THREE.Group();
  const H = 0.88;
  add(g, RB(1.7, 0.06, 0.85, 0.02), MAT.whiteTop(), [0, H, 0]);
  add(g, B(1.5, 0.004, 0.65), std("lightbox", { color: "#ffffff", emissive: "#f3f7ff", emissiveIntensity: 0.6, roughness: 0.4 }), [0, H + 0.032, 0]);
  for (const sx of [-0.78, 0.78]) {
    for (const sz of [-0.36, 0.36]) add(g, B(0.04, H - 0.03, 0.04), MAT.steel(), [sx, (H - 0.03) / 2, sz]);
    add(g, B(0.04, 0.04, 0.76), MAT.steel(), [sx, 0.2, 0]);
  }
  add(g, RB(1.5, 0.02, 0.6, 0.01), MAT.machineGrey(), [0, 0.25, 0]); // 底层板
  for (let i = 0; i < 3; i++) add(g, RB(0.34, 0.05, 0.26, 0.02), fabric(["#a98559", "#ece2cc", "#2a2b30"][(i + variant) % 3]), [-0.5 + i * 0.4, 0.3, 0]);
  // 顶部灯架
  for (const sx of [-0.78, 0.78]) add(g, B(0.035, 1.15, 0.035), MAT.steel(), [sx, H + 0.6, -0.38]);
  add(g, B(1.6, 0.035, 0.035), MAT.steel(), [0, H + 1.18, -0.38]);
  add(g, RB(1.4, 0.04, 0.1, 0.015), MAT.machineGrey(), [0, H + 1.12, -0.25]);
  add(g, B(1.36, 0.01, 0.06), MAT.lamp(), [0, H + 1.095, -0.25]);
  // 桌上：叠好的合格品、次品筐、吊牌枪、卷尺
  for (let i = 0; i < 4; i++) add(g, RB(0.32, 0.025, 0.26, 0.01), fabric("#e9e2d1"), [0.5, H + 0.045 + i * 0.026, 0.1]);
  add(g, RB(0.3, 0.12, 0.22, 0.02), paint("#d94841", 0.6, 0), [-0.6, H + 0.09, -0.2]);
  add(g, RB(0.12, 0.04, 0.03, 0.01), MAT.plasticBlue(), [0.1, H + 0.05, 0.25]);
  add(g, C(0.035, 0.035, 0.02, 16), MAT.yellow(), [-0.1, H + 0.04, 0.25]);
  add(g, RB(0.38, 0.016, 0.28, 0.01), fabric(["#a98559", "#8d929b"][variant % 2]), [-0.1, H + 0.04, -0.02], [0, 0.2, 0]);
  return g;
}

/* ------------------------------------------------------------------ */
/* 仓储：横梁式货架、托盘、纸箱、叉车、地牛                               */
/* ------------------------------------------------------------------ */

/** 一跨货架（长 bay 沿 z，深 depth 沿 x），levels 层（含地面层） */
export function palletRackBay(bay = 2.7, depth = 1.1, height = 4.4, levels = [1.55, 3.0]) {
  const g = new THREE.Group();
  const up = (x: number, z: number) => {
    add(g, B(0.09, height, 0.07), MAT.rackBlue(), [x, height / 2, z]);
    add(g, B(0.18, 0.012, 0.16), MAT.steel(), [x, 0.006, z]);
  };
  for (const z of [-bay / 2, bay / 2]) {
    up(-depth / 2, z);
    up(depth / 2, z);
    // 侧片斜撑
    for (let y = 0.3; y < height - 0.6; y += 0.8) {
      const len = Math.hypot(depth, 0.8);
      add(g, C(0.012, 0.012, len, 6), MAT.rackBlue(), [0, y + 0.4, z], [0, 0, Math.atan2(depth, 0.8) * ((Math.round(y / 0.8) % 2) * 2 - 1)]);
      add(g, B(depth, 0.025, 0.025), MAT.rackBlue(), [0, y, z]);
    }
  }
  for (const y of levels) {
    for (const x of [-depth / 2, depth / 2]) {
      add(g, B(0.05, 0.12, bay - 0.07), MAT.orange(), [x, y, 0]);
    }
    add(g, B(depth, 0.012, bay - 0.08), MAT.wire(), [0, y + 0.06, 0]);
    for (let k = -2; k <= 2; k++) add(g, B(depth - 0.05, 0.03, 0.03), MAT.steel(), [0, y + 0.05, k * 0.5]);
  }
  // 防撞护脚
  for (const z of [-bay / 2, bay / 2]) add(g, RB(0.16, 0.4, 0.14, 0.02), MAT.yellow(), [depth / 2 + 0.05, 0.2, z]);
  return g;
}

/* ------------------------------------------------------------------ */
/* 线架：白色层板货架（洞洞板背板、层板前沿翻边），原点在地面中心，正面朝 +z  */
/* ------------------------------------------------------------------ */

export const THREAD_SHELF = { w: 1.0, d: 0.45, h: 2.35 };

/** 第 level 层（从下往上，1 开始）层板上表面的高度 */
export function shelfLevelY(level: number, levels: number) {
  const bottom = 0.14;
  const top = THREAD_SHELF.h - 0.26;
  return levels <= 1 ? bottom : bottom + ((level - 1) * (top - bottom)) / (levels - 1);
}

export function threadShelf(levels: number) {
  const g = new THREE.Group();
  const { w: W, d: D, h: H } = THREAD_SHELF;
  // 立柱（带冲孔的方管，前后各两根）
  for (const x of [-W / 2, W / 2]) {
    for (const z of [-D / 2 + 0.03, D / 2 - 0.02]) {
      add(g, B(0.04, H, 0.03), MAT.shelfWhite(), [x, H / 2, z]);
      add(g, B(0.06, 0.012, 0.06), MAT.steel(), [x, 0.006, z]);
    }
    // 侧面横撑
    for (const y of [0.05, H - 0.04]) add(g, B(0.03, 0.03, D - 0.05), MAT.shelfWhite(), [x, y, 0]);
  }
  // 洞洞板背板
  add(g, B(W, H - 0.12, 0.012), MAT.pegboard(), [0, (H - 0.12) / 2 + 0.06, -D / 2 + 0.03]);
  // 层板：板面 + 前沿翻边 + 两侧托架
  for (let i = 1; i <= levels; i++) {
    const y = shelfLevelY(i, levels);
    add(g, B(W - 0.02, 0.018, D - 0.04), MAT.shelfWhite(), [0, y - 0.009, 0.005]);
    add(g, B(W - 0.02, 0.05, 0.012), MAT.shelfWhite(), [0, y - 0.025, D / 2 - 0.012]);
    for (const x of [-W / 2 + 0.03, W / 2 - 0.03]) add(g, B(0.012, 0.07, D * 0.6), MAT.shelfWhite(), [x, y - 0.05, -0.02]);
  }
  // 顶上放几个纸箱（照片里架顶都堆着备用的线箱）
  add(g, RB(0.42, 0.3, 0.36, 0.01, 1), MAT.carton(), [-0.24, H + 0.15, -0.02]);
  add(g, RB(0.36, 0.26, 0.34, 0.01, 1), MAT.carton(), [0.22, H + 0.13, 0.0], [0, 0.08, 0]);
  return g;
}

export function pallet() {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) add(g, B(1.2, 0.022, 0.1), MAT.wood(), [0, 0.133, -0.45 + i * 0.15]);
  for (const x of [-0.55, 0, 0.55]) {
    for (const z of [-0.45, 0, 0.45]) add(g, B(0.14, 0.078, 0.14), MAT.wood(), [x, 0.083, z]);
    add(g, B(0.14, 0.022, 1.0), MAT.wood(), [x, 0.033, 0]);
  }
  for (const z of [-0.45, 0, 0.45]) add(g, B(1.2, 0.022, 0.1), MAT.wood(), [0, 0.011, z]);
  return g;
}

/** 托盘 + 纸箱（n ≤ 16） */
export function cartonPallet(n: number) {
  const g = pallet();
  const cart = RB(0.58, 0.38, 0.48, 0.012, 1);
  for (let i = 0; i < n; i++) {
    const layer = Math.floor(i / 4);
    const k = i % 4;
    add(g, cart, MAT.carton(), [-0.3 + (k % 2) * 0.6, 0.144 + 0.19 + layer * 0.385, -0.245 + Math.floor(k / 2) * 0.49]);
  }
  return g;
}

export function forklift() {
  const g = new THREE.Group();
  const body = paint("#f2a31b", 0.45, 0.25);
  add(g, RB(1.0, 0.6, 1.5, 0.08, 3), body, [0, 0.55, 0]);
  add(g, RB(0.9, 0.45, 0.5, 0.1, 3), MAT.machineDark(), [0, 0.6, 0.85]); // 配重
  for (const sx of [-0.52, 0.52]) {
    for (const sz of [-0.5, 0.55]) {
      add(g, C(0.26, 0.26, 0.2, 24), MAT.rubber(), [sx, 0.26, sz], [0, 0, Math.PI / 2]);
      add(g, C(0.13, 0.13, 0.21, 16), MAT.steel(), [sx, 0.26, sz], [0, 0, Math.PI / 2]);
    }
  }
  // 护顶架
  for (const sx of [-0.42, 0.42]) for (const sz of [-0.35, 0.65]) add(g, B(0.05, 1.3, 0.05), MAT.machineDark(), [sx, 1.5, sz]);
  add(g, RB(0.95, 0.05, 1.1, 0.02), MAT.machineDark(), [0, 2.15, 0.15]);
  add(g, RB(0.45, 0.12, 0.45, 0.04), MAT.plasticBlack(), [0, 0.92, 0.3]); // 座椅
  add(g, RB(0.45, 0.4, 0.08, 0.04), MAT.plasticBlack(), [0, 1.12, 0.52]);
  add(g, C(0.13, 0.13, 0.03, 20), MAT.plasticBlack(), [0, 1.25, -0.2], [-0.9, 0, 0]); // 方向盘
  // 门架 + 货叉
  for (const sx of [-0.32, 0.32]) add(g, B(0.08, 2.3, 0.1), MAT.machineDark(), [sx, 1.2, -0.85]);
  add(g, B(0.72, 0.06, 0.08), MAT.machineDark(), [0, 2.3, -0.85]);
  add(g, B(0.72, 0.4, 0.05), MAT.machineDark(), [0, 0.35, -0.92]);
  for (const sx of [-0.22, 0.22]) add(g, B(0.1, 0.04, 1.1), MAT.steel(), [sx, 0.1, -1.45]);
  add(g, C(0.05, 0.05, 0.05, 12), paint("#ff8a00", 0.3, 0.1), [0, 2.2, 0.6]); // 警示灯
  return g;
}

/** 手动地牛（液压搬运车） */
export function palletJack() {
  const g = new THREE.Group();
  for (const sx of [-0.2, 0.2]) add(g, B(0.16, 0.06, 1.15), paint("#3b3833", 0.45, 0.4), [sx, 0.06, -0.55]);
  add(g, RB(0.56, 0.3, 0.2, 0.04), paint("#3b3833", 0.45, 0.4), [0, 0.2, 0.08]);
  add(g, C(0.03, 0.03, 1.1), MAT.machineDark(), [0, 0.7, 0.3], [-0.35, 0, 0]);
  add(g, new THREE.TorusGeometry(0.1, 0.02, 8, 18), MAT.plasticBlack(), [0, 1.22, 0.5], [0.3, 0, 0]);
  for (const sx of [-0.12, 0.12]) add(g, C(0.09, 0.09, 0.06, 16), MAT.rubber(), [sx, 0.09, 0.12], [0, 0, Math.PI / 2]);
  return g;
}

/** 在制品周转车：两层、带轮，车间里堆扎的 */
export function wipTrolley(w = 1.2, d = 0.7) {
  const g = new THREE.Group();
  for (const y of [0.18, 0.12]) add(g, RB(w, 0.025, d, 0.008), MAT.steel(), [0, y, 0]);
  for (const sx of [-w / 2 + 0.04, w / 2 - 0.04]) {
    for (const sz of [-d / 2 + 0.04, d / 2 - 0.04]) {
      add(g, C(0.045, 0.045, 0.035, 14), MAT.rubber(), [sx, 0.045, sz], [0, 0, Math.PI / 2]);
    }
    add(g, B(0.025, 0.7, 0.025), MAT.steel(), [sx, 0.52, -d / 2 + 0.02]);
  }
  add(g, C(0.012, 0.012, w - 0.08), MAT.steel(), [0, 0.86, -d / 2 + 0.02], [0, 0, Math.PI / 2]);
  return g;
}

/** 送货推车（通道里来回跑的） */
export function bundleCart(color: string) {
  const g = wipTrolley(1.0, 0.65);
  for (let i = 0; i < 6; i++) {
    add(g, RB(0.42, 0.18, 0.3, 0.04, 3), fabric(color), [-0.22 + (i % 2) * 0.44, 0.29 + Math.floor(i / 2) * 0.19, 0.02]);
  }
  return g;
}

/* ------------------------------------------------------------------ */
/* 厂房构件                                                             */
/* ------------------------------------------------------------------ */

/** H 型钢柱 */
export function steelColumn(h: number) {
  const s = new THREE.Shape();
  const w = 0.3;
  const d = 0.3;
  const t = 0.025;
  const tw = 0.016;
  s.moveTo(-w / 2, -d / 2);
  s.lineTo(w / 2, -d / 2);
  s.lineTo(w / 2, -d / 2 + t);
  s.lineTo(tw / 2, -d / 2 + t);
  s.lineTo(tw / 2, d / 2 - t);
  s.lineTo(w / 2, d / 2 - t);
  s.lineTo(w / 2, d / 2);
  s.lineTo(-w / 2, d / 2);
  s.lineTo(-w / 2, d / 2 - t);
  s.lineTo(-tw / 2, d / 2 - t);
  s.lineTo(-tw / 2, -d / 2 + t);
  s.lineTo(-w / 2, -d / 2 + t);
  s.lineTo(-w / 2, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  const g = new THREE.Group();
  add(g, geo, paint("#a1a1a6", 0.5, 0.4), [0, 0, 0]);
  add(g, B(0.45, 0.03, 0.45), paint("#a1a1a6", 0.5, 0.4), [0, 0.015, 0]);
  add(g, B(0.32, 0.8, 0.32), paint("#a1a1a6", 0.5, 0.4), [0, 0.4, 0]);
  return g;
}

/** 屋架（三角桁架）：跨度 span 沿 z */
export function roofTruss(span: number, base: number, rise: number) {
  const g = new THREE.Group();
  const m = paint("#a1a1a6", 0.5, 0.4);
  const beam = (a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    const len = a.distanceTo(b);
    const mesh = add(g, B(r, r, len), m);
    mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
    mesh.lookAt(b);
  };
  const half = span / 2;
  const bottomL = new THREE.Vector3(0, base, -half);
  const bottomR = new THREE.Vector3(0, base, half);
  const top = new THREE.Vector3(0, base + rise, 0);
  beam(bottomL, bottomR, 0.1);
  beam(bottomL, top, 0.12);
  beam(top, bottomR, 0.12);
  const n = 8;
  for (let i = 1; i < n; i++) {
    const z = -half + (i * span) / n;
    const yTop = base + rise * (1 - Math.abs(z) / half);
    beam(new THREE.Vector3(0, base, z), new THREE.Vector3(0, yTop, z), 0.05);
    if (i < n - 1) {
      const z2 = -half + ((i + 1) * span) / n;
      const yTop2 = base + rise * (1 - Math.abs(z2) / half);
      beam(new THREE.Vector3(0, base, z), new THREE.Vector3(0, yTop2, z2), 0.04);
    }
  }
  return g;
}

/** 工矿灯 */
export function highBayLamp(drop: number) {
  const g = new THREE.Group();
  add(g, C(0.006, 0.006, drop), MAT.machineDark(), [0, -drop / 2, 0]);
  add(g, C(0.12, 0.12, 0.08, 20), MAT.machineDark(), [0, -drop - 0.04, 0]);
  add(g, C(0.12, 0.28, 0.18, 24, ), paint("#c9ced6", 0.3, 0.8), [0, -drop - 0.17, 0]);
  add(g, C(0.26, 0.26, 0.01, 24), MAT.lamp(), [0, -drop - 0.26, 0]);
  return g;
}

export function fireExtinguisher() {
  const g = new THREE.Group();
  add(g, C(0.08, 0.08, 0.5, 18), MAT.red(), [0, 0.35, 0]);
  add(g, S(0.08, 16), MAT.red(), [0, 0.6, 0]);
  add(g, B(0.04, 0.08, 0.04), MAT.machineDark(), [0, 0.7, 0]);
  add(g, tube([[0, 0.7, 0.02], [0.08, 0.6, 0.06], [0.08, 0.35, 0.08]], 0.01), MAT.rubber());
  add(g, RB(0.35, 0.05, 0.35, 0.01), MAT.red(), [0, 0.025, 0]);
  return g;
}

export function electricalCabinet() {
  const g = new THREE.Group();
  add(g, RB(0.8, 1.9, 0.45, 0.02), paint("#c9ced6", 0.45, 0.4), [0, 0.95, 0]);
  add(g, B(0.005, 1.7, 0.01), MAT.machineDark(), [0, 0.95, 0.226]);
  add(g, B(0.12, 0.08, 0.01), paint("#f2c230", 0.5, 0.1), [0.2, 1.6, 0.228]);
  for (let i = 0; i < 3; i++) add(g, C(0.02, 0.02, 0.02, 12), [MAT.ledGreen(), MAT.red(), MAT.yellow()][i], [-0.2 + i * 0.08, 1.6, 0.235], [Math.PI / 2, 0, 0]);
  return g;
}

export function exitSign() {
  const g = new THREE.Group();
  add(g, RB(0.4, 0.16, 0.04, 0.01), MAT.green(), [0, 0, 0]);
  return g;
}

/* ------------------------------------------------------------------ */
/* 人物                                                                */
/* ------------------------------------------------------------------ */

const SHIRTS = ["#2b2b2e", "#e9e3d8", "#8c7b6b", "#3d4a5c", "#c9b8a3", "#5c5048", "#d8cfc4", "#6b6f73"];

/** 员工：seated=坐着（车缝），否则站着；arms 单独一组，方便做动作 */
export function person(seed: number, seated: boolean) {
  const rnd = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  const shirt = fabric(SHIRTS[Math.floor(rnd(1) * SHIRTS.length)]);
  const pants = rnd(2) > 0.4 ? MAT.jeans() : fabric("#3a3a40");
  const body = new THREE.Group();
  const hipY = seated ? 0.5 : 0.9;
  const lean = seated ? -0.18 : -0.08;

  // 腿
  for (const sx of [-0.095, 0.095]) {
    if (seated) {
      add(body, CAP(0.068, 0.3), pants, [sx, hipY + 0.02, -0.17], [Math.PI / 2, 0, 0]);
      add(body, CAP(0.055, 0.3), pants, [sx, 0.27, -0.35], [0.1, 0, 0]);
      add(body, RB(0.1, 0.07, 0.25, 0.03, 2), MAT.shoe(), [sx, 0.035, -0.42]);
    } else {
      add(body, CAP(0.07, 0.32), pants, [sx, 0.67, 0]);
      add(body, CAP(0.056, 0.32), pants, [sx, 0.28, 0.01]);
      add(body, RB(0.1, 0.07, 0.25, 0.03, 2), MAT.shoe(), [sx, 0.035, -0.04]);
    }
  }
  // 躯干（略前倾）
  const torso = new THREE.Group();
  torso.position.set(0, hipY, 0);
  torso.rotation.x = lean;
  body.add(torso);
  add(torso, RB(0.32, 0.18, 0.21, 0.07, 3), pants, [0, 0.04, 0]);
  add(torso, RB(0.37, 0.44, 0.22, 0.09, 4), shirt, [0, 0.33, 0]);
  if (rnd(3) > 0.5) add(torso, RB(0.33, 0.5, 0.02, 0.01, 1), fabric("#3a3633"), [0, 0.27, -0.115]); // 围裙
  add(torso, C(0.05, 0.055, 0.1, 12), MAT.skin(), [0, 0.58, 0]);
  // 头
  const head = new THREE.Group();
  head.position.set(0, 0.72, -0.01);
  head.rotation.x = seated ? 0.35 : 0.25; // 低头看活
  torso.add(head);
  add(head, S(0.105, 20), MAT.skin(), [0, 0, 0]).scale.set(1, 1.15, 1.05);
  const hairM = MAT.hair();
  const cap = new THREE.SphereGeometry(0.112, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  add(head, cap, hairM, [0, 0.02, 0.008]).scale.set(1, 1.12, 1.08);
  if (rnd(4) > 0.35) add(head, S(0.05, 12), hairM, [0, 0.0, 0.11]); // 发髻
  if (rnd(5) > 0.75) add(head, new THREE.SphereGeometry(0.118, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), fabric("#f4f4f4"), [0, 0.03, 0]); // 工作帽

  // 手臂（肩部为轴，向前伸到台面）
  const arms = new THREE.Group();
  arms.position.set(0, 0.5, 0);
  torso.add(arms);
  for (const sx of [-0.215, 0.215]) {
    const a1 = seated ? 0.35 : 0.45;
    const a2 = seated ? 1.55 : 1.15;
    const shoulder = new THREE.Vector3(sx, 0, 0);
    const elbow = shoulder.clone().add(new THREE.Vector3(0, -0.26 * Math.cos(a1), -0.26 * Math.sin(a1)));
    const hand = elbow.clone().add(new THREE.Vector3(-sx * 0.25, -0.24 * Math.cos(a2), -0.24 * Math.sin(a2)));
    const seg = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) => {
      const mesh = add(arms, CAP(r, a.distanceTo(b) - r), m);
      mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    };
    seg(shoulder, elbow, 0.05, shirt);
    seg(elbow, hand, 0.042, MAT.skin());
    add(arms, S(0.045, 10), MAT.skin(), [hand.x, hand.y, hand.z]).scale.set(1, 0.6, 1.3);
  }

  // 身体合并成几个网格；手臂单独合并，挂在肩部支点上，方便做「干活」的小动作
  body.updateMatrixWorld(true);
  const pivotMatrix = arms.matrixWorld.clone();
  torso.remove(arms);
  arms.position.set(0, 0, 0);
  const bakedBody = bake(body);
  const bakedArms = bake(arms);
  const pivot = new THREE.Group();
  pivot.applyMatrix4(pivotMatrix);
  pivot.add(bakedArms);
  const root = new THREE.Group();
  root.add(bakedBody, pivot);
  // 人是每人一个，不是共享原型：重建时要释放
  root.traverse((o) => {
    const g = (o as THREE.Mesh).geometry;
    if (g) g.userData.shared = false;
  });
  return { root, arms: bakedArms };
}

/* ------------------------------------------------------------------ */
/* 裁剪车间：长裁床（尺寸可调）、铺布机                                  */
/* ------------------------------------------------------------------ */

export const CUT_H = 0.88;

/** 长裁床：宽 W（x）× 长 L（z）。桌面一半铺着多层布 + 唛架纸，桌尾布卷架，桌头放裁好的扎 */
export function cutTable(W: number, L: number) {
  const g = new THREE.Group();
  const H = CUT_H;
  longTable(g, W, L, H, MAT.whiteTop());
  // 桌下层板（放唛架纸、布头）
  add(g, B(W - 0.2, 0.02, L - 0.3), MAT.machineGrey(), [0, 0.2, 0]);
  for (let i = 0; i < Math.floor(L / 2.5); i++) add(g, C(0.05, 0.05, W - 0.4, 16), MAT.whiteTop(), [0, 0.26, -L / 2 + 1 + i * 2.5], [0, 0, Math.PI / 2]);
  const c = "#a98559";
  const spreadL = Math.max(1, L * 0.62);
  const sz = -L / 2 + 0.35 + spreadL / 2;
  const fw = Math.max(0.4, W - 0.3);
  for (let i = 0; i < 8; i++) {
    add(g, B(fw, 0.01, spreadL), fabric(i % 2 ? c : "#b8946a"), [0, H + 0.03 + i * 0.01, sz]);
  }
  add(g, B(fw, 0.002, spreadL), MAT.marker(), [0, H + 0.111, sz]);
  // 压布铁块
  for (let i = 0; i < Math.floor(spreadL / 1.4); i++) add(g, RB(0.16, 0.05, 0.08, 0.01), MAT.machineDark(), [fw / 2 - 0.12, H + 0.14, sz - spreadL / 2 + 0.6 + i * 1.4]);
  straightKnife(g, [0.15, H + 0.112, sz + spreadL / 2 - 0.4]);
  // 已裁好的裁片（一摞一摞）+ 剪刀、卷尺、划粉
  const piecesZ = sz + spreadL / 2 + 0.6;
  for (let i = 0; i < 4; i++) add(g, RB(0.38, 0.06 + (i % 2) * 0.03, 0.3, 0.02), fabric(i % 2 ? c : "#8d929b"), [-W / 2 + 0.35 + (i % 2) * 0.45, H + 0.05, piecesZ + Math.floor(i / 2) * 0.4]);
  add(g, B(0.22, 0.008, 0.02), MAT.chrome(), [0.3, H + 0.03, piecesZ], [0, 0.4, 0]);
  add(g, RB(0.08, 0.02, 0.05, 0.008), MAT.red(), [0.4, H + 0.035, piecesZ - 0.05], [0, 0.4, 0]);
  add(g, C(0.035, 0.035, 0.025, 16), MAT.yellow(), [0.15, H + 0.04, piecesZ + 0.25]);
  add(g, B(0.06, 0.012, 0.025), MAT.whiteTop(), [0.35, H + 0.035, piecesZ + 0.3]);
  // 桌尾布卷架 + 一卷布
  for (const sx of [-W / 2 + 0.05, W / 2 - 0.05]) add(g, B(0.05, 0.55, 0.05), MAT.steel(), [sx, H + 0.27, -L / 2 + 0.1]);
  add(g, C(0.17, 0.17, W - 0.2, 28), fabric(c), [0, H + 0.5, -L / 2 + 0.1], [0, 0, Math.PI / 2]);
  add(g, C(0.03, 0.03, W + 0.05), MAT.chrome(), [0, H + 0.5, -L / 2 + 0.1], [0, 0, Math.PI / 2]);
  return g;
}

/** 铺布机：骑在裁床导轨上（桌面高度 0.88m），宽 W 跟裁床一样 */
export function spreaderUnit(W: number) {
  const g = new THREE.Group();
  spreader(g, W, CUT_H, 0, "#a98559");
  return g;
}

/* ------------------------------------------------------------------ */
/* 工作台（包装台 / 分扎台 / 收发台），尺寸可调                          */
/* ------------------------------------------------------------------ */

export function workTable(W: number, D: number) {
  const g = new THREE.Group();
  const H = 0.85;
  add(g, RB(W, 0.04, D, 0.012), MAT.officeTop(), [0, H, 0]);
  add(g, B(W, 0.03, 0.012), MAT.skirting(), [0, H - 0.02, D / 2]);
  for (const sx of [-W / 2 + 0.05, W / 2 - 0.05]) {
    for (const sz of [-D / 2 + 0.05, D / 2 - 0.05]) {
      add(g, B(0.04, H - 0.02, 0.04), MAT.steel(), [sx, (H - 0.02) / 2, sz]);
      add(g, C(0.025, 0.025, 0.015), MAT.rubber(), [sx, 0.008, sz]);
    }
  }
  add(g, B(W - 0.1, 0.02, D - 0.1), MAT.machineGrey(), [0, 0.2, 0]);
  // 下层：纸箱
  const boxes = Math.max(1, Math.floor((W - 0.2) / 0.65));
  for (let i = 0; i < boxes; i++) add(g, RB(0.5, 0.32, Math.min(0.4, D - 0.2), 0.01, 1), MAT.carton(), [-W / 2 + 0.4 + i * 0.65, 0.37, -0.05]);
  // 台面：叠好的衣服、扎票、吊牌枪、胶带
  const cols = ["#a98559", "#e9e1d3", "#1f1e22", "#7d6a58"];
  for (let i = 0; i < 12; i++) {
    const x = -W / 2 + 0.3 + i * 0.45;
    if (x > W / 2 - 0.25) break;
    for (let k = 0; k < 2 + (i % 3); k++) add(g, RB(0.34, 0.03, 0.26, 0.01), fabric(cols[i % cols.length]), [x, H + 0.035 + k * 0.031, -D / 2 + 0.2]);
  }
  add(g, RB(0.12, 0.04, 0.03, 0.01), MAT.plasticBlue(), [W / 2 - 0.3, H + 0.04, D / 2 - 0.15], [0, 0.5, 0]);
  add(g, new THREE.TorusGeometry(0.05, 0.022, 10, 20), paint("#c9a86a", 0.6, 0), [W / 2 - 0.15, H + 0.045, D / 2 - 0.25], [Math.PI / 2, 0, 0]);
  add(g, B(0.2, 0.002, 0.14), MAT.whiteTop(), [0, H + 0.022, D / 2 - 0.15], [0, 0.15, 0]);
  return g;
}

/* ------------------------------------------------------------------ */
/* 办公室、卫生间                                                       */
/* ------------------------------------------------------------------ */

/** 办公桌：桌子 + 抽屉柜 + 显示器 + 键盘 + 办公椅（人坐在 +z 一侧） */
export function officeDesk() {
  const g = new THREE.Group();
  const H = 0.74;
  const W = 1.4;
  const D = 0.7;
  add(g, RB(W, 0.03, D, 0.01), MAT.officeTop(), [0, H, 0]);
  for (const sx of [-W / 2 + 0.03, W / 2 - 0.03]) add(g, B(0.03, H - 0.02, D - 0.04), MAT.machineGrey(), [sx, (H - 0.02) / 2, 0]);
  add(g, B(W - 0.06, 0.35, 0.015), MAT.machineGrey(), [0, H - 0.25, -D / 2 + 0.05]);
  // 抽屉柜
  add(g, RB(0.4, 0.58, 0.52, 0.01), MAT.machineGrey(), [W / 2 - 0.28, 0.31, 0.02]);
  for (let i = 0; i < 3; i++) add(g, B(0.12, 0.012, 0.01), MAT.chrome(), [W / 2 - 0.28, 0.5 - i * 0.18, 0.285]);
  // 显示器
  add(g, RB(0.22, 0.01, 0.16, 0.004), MAT.plasticBlack(), [0, H + 0.02, -0.18]);
  add(g, B(0.04, 0.26, 0.03), MAT.plasticBlack(), [0, H + 0.15, -0.2]);
  add(g, RB(0.62, 0.38, 0.03, 0.01), MAT.plasticBlack(), [0, H + 0.38, -0.18]);
  add(g, B(0.58, 0.34, 0.002), MAT.glassScreen(), [0, H + 0.38, -0.164]);
  // 键盘、鼠标、文件、杯子
  add(g, RB(0.44, 0.02, 0.14, 0.005), MAT.plasticBlack(), [0, H + 0.025, 0.12]);
  add(g, RB(0.06, 0.025, 0.1, 0.02), MAT.plasticBlack(), [0.32, H + 0.025, 0.13]);
  for (let i = 0; i < 3; i++) add(g, B(0.21, 0.004, 0.297), MAT.whiteTop(), [-0.5, H + 0.02 + i * 0.005, 0.05], [0, 0.1 * i, 0]);
  add(g, C(0.04, 0.035, 0.1, 16), MAT.ceramic(), [0.55, H + 0.065, -0.1]);
  officeChair(g, [0, 0, 0.6]);
  return g;
}

/** 文件柜（铁皮，两扇门） */
export function fileCabinet() {
  const g = new THREE.Group();
  add(g, RB(0.9, 1.95, 0.45, 0.01), paint("#d4d8dd", 0.45, 0.35), [0, 0.975, 0]);
  add(g, B(0.004, 1.85, 0.005), MAT.machineDark(), [0, 0.98, 0.226]);
  for (const sx of [-0.05, 0.05]) add(g, B(0.015, 0.16, 0.02), MAT.chrome(), [sx, 1.0, 0.235]);
  add(g, B(0.9, 0.05, 0.45), MAT.machineDark(), [0, 0.025, 0]);
  // 顶上的文件盒
  for (let i = 0; i < 4; i++) add(g, B(0.08, 0.3, 0.3), paint(["#a8865a", "#3a312b", "#e9e1d3", "#7d6a58"][i], 0.6, 0), [-0.3 + i * 0.1, 2.1, 0]);
  return g;
}

/** 马桶（背靠 -z 墙） */
export function toilet() {
  const g = new THREE.Group();
  add(g, C(0.13, 0.11, 0.38, 20), MAT.ceramic(), [0, 0.19, 0.05]);
  const bowl = add(g, S(0.2, 24), MAT.ceramic(), [0, 0.38, 0.12]);
  bowl.scale.set(0.95, 0.35, 1.2);
  add(g, RB(0.38, 0.03, 0.45, 0.012), MAT.ceramic(), [0, 0.44, 0.1]);
  add(g, RB(0.42, 0.38, 0.18, 0.03), MAT.ceramic(), [0, 0.62, -0.17]);
  add(g, RB(0.08, 0.02, 0.05, 0.01), MAT.chrome(), [0, 0.82, -0.17]);
  return g;
}

/** 洗手台 + 镜子（挂在 -z 墙上） */
export function washBasin() {
  const g = new THREE.Group();
  add(g, RB(0.55, 0.16, 0.42, 0.04), MAT.ceramic(), [0, 0.8, -0.04]);
  add(g, C(0.05, 0.04, 0.6, 16), MAT.ceramic(), [0, 0.42, -0.14]);
  add(g, C(0.012, 0.012, 0.14), MAT.chrome(), [0, 0.95, -0.2]);
  add(g, C(0.01, 0.01, 0.12), MAT.chrome(), [0, 1.02, -0.15], [Math.PI / 2, 0, 0]);
  add(g, RB(0.6, 0.8, 0.02, 0.01), MAT.mirror(), [0, 1.5, -0.23]);
  add(g, RB(0.12, 0.2, 0.08, 0.02), MAT.ceramic(), [0.45, 1.15, -0.2]);
  return g;
}

/** 绿植 */
export function plant() {
  const g = new THREE.Group();
  add(g, C(0.2, 0.15, 0.4, 20), paint("#e8e4dc", 0.6, 0), [0, 0.2, 0]);
  add(g, C(0.18, 0.18, 0.02, 20), paint("#4a3a2a", 1, 0), [0, 0.39, 0]);
  add(g, C(0.015, 0.02, 0.6), paint("#5a4632", 0.9, 0), [0, 0.7, 0]);
  const blobs: V3[] = [[0, 1.15, 0], [0.15, 0.95, 0.05], [-0.14, 1.0, -0.06], [0.05, 0.85, -0.15], [-0.08, 1.3, 0.08], [0.1, 1.25, -0.08]];
  blobs.forEach(([x, y, z], i) => add(g, S(0.17 - (i % 3) * 0.02, 14), i % 2 ? MAT.leaf() : paint("#4f9447", 0.75, 0), [x, y, z]).scale.set(1, 0.85, 1));
  return g;
}

/** 面料货架（横梁式，长边沿 x）：三层放布卷 */
export const FABRIC_RACK = { bay: 2.7, depth: 1.1, levels: [0, 1.2, 2.35] };
export function fabricRack() {
  const g = new THREE.Group();
  const inner = palletRackBay(FABRIC_RACK.bay, FABRIC_RACK.depth, 3.4, FABRIC_RACK.levels.slice(1));
  inner.rotation.y = Math.PI / 2;
  g.add(inner);
  return g;
}

/* ------------------------------------------------------------------ */
/* 建筑构件：柱子、门、卷帘门、楼梯                                      */
/* ------------------------------------------------------------------ */

/** 混凝土方柱 + 底部黄黑防撞条 */
export function concreteColumn(h: number, size = 0.36) {
  const g = new THREE.Group();
  add(g, B(size, h, size), MAT.concrete(), [0, h / 2, 0]);
  add(g, B(size + 0.02, 1.0, size + 0.02), MAT.hazard(), [0, 0.5, 0]);
  return g;
}

const doorArcMat = () => std("doorArc", { color: "#5b6472", roughness: 1, transparent: true, opacity: 0.55 });

/** 单开门：原点在门洞中心（墙中线上），墙沿 x，门扇往 +z 一侧开 70°，地上画开门弧线 */
export function doorSingle(w: number, wallT: number) {
  const g = new THREE.Group();
  const H = 2.1;
  for (const sx of [-w / 2, w / 2]) add(g, B(0.05, H, wallT + 0.03), MAT.machineGrey(), [sx, H / 2, 0]);
  add(g, B(w + 0.1, 0.06, wallT + 0.03), MAT.machineGrey(), [0, H + 0.03, 0]);
  const lw = w - 0.06;
  const a = (70 * Math.PI) / 180;
  const pivot = new THREE.Group();
  pivot.position.set(-w / 2 + 0.03, 0, wallT / 2);
  pivot.rotation.y = -a;
  g.add(pivot);
  add(pivot, RB(lw, H - 0.04, 0.04, 0.008), MAT.doorLeaf(), [lw / 2, (H - 0.04) / 2 + 0.01, 0.02]);
  add(pivot, B(0.12, 0.02, 0.02), MAT.chrome(), [lw - 0.1, 1.05, 0.06]);
  add(pivot, B(0.12, 0.02, 0.02), MAT.chrome(), [lw - 0.1, 1.05, -0.02]);
  add(g, new THREE.RingGeometry(lw - 0.015, lw, 40, 1, -a, a), doorArcMat(), [-w / 2 + 0.03, 0.012, wallT / 2], [-Math.PI / 2, 0, 0]);
  return g;
}

/** 双开门 / 安全出口：两扇往 +z（室外）开，推杠 + 门上绿色出口灯 */
export function doorDouble(w: number, wallT: number, exit: boolean) {
  const g = new THREE.Group();
  const H = 2.2;
  for (const sx of [-w / 2, w / 2]) add(g, B(0.06, H, wallT + 0.04), MAT.machineGrey(), [sx, H / 2, 0]);
  add(g, B(w + 0.12, 0.08, wallT + 0.04), MAT.machineGrey(), [0, H + 0.04, 0]);
  const lw = w / 2 - 0.04;
  const a = (80 * Math.PI) / 180;
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (w / 2 - 0.03), 0, wallT / 2);
    pivot.rotation.y = side < 0 ? -a : a;
    g.add(pivot);
    const dir = side < 0 ? 1 : -1;
    add(pivot, RB(lw, H - 0.05, 0.05, 0.008), exit ? MAT.exitDoor() : MAT.doorLeaf(), [(dir * lw) / 2, (H - 0.05) / 2 + 0.01, 0.025]);
    add(pivot, B(lw * 0.5, 0.5, 0.055), MAT.glass(), [(dir * lw) / 2, 1.55, 0.025]);
    add(pivot, B(lw - 0.15, 0.05, 0.05), exit ? MAT.red() : MAT.chrome(), [(dir * lw) / 2, 1.0, -0.04]);
    add(g, new THREE.RingGeometry(lw - 0.015, lw, 40, 1, side < 0 ? -a : Math.PI, a), doorArcMat(), [side * (w / 2 - 0.03), 0.012, wallT / 2], [-Math.PI / 2, 0, 0]);
  }
  if (exit) {
    for (const sz of [-1, 1]) {
      add(g, RB(0.42, 0.16, 0.05, 0.01), MAT.green(), [0, H + 0.22, sz * (wallT / 2 + 0.04)]);
      add(g, B(0.12, 0.1, 0.004), std("exitWhite", { color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.8 }), [-0.08, H + 0.22, sz * (wallT / 2 + 0.067)]);
    }
  }
  return g;
}

/** 卷帘大门：拉起一半（open 0~1），两侧导轨 + 顶部卷筒箱 + 地上黄黑线。卷帘装在 +z（室内）一侧 */
export function rollerShutter(w: number, h: number, wallT: number, open = 0.55) {
  const g = new THREE.Group();
  for (const sx of [-w / 2 - 0.05, w / 2 + 0.05]) add(g, B(0.1, h, 0.14), MAT.machineGrey(), [sx, h / 2, wallT / 2 + 0.07]);
  add(g, RB(w + 0.3, 0.5, 0.5, 0.04), MAT.machineGrey(), [0, h + 0.25, wallT / 2 + 0.2]);
  const curtain = h * (1 - open);
  const geo = B(w, curtain, 0.04);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / 2), uv.getY(i) * (curtain / 0.6));
  add(g, geo, MAT.shutter(), [0, h - curtain / 2, wallT / 2 + 0.07]);
  add(g, B(w, 0.06, 0.06), MAT.machineDark(), [0, h - curtain, wallT / 2 + 0.07]);
  const strip = B(w, 0.004, 0.25);
  const suv = strip.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < suv.count; i++) suv.setXY(i, suv.getX(i) * (w / 0.5), suv.getY(i));
  add(g, strip, MAT.hazard(), [0, 0.006, 0]);
  return g;
}

/** 直跑楼梯：沿 +x 往上，宽 width（z），升到 rise；+z 一侧有扶手 */
export function stairs(len: number, width: number, rise: number) {
  const g = new THREE.Group();
  const n = Math.max(4, Math.round(rise / 0.17));
  const run = len / n;
  const step = rise / n;
  for (let i = 0; i < n; i++) {
    add(g, B(run, step * (i + 1), width), MAT.concrete(), [run * (i + 0.5), (step * (i + 1)) / 2, 0]);
    add(g, B(run, 0.012, width), MAT.skirting(), [run * (i + 0.5), step * (i + 1) + 0.006, 0]);
  }
  const rz = width / 2 - 0.05;
  for (let i = 0; i < n; i += 3) add(g, C(0.015, 0.015, 0.9), MAT.chrome(), [run * (i + 0.5), step * (i + 1) + 0.45, rz]);
  add(g, C(0.022, 0.022, Math.hypot(len, rise)), MAT.chrome(), [len / 2, rise / 2 + 0.92, rz], [0, 0, -Math.atan2(len, rise)]);
  return g;
}
