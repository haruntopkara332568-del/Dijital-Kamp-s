import type {
  CharacterDirection,
  InteractiveZone,
  PlayerCharacter,
  Position,
  WalkableSceneConfig,
} from '../types';
import { drawCharacter } from './characterRenderer';

export interface EngineCallbacks {
  onActiveZoneChange: (zone: InteractiveZone | null) => void;
  onPositionChange?: (pos: Position) => void;
  onUnreachableTarget?: (pos: Position) => void;
  onCustomRender?: (ctx: CanvasRenderingContext2D, camera: Position) => void;
}

export class WalkableCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: WalkableSceneConfig;
  private callbacks: EngineCallbacks;

  public player: PlayerCharacter;
  public camera: Position = { x: 0, y: 0 };

  private keysDown: Set<string> = new Set();
  private virtualMovement: Position = { x: 0, y: 0 };
  private autoWalkTarget: Position | null = null;
  private activeZone: InteractiveZone | null = null;

  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: WalkableSceneConfig,
    callbacks: EngineCallbacks,
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context oluşturulamadı.');
    }
    this.ctx = context;
    this.config = config;
    this.callbacks = callbacks;

    this.player = {
      x: config.playerSpawn.x,
      y: config.playerSpawn.y,
      width: 22,
      height: 28,
      direction: 'down',
      state: 'idle',
      speed: 160, // piksel / saniye
      walkFrame: 0,
      grade: 4,
    };

    this.setupListeners();
    this.updateCamera(true);
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.isInputFocused()) return;

    const key = e.key.toLowerCase();

    // Etkileşim tuşu
    if (key === 'e' || key === ' ') {
      if (this.activeZone) {
        e.preventDefault();
        this.activeZone.action();
        return;
      }
    }

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
      this.keysDown.add(key);
      // Klavye hareketine başlandığında otomatik yürüme iptal edilir
      this.autoWalkTarget = null;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keysDown.delete(key);
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return; // Yalnızca sol tık

    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Ekran koordinatını dünya koordinatına çevir
    const worldX = clickX + this.camera.x;
    const worldY = clickY + this.camera.y;

    // Hedef nokta bir engelin içinde mi kontrol et
    const isInsideObstacle = this.config.obstacles.some(
      (obs) =>
        worldX >= obs.x &&
        worldX <= obs.x + obs.width &&
        worldY >= obs.y &&
        worldY <= obs.y + obs.height,
    );

    if (isInsideObstacle) {
      if (this.callbacks.onUnreachableTarget) {
        this.callbacks.onUnreachableTarget({ x: worldX, y: worldY });
      }
      return;
    }

    this.autoWalkTarget = { x: worldX, y: worldY };
  };

  public setVirtualDirection(vx: number, vy: number) {
    this.virtualMovement = { x: vx, y: vy };
    if (vx !== 0 || vy !== 0) {
      this.autoWalkTarget = null;
    }
  }

  public triggerActiveInteraction() {
    if (this.activeZone) {
      this.activeZone.action();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Maksimum 100ms delta
    this.lastTime = currentTime;

    this.update(delta);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(delta: number) {
    let vx = 0;
    let vy = 0;

    // 1. Klavye kontrolleri
    if (this.keysDown.has('arrowleft') || this.keysDown.has('a')) vx -= 1;
    if (this.keysDown.has('arrowright') || this.keysDown.has('d')) vx += 1;
    if (this.keysDown.has('arrowup') || this.keysDown.has('w')) vy -= 1;
    if (this.keysDown.has('arrowdown') || this.keysDown.has('s')) vy += 1;

    // 2. Sanal dokunmatik kontroller
    if (vx === 0 && vy === 0) {
      vx = this.virtualMovement.x;
      vy = this.virtualMovement.y;
    }

    // 3. Tıklayarak otomatik yürüme
    if (vx === 0 && vy === 0 && this.autoWalkTarget) {
      const dx = this.autoWalkTarget.x - this.player.x;
      const dy = this.autoWalkTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        this.autoWalkTarget = null;
      } else {
        vx = dx / dist;
        vy = dy / dist;
      }
    }

    // Çapraz hareket hızını normalleştir (Diagonal speed clamp)
    const len = Math.hypot(vx, vy);
    if (len > 0) {
      vx = (vx / len) * this.player.speed;
      vy = (vy / len) * this.player.speed;

      this.player.state = 'walk';
      this.player.walkFrame += delta * 7.5; // Adım ritmi

      // Yön belirleme
      if (Math.abs(vx) > Math.abs(vy)) {
        this.player.direction = (vx > 0 ? 'right' : 'left') as CharacterDirection;
      } else {
        this.player.direction = (vy > 0 ? 'down' : 'up') as CharacterDirection;
      }
    } else {
      this.player.state = 'idle';
      this.player.walkFrame = 0;
    }

    // 4. Çarpışma algılama ve hareket uygulama
    this.movePlayerWithCollision(vx * delta, vy * delta);

    // 5. Kamera ve etkileşim bölgelerini güncelle
    this.updateCamera();
    this.checkInteractiveZones();

    if (this.callbacks.onPositionChange) {
      this.callbacks.onPositionChange({ x: this.player.x, y: this.player.y });
    }
  }

  private movePlayerWithCollision(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return;

    // X ekseninde hareket denemesi
    const targetX = this.player.x + dx;
    if (!this.checkObstacleCollision(targetX, this.player.y)) {
      this.player.x = Math.max(16, Math.min(this.config.width - 16, targetX));
    } else {
      // Çarpışma olduysa otomatik yürümeyi sonlandır
      if (this.autoWalkTarget) this.autoWalkTarget = null;
    }

    // Y ekseninde hareket denemesi (duvar boyunca kayma / sliding)
    const targetY = this.player.y + dy;
    if (!this.checkObstacleCollision(this.player.x, targetY)) {
      this.player.y = Math.max(20, Math.min(this.config.height - 20, targetY));
    } else {
      if (this.autoWalkTarget) this.autoWalkTarget = null;
    }
  }

  private checkObstacleCollision(x: number, y: number): boolean {
    // Karakterin ayak tabanı çarpışma kutusu (Hitbox)
    const boxW = 18;
    const boxH = 12;
    const left = x - boxW / 2;
    const right = x + boxW / 2;
    const top = y + 6;
    const bottom = y + 6 + boxH;

    // Sahne sınırları
    if (left < 0 || right > this.config.width || top < 0 || bottom > this.config.height) {
      return true;
    }

    for (const obs of this.config.obstacles) {
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

  private updateCamera(instant: boolean = false) {
    const viewportW = this.canvas.width;
    const viewportH = this.canvas.height;

    // Karakteri ekranda ortalama hedefi
    const targetCamX = Math.max(0, Math.min(this.config.width - viewportW, this.player.x - viewportW / 2));
    const targetCamY = Math.max(0, Math.min(this.config.height - viewportH, this.player.y - viewportH / 2));

    if (instant) {
      this.camera.x = targetCamX;
      this.camera.y = targetCamY;
    } else {
      // Yumuşak kamera süzülmesi (Smooth camera lerp)
      const lerp = 0.12;
      this.camera.x += (targetCamX - this.camera.x) * lerp;
      this.camera.y += (targetCamY - this.camera.y) * lerp;
    }
  }

  private checkInteractiveZones() {
    let nearest: InteractiveZone | null = null;
    let minDist = Infinity;

    for (const zone of this.config.interactiveZones) {
      const dist = Math.hypot(this.player.x - zone.x, this.player.y - zone.y);
      if (dist <= zone.radius && dist < minDist) {
        nearest = zone;
        minDist = dist;
      }
    }

    if (nearest?.id !== this.activeZone?.id) {
      this.activeZone = nearest;
      this.callbacks.onActiveZoneChange(nearest);
    }
  }

  private render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Kamerayı uygula
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // Özel sahne zemin ve bina çizimi (Callback)
    if (this.callbacks.onCustomRender) {
      this.callbacks.onCustomRender(ctx, this.camera);
    }

    // Otomatik yürüme hedef noktası göstergesi (Hedefleme halkası)
    if (this.autoWalkTarget) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.autoWalkTarget.x, this.autoWalkTarget.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#0e768a';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();
    }

    // Karakteri çiz
    drawCharacter(ctx, this.player);

    ctx.restore();
  }
}
