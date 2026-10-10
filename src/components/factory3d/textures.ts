// 用 canvas 现画的贴图：不依赖外部图片文件，首屏就能加载完
import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

function canvasTex(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  let t = cache.get(key);
  if (t) return t;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  cache.set(key, t);
  return t;
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha = 0.06) {
  for (let i = 0; i < amount; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

/** 环氧地坪：浅灰绿 + 细微斑点 + 伸缩缝 */
export function floorTexture() {
  return canvasTex(
    "floor",
    512,
    512,
    (ctx) => {
      ctx.fillStyle = "#a9b4b1";
      ctx.fillRect(0, 0, 512, 512);
      noise(ctx, 512, 512, 9000, 0.05);
      ctx.strokeStyle = "rgba(60,70,70,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 512, 512);
    },
    [1, 1],
  );
}

/** 彩钢夹芯板墙面：竖向拼缝 */
export function wallTexture() {
  return canvasTex(
    "wall",
    256,
    256,
    (ctx) => {
      ctx.fillStyle = "#e9ecf0";
      ctx.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 32) {
        const g = ctx.createLinearGradient(x, 0, x + 32, 0);
        g.addColorStop(0, "rgba(0,0,0,0.07)");
        g.addColorStop(0.15, "rgba(255,255,255,0.0)");
        g.addColorStop(0.9, "rgba(0,0,0,0.02)");
        g.addColorStop(1, "rgba(0,0,0,0.12)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 32, 256);
      }
      noise(ctx, 256, 256, 1500, 0.03);
    },
    [1, 1],
  );
}

/** 卷帘门：横向条纹 */
export function shutterTexture() {
  return canvasTex("shutter", 64, 256, (ctx) => {
    ctx.fillStyle = "#b9c1cc";
    ctx.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, y, 64, 1.5);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(0, y + 2, 64, 1);
    }
  });
}

/** 货架钢网层板：用透明贴图做出网格 */
export function wireDeckTexture() {
  return canvasTex(
    "wire",
    128,
    128,
    (ctx) => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      for (let i = 0; i <= 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }
      ctx.lineWidth = 2;
      for (let i = 0; i <= 128; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
      }
    },
    [6, 3],
  );
}

/** 纸箱：牛皮纸 + 封箱胶带 + 唛头标签 */
export function cartonTexture() {
  return canvasTex("carton", 256, 256, (ctx) => {
    ctx.fillStyle = "#c69c66";
    ctx.fillRect(0, 0, 256, 256);
    noise(ctx, 256, 256, 3000, 0.07);
    ctx.fillStyle = "rgba(225,210,180,0.9)";
    ctx.fillRect(108, 0, 40, 256);
    ctx.fillStyle = "#f7f5ef";
    ctx.fillRect(28, 150, 64, 44);
    ctx.fillStyle = "#333";
    for (let i = 0; i < 4; i++) ctx.fillRect(34, 158 + i * 8, 40 + (i % 2) * 10, 3);
  });
}

/** 裁床上的唛架纸：画着衣片轮廓 */
export function markerTexture() {
  return canvasTex("marker", 256, 512, (ctx) => {
    ctx.fillStyle = "#f6f6f2";
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = "#5b6b8c";
    ctx.lineWidth = 2;
    const piece = (x: number, y: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.2, y);
      ctx.lineTo(x + w * 0.8, y);
      ctx.quadraticCurveTo(x + w, y + h * 0.1, x + w * 0.95, y + h * 0.35);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w * 0.05, y + h * 0.35);
      ctx.quadraticCurveTo(x, y + h * 0.1, x + w * 0.2, y);
      ctx.stroke();
    };
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 2; c++) piece(14 + c * 120, 12 + r * 100, 104, 88);
    }
  });
}

/** 托盘木纹 */
export function woodTexture() {
  return canvasTex("wood", 128, 128, (ctx) => {
    ctx.fillStyle = "#bf9461";
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 3) {
      ctx.fillStyle = `rgba(90,55,25,${Math.random() * 0.12})`;
      ctx.fillRect(0, y, 128, 1);
    }
    noise(ctx, 128, 128, 600, 0.08);
  });
}

