// 官网展示用的 3D 工厂：建筑模型风格的剖面厂房（裁剪 → 车缝 → 整烫 → 验货），
// 机器模型来自 models.ts（与工厂管理系统的数字工厂同一套程序化模型）。
// 默认缓慢环绕（带区域标签）；setShot(1..4) 把镜头推到某个车间，setShot(0) 回到环绕。
// 单位：米。厂房 34m × 22m，原点在地面中心，正面朝 +z。
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as M from "./models";

export type ZoneId = "cutting" | "sewing" | "pressing" | "quality";

/** 区域标签的锚点（地面以上） */
export const ZONE_ANCHORS: Record<ZoneId, [number, number, number]> = {
  cutting: [-11.5, 3.4, -1],
  sewing: [-0.4, 3.0, -1],
  pressing: [11.2, 3.6, -6.2],
  quality: [11.2, 3.2, 2.4],
};

/** 各车间的镜头：target、方位角、仰角、距离（0 = 全景环绕） */
type Shot = { target: [number, number, number]; az: number; el: number; dist: number };
export const SHOTS: Shot[] = [
  { target: [0, -0.6, 0.6], az: 0.62, el: 0.6, dist: 66 },
  { target: [-10.8, 0.8, -0.8], az: -0.55, el: 0.52, dist: 17.5 },
  { target: [-0.4, 0.9, -1.2], az: 0.3, el: 0.62, dist: 16.5 },
  { target: [11.4, 1.0, -6.4], az: 0.42, el: 0.46, dist: 13.5 },
  { target: [12.0, 0.9, 3.4], az: 0.95, el: 0.52, dist: 14 },
];

const HX = 17; // 厂房半宽（x）
const HZ = 11; // 厂房半深（z）
const WALL_H = 4.6;
const WALL_T = 0.3;

type Opts = {
  /** 每帧把区域标签的屏幕坐标交给外面 */
  onLabels?: (pts: Record<ZoneId, { x: number; y: number; visible: boolean }>) => void;
  /** 第一帧画完 */
  onReady?: () => void;
  reducedMotion?: boolean;
};

