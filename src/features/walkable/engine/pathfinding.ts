import type { Position, SceneObstacle, WalkableSceneConfig } from '../types';

export interface HitboxConfig {
  width: number;
  height: number;
  offsetY: number;
}

export const DEFAULT_HITBOX: HitboxConfig = {
  width: 18,
  height: 12,
  offsetY: 6,
};

/**
 * Verilen noktanın sahne sınırları veya engellerle çakışıp çakışmadığını denetler.
 */
export function isPositionBlocked(
  x: number,
  y: number,
  obstacles: readonly SceneObstacle[],
  sceneWidth: number,
  sceneHeight: number,
  hitbox: HitboxConfig = DEFAULT_HITBOX,
): boolean {
  const left = x - hitbox.width / 2;
  const right = x + hitbox.width / 2;
  const top = y + hitbox.offsetY;
  const bottom = top + hitbox.height;

  // Sahne sınırları
  if (left < 0 || right > sceneWidth || top < 0 || bottom > sceneHeight) {
    return true;
  }

  // Sahne engelleri (AABB)
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (
      right > obs.x &&
      left < obs.x + obs.width &&
      bottom > obs.y &&
      top < obs.y + obs.height
    ) {
      return true;
    }
  }

  return false;
}

/**
 * İki nokta arasında doğrudan görüş hattı (Line-of-Sight) olup olmadığını kontrol eder.
 */
export function hasLineOfSight(
  p1: Position,
  p2: Position,
  obstacles: readonly SceneObstacle[],
  sceneWidth: number,
  sceneHeight: number,
  hitbox: HitboxConfig = DEFAULT_HITBOX,
  stepSize: number = 10,
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) return true;

  const steps = Math.ceil(distance / stepSize);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const sampleX = p1.x + dx * t;
    const sampleY = p1.y + dy * t;

    if (isPositionBlocked(sampleX, sampleY, obstacles, sceneWidth, sceneHeight, hitbox)) {
      return false;
    }
  }

  return true;
}