/** 屏幕：设备控制面板 */
export function screenTexture() {
  return canvasTex("screen", 128, 96, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 96);
    g.addColorStop(0, "#0e2f5a");
    g.addColorStop(1, "#0a1d38");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 96);
    ctx.strokeStyle = "#4fd1ff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 14, 70, 66);
    ctx.beginPath();
    ctx.moveTo(18, 70);
    ctx.lineTo(30, 40);
    ctx.lineTo(48, 52);
    ctx.lineTo(70, 22);
    ctx.stroke();
    ctx.fillStyle = "#3ee08f";
    ctx.fillRect(88, 16, 30, 10);
    ctx.fillStyle = "#ffcc4d";
    ctx.fillRect(88, 32, 30, 10);
    ctx.fillStyle = "#8fb3d9";
    ctx.fillRect(88, 48, 30, 10);
  });
}

/** 洞洞板（线架背板）：白底 + 一格一个小孔，按背板尺寸重复 */
export function pegboardTexture() {
  return canvasTex(
    "pegboard",
    32,
    32,
    (ctx) => {
      ctx.fillStyle = "#eef0f2";
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = "#9aa1aa";
      ctx.beginPath();
      ctx.arc(16, 16, 4.2, 0, Math.PI * 2);
      ctx.fill();
    },
    [40, 90],
  );
}

/** 瓷砖地面（入口、卫生间、楼梯间）：60cm 方砖 + 灰缝，一张贴图 = 1.2m */
export function tileTexture() {
  return canvasTex(
    "tile",
    256,
    256,
    (ctx) => {
      ctx.fillStyle = "#b9bcc0";
      ctx.fillRect(0, 0, 256, 256);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const v = 228 + Math.round(Math.random() * 10);
          ctx.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
          ctx.fillRect(c * 128 + 2, r * 128 + 2, 124, 124);
        }
      }
      noise(ctx, 256, 256, 1500, 0.05);
    },
    [1, 1],
  );
}

/** 办公室复合木地板：一张贴图 = 1.2m */
export function parquetTexture() {
  return canvasTex(
    "parquet",
    256,
    256,
    (ctx) => {
      for (let r = 0; r < 8; r++) {
        const off = (r % 2) * 96;
        for (let c = -1; c < 2; c++) {
          const v = Math.random() * 18;
          ctx.fillStyle = `rgb(${196 - v},${160 - v},${118 - v})`;
          ctx.fillRect(off + c * 192, r * 32, 192, 32);
          ctx.fillStyle = "rgba(80,50,25,0.35)";
          ctx.fillRect(off + c * 192, r * 32, 1.5, 32);
        }
        ctx.fillStyle = "rgba(80,50,25,0.3)";
        ctx.fillRect(0, r * 32, 256, 1);
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = `rgba(110,70,35,${Math.random() * 0.12})`;
          ctx.fillRect(0, r * 32 + 4 + k * 4.5, 256, 1);
        }
      }
    },
    [1, 1],
  );
}

/** 隔壁物业：灰底斜线（图纸上的「非本厂」） */
export function hatchTexture() {
  return canvasTex(
    "hatch",
    128,
    128,
    (ctx) => {
      ctx.fillStyle = "#a7acb3";
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = "rgba(70,76,86,0.55)";
      ctx.lineWidth = 5;
      for (let i = -128; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 128);
        ctx.lineTo(i + 128, 0);
        ctx.stroke();
      }
    },
    [1, 1],
  );
}

/** 黄黑警示条（柱子防撞） */
export function hazardTexture() {
  return canvasTex(
    "hazard",
    128,
    128,
    (ctx) => {
      ctx.fillStyle = "#f2c230";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "#24272c";
      for (let i = -128; i < 256; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 128);
        ctx.lineTo(i + 32, 128);
        ctx.lineTo(i + 160, 0);
        ctx.lineTo(i + 128, 0);
        ctx.fill();
      }
    },
    [1, 1],
  );
}

export function disposeTextures() {
  for (const t of cache.values()) t.dispose();
  cache.clear();
}