type FadeWall = { group: THREE.Group; normal: THREE.Vector2; mats: THREE.MeshStandardMaterial[]; base: number[] };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class FactoryShowcase {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(26, 1, 0.5, 400);
  private timer = new THREE.Timer();
  private raf = 0;
  private running = false;
  private disposed = false;
  private walls: FadeWall[] = [];
  private carts: { obj: THREE.Object3D; curve: THREE.CatmullRomCurve3; t: number; speed: number }[] = [];
  private spreader?: { obj: THREE.Object3D; z0: number; z1: number };
  private steam: { sprite: THREE.Sprite; origin: THREE.Vector3; t: number; life: number }[] = [];
  private roof?: THREE.Object3D;
  private arms: { obj: THREE.Object3D; seated: boolean; phase: number }[] = [];
  private width = 1;
  private height = 1;
  private isMobile = false;
  private envRT?: THREE.WebGLRenderTarget;

  // 镜头状态（球坐标，平滑插值）
  private cur = { az: 0.2, el: 1.15, dist: 120, tx: 0, ty: -0.6, tz: 0.6 };
  private goal = { az: 0.62, el: 0.6, dist: 66, tx: 0, ty: -0.6, tz: 0.6 };
  private spin = 0; // hero 自动旋转累计
  private drag = { active: false, x: 0, offset: 0, vel: 0 };
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private shot = 0;
  private firstFrame = true;
  private frameNo = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: Opts,
  ) {
    this.isMobile = Math.min(window.innerWidth, window.innerHeight) < 700 || matchMedia("(pointer: coarse)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // 动的东西很少（铺布机、推车），阴影不用每帧重算；手机上算得更少
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.setClearColor(0x000000, 0);

    if (opts.reducedMotion) Object.assign(this.cur, this.goal);

    this.buildLights();
    this.buildBuilding();
    this.buildEquipment();
    this.buildAtmosphere();

    this.bindPointer();
  }

  /* ------------------------------------------------------------ */
  /* 公共方法                                                       */
  /* ------------------------------------------------------------ */

  resize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.setShot(this.shot);
  }

  setShot(i: number) {
    const prev = this.shot;
    this.shot = Math.max(0, Math.min(SHOTS.length - 1, i));
    const s = SHOTS[this.shot];
    [this.goal.tx, this.goal.ty, this.goal.tz] = s.target;
    this.goal.el = s.el;
    if (this.shot === 0) {
      // 回到全景：从现在的角度接着转，不跳
      if (prev !== 0) this.spin = this.cur.az - 0.62 - this.drag.offset;
      this.goal.dist = this.fitDistance();
    } else {
      this.goal.az = s.az;
      this.goal.dist = s.dist * (this.camera.aspect < 0.9 ? 1.45 : this.camera.aspect < 1.4 ? 1.15 : 1);
    }
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.timer.reset();
    // 手机上 30 帧就够顺滑，省一半电量和发热，滚动页面也更跟手
    const minStep = this.isMobile ? 1 / 31 : 0;
    let acc = 0;
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.timer.update();
      acc += Math.max(0, this.timer.getDelta());
      if (acc < minStep) return;
      this.frame(Math.min(0.05, acc));
      acc = 0;
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.unbindPointer?.();
    this.envRT?.dispose();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats) if (!m.userData.shared) m.dispose();
    });
    this.renderer.dispose();
  }

  /* ------------------------------------------------------------ */
  /* 场景                                                          */
  /* ------------------------------------------------------------ */

  private buildLights() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight("#ffffff", "#c9c9ce", 1.0);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight("#ffffff", 2.2);
    key.position.set(-26, 38, 20);
    key.castShadow = true;
    const s = this.isMobile ? 1024 : 2048;
    key.shadow.mapSize.set(s, s);
    const cam = key.shadow.camera as THREE.OrthographicCamera;
    cam.left = -26;
    cam.right = 26;
    cam.top = 22;
    cam.bottom = -22;
    cam.near = 10;
    cam.far = 90;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    key.shadow.radius = 4;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight("#ffffff", 0.45);
    rim.position.set(30, 18, -26);
    this.scene.add(rim);
  }

  private buildBuilding() {
    const root = new THREE.Group();

    // 底座（像建筑模型的台座）
    const plinthMat = new THREE.MeshStandardMaterial({ color: "#d9d9de", roughness: 0.85, metalness: 0 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 + 1.6, 0.7, HZ * 2 + 1.6), plinthMat);
    plinth.position.y = -0.35;
    plinth.receiveShadow = true;
    this.scene.add(plinth);

    // 地坪：浅色磨石混凝土
    const floorMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: concreteTexture(), roughness: 0.42, metalness: 0.02 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.005;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 区域细线
    const lineMat = new THREE.MeshStandardMaterial({ color: "#b8b8be", roughness: 0.6, metalness: 0 });
    const zoneRects: [number, number, number, number][] = [
      [-16.2, -9.0, -6.4, 7.6],
      [-5.6, -5.6, 4.6, 4.6],
      [6.6, -8.8, 16.4, -4.6],
      [6.6, -0.6, 16.4, 9.6],
    ];
    for (const [x0, z0, x1, z1] of zoneRects) {
      const t = 0.05;
      const parts: [number, number, number, number][] = [
        [(x0 + x1) / 2, z0, x1 - x0, t],
        [(x0 + x1) / 2, z1, x1 - x0, t],
        [x0, (z0 + z1) / 2, t, z1 - z0],
        [x1, (z0 + z1) / 2, t, z1 - z0],
      ];
      for (const [cx, cz, w, d] of parts) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(cx, 0.012, cz);
        m.receiveShadow = true;
        root.add(m);
      }
    }

    // 钢屋架 + 檩条 + 灯（不封顶，看得到里面）；单独一组，近景时藏起来
    const roof = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const x = -14 + i * 5.6;
      const t = M.proto("truss", () => M.roofTruss(HZ * 2, WALL_H, 1.5));
      t.position.x = x;
      roof.add(t);
      for (const z of [-HZ + 0.15, HZ - 0.15]) {
        const c = M.proto("col", () => M.steelColumn(WALL_H));
        c.position.set(x, 0, z);
        root.add(c);
      }
    }
    const purlinMat = M.paint("#a1a1a6", 0.5, 0.4);
    for (const z of [-5.5, 0, 5.5]) {
      const y = WALL_H + 1.5 * (1 - Math.abs(z) / HZ) + 0.09;
      const p = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 - 0.4, 0.09, 0.09), purlinMat);
      p.position.set(0, y, z);
      roof.add(p);
    }
    // 工矿灯
    for (const x of [-11.2, -5.6, 0, 5.6, 11.2]) {
      for (const z of [-6.2, 0, 6.2]) {
        const l = M.proto("lamp", () => M.highBayLamp(0.9));
        l.position.set(x, WALL_H + 1.5 * (1 - Math.abs(z) / HZ), z);
        roof.add(l);
      }
    }
    this.scene.add(this.ownBake(root));
    this.roof = this.ownBake(roof);
    this.scene.add(this.roof);

    // 四面墙：朝向镜头的那面会淡出
    this.addWall(new THREE.Vector2(0, -1), HX * 2, [0, -HZ], 0);
    this.addWall(new THREE.Vector2(0, 1), HX * 2, [0, HZ], Math.PI);
    this.addWall(new THREE.Vector2(-1, 0), HZ * 2, [-HX, 0], Math.PI / 2);
    this.addWall(new THREE.Vector2(1, 0), HZ * 2, [HX, 0], -Math.PI / 2);
  }

  /** 一面墙：下部实墙 + 通长带形窗 + 上部檐口；本地坐标沿 x，外侧朝 -z */
  private addWall(normal: THREE.Vector2, len: number, at: [number, number], rotY: number) {
    const g = new THREE.Group();
    const plaster = new THREE.MeshStandardMaterial({ color: "#f5f5f7", roughness: 0.9, metalness: 0 });
    const frame = new THREE.MeshStandardMaterial({ color: "#48484a", roughness: 0.45, metalness: 0.6 });
    const glass = new THREE.MeshStandardMaterial({
      color: "#c9d4da",
      roughness: 0.05,
      metalness: 0.3,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const L = len + WALL_T;
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = mat !== glass;
      m.receiveShadow = true;
      g.add(m);
    };
    const winBottom = 1.05;
    const winTop = 3.75;
    add(new THREE.BoxGeometry(L, winBottom, WALL_T), plaster, 0, winBottom / 2);
    add(new THREE.BoxGeometry(L, WALL_H - winTop, WALL_T), plaster, 0, (WALL_H + winTop) / 2);
    add(new THREE.BoxGeometry(L, winTop - winBottom, 0.02), glass, 0, (winBottom + winTop) / 2);
    const n = Math.round(len / 2.2);
    for (let i = 0; i <= n; i++) {
      const x = -len / 2 + (i * len) / n;
      add(new THREE.BoxGeometry(0.07, winTop - winBottom, 0.12), frame, x, (winBottom + winTop) / 2);
    }
    for (const y of [winBottom, winTop, 2.45]) add(new THREE.BoxGeometry(L, 0.06, 0.12), frame, 0, y);
    g.position.set(at[0], 0, at[1]);
    g.rotation.y = rotY;
    this.scene.add(g);
    const mats = [plaster, frame, glass];
    this.walls.push({ group: g, normal, mats, base: mats.map((m) => m.opacity) });
  }

  private buildEquipment() {
    const root = new THREE.Group();
    const place = (obj: THREE.Object3D, x: number, z: number, rotDeg = 0) => {
      obj.position.set(x, 0, z);
      obj.rotation.y = (rotDeg * Math.PI) / 180;
      root.add(obj);
      return obj;
    };
    let seed = 3;
    const arms: { arms: THREE.Object3D; seated: boolean }[] = [];
    const worker = (parent: THREE.Object3D, x: number, z: number, facing: number, seated: boolean) => {
      const p = M.person(seed++, seated);
      p.root.position.set(x, 0, z);
      p.root.rotation.y = facing;
      parent.add(p.root);
      arms.push({ arms: p.arms, seated });
    };

    /* ---------- 裁剪区 ---------- */
    const ctW = 2.2;
    const ctL = 10;
    const ctX = -13;
    const ctZ = -0.6;
    place(M.proto("cutTable", () => M.cutTable(ctW, ctL)), ctX, ctZ);
    const spreader = M.proto("spreader", () => M.spreaderUnit(ctW));
    spreader.position.set(ctX, 0, ctZ);
    this.scene.add(spreader);
    const spreadL = ctL * 0.62;
    const sz = ctZ - ctL / 2 + 0.35 + spreadL / 2;
    this.spreader = { obj: spreader, z0: sz - spreadL / 2 + 0.5, z1: sz + spreadL / 2 - 0.4 };
    {
      const g = new THREE.Group();
      worker(g, ctW / 2 + 0.45, 1.6, Math.PI / 2, false);
      worker(g, -ctW / 2 - 0.45, -1.4, -Math.PI / 2, false);
      place(g, ctX, ctZ);
    }
    const cnc = place(M.proto("cnc", () => M.cncCutter()), -8.6, -4.0);
    worker(cnc, 1.6, 1.3, Math.PI / 2, false);
    for (const x of [-14.8, -12.05, -9.3]) place(M.proto("fabricRack", () => M.fabricRack()), x, -10.05);
    place(M.proto("bundleTable", () => M.workTable(3.0, 1.0)), -8.8, 4.0);
    {
      const g = new THREE.Group();
      worker(g, 0, 0.75, 0, false);
      place(g, -8.8, 4.0);
    }
    place(M.proto("cart-camel", () => M.bundleCart("#a98559")), -9.6, 6.4);
    place(M.proto("cart-ink", () => M.bundleCart("#1f1e22")), -8.2, 6.4);
    place(M.proto("cart-ivory", () => M.bundleCart("#e9e1d3")), -13.2, 6.9, 90);

    /* ---------- 车缝区：两组背靠背的车缝线 ---------- */
    const xs = [-4.1, -2.8, -1.5, -0.2, 1.1, 2.4, 3.7];
    let k = 0;
    for (const z0 of [-3.4, 1.5]) {
      xs.forEach((x, i) => {
        for (const [dz, rot] of [
          [-0.31, 180],
          [0.31, 0],
        ] as const) {
          const type = i === 3 ? "overlock" : "sewing";
          const st = M.proto(type, () => (type === "sewing" ? M.sewingStation() : M.overlockStation()));
          // 15 个人的厂：大约一半工位上有人
          if ((k * 7 + 3) % 5 < 3) worker(st, 0, type === "sewing" ? 0.62 : 0.58, 0, true);
          k++;
          place(st, x, z0 + dz, rot);
        }
      });
    }
    for (let i = 0; i < 5; i++) place(M.proto("thread8", () => M.threadShelf(8)), -3.2 + i * 1.06, -10.5);
    place(M.proto("trolley", () => M.wipTrolley()), -5.0, -1.0, 90);
    place(M.proto("cart-blush", () => M.bundleCart("#c9a9a6")), 4.9, -1.0, 90);

    /* ---------- 整烫区 ---------- */
    for (const x of [8.0, 10.6, 13.2]) {
      const t = M.proto("iron", () => M.ironTable(0));
      worker(t, 0, 0.55, 0, false);
      place(t, x, -6.4);
      this.addSteam(new THREE.Vector3(x + 0.45, 1.15, -6.45));
    }
    for (const x of [9.3, 11.9]) place(M.proto("boiler", () => M.boilerUnit()), x, -7.7);
    place(M.proto("former", () => M.formFinisherUnit("#a98559")), 15.6, -6.6);
    this.addSteam(new THREE.Vector3(15.6, 1.9, -6.6), 1.3);
    const rackCols = [
      ["#a98559", "#b8946a", "#a98559", "#c4a682", "#a98559"],
      ["#1f1e22", "#2b2b2e", "#1f1e22", "#3a3633", "#1f1e22"],
      ["#e9e1d3", "#dcd2c2", "#e9e1d3", "#efe9df", "#e9e1d3"],
      ["#c9a9a6", "#b98f8d", "#d4b7b4", "#c9a9a6", "#b98f8d"],
      ["#3b4c63", "#2f3e52", "#46597a", "#3b4c63", "#2f3e52"],
    ];
    rackCols.forEach((cols, i) => place(M.proto(`rack${i}`, () => M.garmentRack(cols)), 7.7 + i * 1.75, -10.0));

    /* ---------- 验货 · 包装 · 发货 ---------- */
    for (const [i, x] of [8.3, 10.5].entries()) {
      const s = M.proto(`insp${i}`, () => M.inspectionStation(i));
      worker(s, 0, 0.62, 0, false);
      place(s, x, 0.6);
    }
    place(M.proto("packTable", () => M.workTable(3.2, 1.0)), 14.4, 0.6);
    {
      const g = new THREE.Group();
      worker(g, 0.6, 0.75, 0, false);
      place(g, 14.4, 0.6);
    }
    for (const [i, x] of [8.0, 9.75, 11.5, 13.25].entries()) {
      place(M.proto(`rackQ${i}`, () => M.garmentRack(rackCols[(i + 2) % rackCols.length])), x, 3.6);
    }
    place(M.proto("pallet12", () => M.cartonPallet(12)), 13.4, 7.4);
    place(M.proto("pallet16", () => M.cartonPallet(16)), 14.8, 7.4);
    place(M.proto("pallet8", () => M.cartonPallet(8)), 14.8, 8.9);
    place(M.proto("jack", () => M.palletJack()), 11.6, 8.6, 90);

    /* ---------- 入口的样衣间（展示用的几件成衣） ---------- */
    place(M.proto("sampleTable", () => M.workTable(2.4, 1.1)), -1.2, 7.8);
    place(M.proto("former2", () => M.formFinisherUnit("#1f1e22")), 1.2, 7.8);
    place(M.proto("rackS", () => M.garmentRack(["#a98559", "#e9e1d3", "#1f1e22", "#c9a9a6", "#a98559"])), -4.0, 8.6);
    {
      const g = new THREE.Group();
      worker(g, 0, 0.8, 0, false);
      place(g, -1.2, 7.8);
    }
    for (const [x, z] of [
      [-16.4, 10.4],
      [16.4, -10.4],
    ])
      place(M.proto("plant", () => M.plant()), x, z);

    // 手臂单独拿出来做干活的小动作，其余全部合并成少量网格
    this.scene.add(root);
    root.updateMatrixWorld(true);
    for (const a of arms) {
      const pivot = a.arms.parent!;
      this.scene.attach(pivot);
      this.arms.push({ obj: a.arms, seated: a.seated, phase: Math.random() * Math.PI * 2 });
    }
    this.scene.remove(root);
    this.scene.add(this.ownBake(root));

    /* ---------- 通道里来回跑的送货车 ---------- */
    const loop = new THREE.CatmullRomCurve3(
      [
        [-5.6, -6.2],
        [0, -6.4],
        [5.4, -6.2],
        [5.6, 0],
        [5.4, 5.4],
        [0, 5.6],
        [-5.6, 5.4],
        [-5.8, 0],
      ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
      true,
      "centripetal",
    );
    for (const [i, col] of ["#a98559", "#e9e1d3"].entries()) {
      const c = M.proto(`mover${i}`, () => M.bundleCart(col));
      this.scene.add(c);
      this.carts.push({ obj: c, curve: loop, t: i * 0.5, speed: 0.012 });
    }
  }

  /** 合并成少量网格；合并结果是这个实例自己的，销毁时要释放 */
  private ownBake(root: THREE.Object3D) {
    const g = M.bake(root);
    g.traverse((o) => {
      const geo = (o as THREE.Mesh).geometry;
      if (geo) geo.userData.shared = false;
    });
    return g;
  }

  private addSteam(origin: THREE.Vector3, scale = 1) {
    const tex = softDot();
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.SpriteMaterial({ map: tex, color: "#ffffff", transparent: true, opacity: 0, depthWrite: false });
      const s = new THREE.Sprite(mat);
      s.scale.setScalar(0.3 * scale);
      this.scene.add(s);
      this.steam.push({ sprite: s, origin, t: (i / 6) * 2.4, life: 2.4 });
    }
  }

  private buildAtmosphere() {
    // 台座下的柔和接触阴影
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(56, 42),
      new THREE.MeshBasicMaterial({ map: radialTexture("rgba(0,0,0,0.22)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.7;
    this.scene.add(shadow);
  }

  /* ------------------------------------------------------------ */
  /* 交互：鼠标拖动 / 手指左右滑动旋转，鼠标轻微视差                     */
  /* 画布是 touch-action: pan-y，上下滑仍然是滚动页面                   */
  /* ------------------------------------------------------------ */

  private unbindPointer?: () => void;
  private bindPointer() {
    const el = this.canvas;
    const down = (e: PointerEvent) => {
      if (this.shot !== 0) return;
      this.drag.active = true;
      this.drag.x = e.clientX;
      this.drag.vel = 0;
      if (e.pointerType === "mouse") {
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      }
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.pointerType === "mouse") {
        this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      }
      if (!this.drag.active) return;
      const dx = e.clientX - this.drag.x;
      this.drag.x = e.clientX;
      const d = (-dx / r.width) * (e.pointerType === "mouse" ? 3.2 : 2.6);
      this.drag.offset += d;
      this.drag.vel = d;
    };
    const up = (e: PointerEvent) => {
      if (!this.drag.active) return;
      this.drag.active = false;
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
    };
    const leave = () => {
      this.pointer.x = 0;
      this.pointer.y = 0;
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    this.unbindPointer = () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
    };
  }

  /* ------------------------------------------------------------ */
  /* 每帧                                                          */
  /* ------------------------------------------------------------ */

  /** 让整个厂房（含屋架高度）在画面里放得下的镜头距离 */
  private fitDistance() {
    const vfov = (this.camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const fov = Math.min(vfov, hfov);
    const R = this.camera.aspect > 1.2 ? 16.5 : 17.5;
    return R / Math.sin(fov / 2);
  }

  private frame(dt: number) {
    const time = this.timer.getElapsed();
    const rm = this.opts.reducedMotion;
    const k = 1 - Math.exp(-dt * (this.shot === 0 ? 1.1 : 1.8));

    if (this.shot === 0) {
      if (!rm) this.spin += dt * 0.045;
      if (!this.drag.active) {
        this.drag.offset += this.drag.vel;
        this.drag.vel *= Math.pow(0.04, dt);
      }
      this.pointer.sx += (this.pointer.x - this.pointer.sx) * Math.min(1, dt * 2);
      this.pointer.sy += (this.pointer.y - this.pointer.sy) * Math.min(1, dt * 2);
      this.goal.az = 0.62 + this.spin + this.drag.offset + this.pointer.sx * 0.08;
      this.goal.el = 0.6 + this.pointer.sy * 0.04;
    } else if (!rm) {
      // 车间近景：镜头轻轻呼吸
      const s = SHOTS[this.shot];
      this.goal.az = s.az + Math.sin(time * 0.15) * 0.06;
    }

    const c = this.cur;
    const g = this.goal;
    if (rm && this.firstFrame) Object.assign(c, g);
    c.az += (g.az - c.az) * k;
    c.el += (g.el - c.el) * k;
    c.dist += (g.dist - c.dist) * k;
    c.tx += (g.tx - c.tx) * k;
    c.ty += (g.ty - c.ty) * k;
    c.tz += (g.tz - c.tz) * k;
    const ce = Math.cos(c.el);
    this.camera.position.set(c.tx + c.dist * Math.sin(c.az) * ce, c.ty + c.dist * Math.sin(c.el), c.tz + c.dist * Math.cos(c.az) * ce);
    this.camera.lookAt(c.tx, c.ty, c.tz);

    // 近景时屋架会挡住镜头
    if (this.roof) this.roof.visible = c.dist > 34;

    // 朝向镜头的墙淡出
    const dir = new THREE.Vector2(this.camera.position.x - c.tx, this.camera.position.z - c.tz).normalize();
    for (const w of this.walls) {
      const facing = w.normal.dot(dir);
      const vis = 1 - smooth(-0.12, 0.3, facing);
      w.group.visible = vis > 0.02;
      w.mats.forEach((m, i) => {
        const o = w.base[i] * vis;
        m.opacity = o;
        m.transparent = i === 2 || vis < 0.999;
        m.depthWrite = i !== 2 && vis > 0.999;
      });
      w.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.castShadow = vis > 0.5 && mesh.material !== w.mats[2];
      });
    }

    if (!rm) {
      // 铺布机来回走
      if (this.spreader) {
        const { obj, z0, z1 } = this.spreader;
        const u = (Math.sin(time * 0.35) + 1) / 2;
        obj.position.z = z0 + (z1 - z0) * u;
      }
      // 送货车
      for (const cart of this.carts) {
        cart.t = (((cart.t + dt * cart.speed) % 1) + 1) % 1;
        const p = cart.curve.getPointAt(cart.t);
        const tan = cart.curve.getTangentAt(cart.t);
        cart.obj.position.copy(p);
        cart.obj.rotation.y = Math.atan2(-tan.z, tan.x);
      }
      // 蒸汽
      for (const s of this.steam) {
        s.t = (s.t + dt) % s.life;
        const u = s.t / s.life;
        s.sprite.position.set(
          s.origin.x + Math.sin(u * 5 + s.origin.x) * 0.08,
          s.origin.y + u * 1.1,
          s.origin.z + Math.cos(u * 4) * 0.05,
        );
        s.sprite.scale.setScalar(0.18 + u * 0.55);
        (s.sprite.material as THREE.SpriteMaterial).opacity = Math.sin(u * Math.PI) * 0.32;
      }
      // 车工手上的小动作
      for (const a of this.arms) {
        a.obj.rotation.x = a.seated
          ? Math.sin(time * 2.6 + a.phase) * 0.05 + Math.sin(time * 0.7 + a.phase) * 0.03
          : Math.sin(time * 1.3 + a.phase) * 0.08;
      }
    }

    if (this.firstFrame || this.frameNo++ % (this.isMobile ? 6 : 2) === 0) this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);

    if (this.opts.onLabels) {
      const out = {} as Record<ZoneId, { x: number; y: number; visible: boolean }>;
      const v = new THREE.Vector3();
      for (const id of Object.keys(ZONE_ANCHORS) as ZoneId[]) {
        v.set(...ZONE_ANCHORS[id]).project(this.camera);
        out[id] = { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height, visible: v.z < 1 };
      }
      this.opts.onLabels(out);
    }
    if (this.firstFrame) {
      this.firstFrame = false;
      this.opts.onReady?.();
    }
  }
}

/* ------------------------------------------------------------------ */
/* 小纹理                                                              */
/* ------------------------------------------------------------------ */

let dotTex: THREE.Texture | null = null;
function softDot() {
  if (dotTex) return dotTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(c);
  dotTex.userData.shared = true;
  return dotTex;
}

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let concreteTex: THREE.Texture | null = null;
function concreteTexture() {
  if (concreteTex) return concreteTex;
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#dad9d6";
  ctx.fillRect(0, 0, S, S);
  // 大块的明暗起伏
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 60 + Math.random() * 180;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = Math.random() * 0.05;
    g.addColorStop(0, Math.random() > 0.5 ? `rgba(255,252,246,${a})` : `rgba(120,108,92,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // 细小骨料
  for (let i = 0; i < 26000; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.08 + v * 0.1})` : `rgba(90,80,70,${0.06 + v * 0.12})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 1.2, 1.2);
  }
  // 地坪切缝（每 5.6m 一道，跟屋架对齐）
  ctx.strokeStyle = "rgba(90,80,68,0.22)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) {
    const x = (i / 6) * S;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, S);
    ctx.stroke();
  }
  for (let i = 1; i < 4; i++) {
    const y = (i / 4) * S;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  concreteTex = t;
  return t;
}