interface GridNode {
  gx: number;
  gy: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

/**
 * A* ve string-pulling (yol pürüzsüzleştirme) tabanlı hafif yol bulma algoritması.
 * Karakterin engellerin çevresinden dolaşmasını sağlar.
 */
export function findPath(
  start: Position,
  goal: Position,
  config: WalkableSceneConfig,
  hitbox: HitboxConfig = DEFAULT_HITBOX,
  gridSize: number = 25,
): Position[] | null {
  const { obstacles, width: sceneW, height: sceneH } = config;

  // 1. Hedef nokta engelin içindeyse veya sahne dışındaysa doğrudan ulaşılamaz kabul et
  if (isPositionBlocked(goal.x, goal.y, obstacles, sceneW, sceneH, hitbox)) {
    return null;
  }

  // 2. Doğrudan görüş hattı varsa arama yapmadan düz rota dön (0ms hızlı yol)
  if (hasLineOfSight(start, goal, obstacles, sceneW, sceneH, hitbox)) {
    return [goal];
  }

  // 3. Grid boyutları
  const cols = Math.ceil(sceneW / gridSize);
  const rows = Math.ceil(sceneH / gridSize);

  const startGx = Math.max(0, Math.min(cols - 1, Math.floor(start.x / gridSize)));
  const startGy = Math.max(0, Math.min(rows - 1, Math.floor(start.y / gridSize)));
  const goalGx = Math.max(0, Math.min(cols - 1, Math.floor(goal.x / gridSize)));
  const goalGy = Math.max(0, Math.min(rows - 1, Math.floor(goal.y / gridSize)));

  const key = (gx: number, gy: number) => `${gx},${gy}`;
  const openSet = new Map<string, GridNode>();
  const closedSet = new Set<string>();

  const startNode: GridNode = {
    gx: startGx,
    gy: startGy,
    g: 0,
    h: Math.hypot(goalGx - startGx, goalGy - startGy),
    f: Math.hypot(goalGx - startGx, goalGy - startGy),
    parent: null,
  };

  openSet.set(key(startGx, startGy), startNode);

  // 8 yönlü hareket (komşu ofsetleri)
  const directions = [
    { dx: 1, dy: 0, cost: 1 },
    { dx: -1, dy: 0, cost: 1 },
    { dx: 0, dy: 1, cost: 1 },
    { dx: 0, dy: -1, cost: 1 },
    { dx: 1, dy: 1, cost: 1.414 },
    { dx: -1, dy: 1, cost: 1.414 },
    { dx: 1, dy: -1, cost: 1.414 },
    { dx: -1, dy: -1, cost: 1.414 },
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 2000; // Performans emniyeti

  while (openSet.size > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // En düşük f değerine sahip düğümü seç
    let current: GridNode | null = null;
    for (const node of openSet.values()) {
      if (!current || node.f < current.f) {
        current = node;
      }
    }

    if (!current) break;

    // Hedefe ulaşıldı mı?
    if (current.gx === goalGx && current.gy === goalGy) {
      const rawPath: Position[] = [];
      let temp: GridNode | null = current;
      while (temp) {
        rawPath.push({
          x: temp.gx * gridSize + gridSize / 2,
          y: temp.gy * gridSize + gridSize / 2,
        });
        temp = temp.parent;
      }
      rawPath.reverse();

      // Başlangıç ve asıl hedef noktalarını ekle
      rawPath[rawPath.length - 1] = goal;

      // String pulling ile yolu pürüzsüzleştir
      return smoothPath(start, rawPath, obstacles, sceneW, sceneH, hitbox);
    }

    const currentKey = key(current.gx, current.gy);
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    for (const dir of directions) {
      const ngx = current.gx + dir.dx;
      const ngy = current.gy + dir.dy;

      if (ngx < 0 || ngx >= cols || ngy < 0 || ngy >= rows) continue;

      const neighborKey = key(ngx, ngy);
      if (closedSet.has(neighborKey)) continue;

      const worldX = ngx * gridSize + gridSize / 2;
      const worldY = ngy * gridSize + gridSize / 2;

      // Çarpışma kontrolü
      if (isPositionBlocked(worldX, worldY, obstacles, sceneW, sceneH, hitbox)) {
        closedSet.add(neighborKey);
        continue;
      }

      // Çapraz hareket ediliyorsa köşelerden geçiş engeli kontrolü
      if (dir.dx !== 0 && dir.dy !== 0) {
        const side1Blocked = isPositionBlocked(
          current.gx * gridSize + gridSize / 2,
          ngy * gridSize + gridSize / 2,
          obstacles,
          sceneW,
          sceneH,
          hitbox,
        );
        const side2Blocked = isPositionBlocked(
          ngx * gridSize + gridSize / 2,
          current.gy * gridSize + gridSize / 2,
          obstacles,
          sceneW,
          sceneH,
          hitbox,
        );
        if (side1Blocked && side2Blocked) {
          continue; // İki taraf da tıkalıysa çaprazdan geçme
        }
      }

      const tentativeG = current.g + dir.cost;
      const existing = openSet.get(neighborKey);

      if (!existing || tentativeG < existing.g) {
        const h = Math.hypot(goalGx - ngx, goalGy - ngy);
        const neighborNode: GridNode = {
          gx: ngx,
          gy: ngy,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };
        openSet.set(neighborKey, neighborNode);
      }
    }
  }

  // Yol bulunamadıysa
  return null;
}

/**
 * Yol pürüzsüzleştirme (String pulling):
 * Ara ızgara noktalarını doğrudan görüş hattı kontrolüyle temizleyerek doğal ve akıcı çizgilere dönüştürür.
 */
function smoothPath(
  start: Position,
  waypoints: Position[],
  obstacles: readonly SceneObstacle[],
  sceneWidth: number,
  sceneHeight: number,
  hitbox: HitboxConfig,
): Position[] {
  if (waypoints.length <= 1) return waypoints;

  const smoothed: Position[] = [];
  let currentIndex = 0;
  let currentPos = start;

  while (currentIndex < waypoints.length) {
    // Mümkün olan en uzak doğrudan görüş hattı olan noktayı bul
    let furthest = currentIndex;
    for (let j = waypoints.length - 1; j > currentIndex; j--) {
      if (hasLineOfSight(currentPos, waypoints[j], obstacles, sceneWidth, sceneHeight, hitbox)) {
        furthest = j;
        break;
      }
    }

    if (furthest === currentIndex) {
      // Doğrudan görüş hattı yoksa bir sonraki noktaya geç
      smoothed.push(waypoints[currentIndex]);
      currentPos = waypoints[currentIndex];
      currentIndex++;
    } else {
      smoothed.push(waypoints[furthest]);
      currentPos = waypoints[furthest];
      currentIndex = furthest + 1;
    }
  }

  return smoothed;
}
