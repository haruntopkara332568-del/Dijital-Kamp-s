import type {
  CharacterDirection,
  InteractiveZone,
  PlayerCharacter,
  Position,
  WalkableSceneConfig,
} from '../types';
import { drawCharacter } from './characterRenderer';
import { findPath, DEFAULT_HITBOX } from './pathfinding';

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
  private pathWaypoints: Position[] = [];
  private currentWaypointIndex: number = 0;
  private activeZone: InteractiveZone | null = null;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: WalkableSceneConfig,
    callbacks: EngineCallbacks,
    initialPosition?: Position,
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context oluşturulamadı.');
    }
    this.ctx = context;
    this.config = config;
    this.callbacks = callbacks;

    const spawnX = initialPosition?.x ?? config.playerSpawn.x;
    const spawnY = initialPosition?.y ?? config.playerSpawn.y;

    this.player = {
      x: spawnX,
      y: spawnY,
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
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
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
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      // Sekme arka plandayken rAF döngüsünü durdurarak CPU tüketimini sıfırla
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    } else {
      // Sekme tekrar öne geldiğinde delta sıçramalarını önleyerek güvenle devam et
      if (this.isRunning && !this.isPaused && this.animFrameId === null) {
        this.lastTime = performance.now();
        this.animFrameId = requestAnimationFrame(this.loop);
      }
    }
  };

  /**
   * Oyun motorunu duraklatır (Örn: Akıllı Tahta veya modal açıldığında).
   * Animasyon döngüsünü tamamen durdurur (cancelAnimationFrame) ve basılı tuşları temizler.
   */
  public pause() {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.keysDown.clear();
    this.virtualMovement = { x: 0, y: 0 };
    this.clearPath();
    this.player.state = 'idle';
    this.player.walkFrame = 0;
  }

  /**
   * Duraklatılan motoru güvenli biçimde yeniden etkinleştirir.
   * Animasyon döngüsünü zaman sıçraması (delta spike) olmadan yeniden başlatır.
   */
  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now(); // Büyük delta sıçramalarını önle
    if (this.isRunning && this.animFrameId === null) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public isAnimFrameActive(): boolean {
    return this.animFrameId !== null;
  }

  public getPosition(): Position {
    return { x: this.player.x, y: this.player.y };
  }

  public setPosition(pos: Position) {
    this.player.x = Math.max(16, Math.min(this.config.width - 16, pos.x));
    this.player.y = Math.max(20, Math.min(this.config.height - 20, pos.y));
    this.updateCamera(true);
  }

  /**
   * Ekran boyutu değiştiğinde canvas boyutunu ve kamerayı günceller.
   */
  public updateDimensions(width: number, height: number) {
    this.canvas.width = Math.max(320, width);
    this.canvas.height = Math.max(240, height);
    this.updateCamera(true);
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Modal açıkken veya metin kutusundayken girdileri işleme
    if (this.isPaused || this.isInputFocused()) return;

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
      // Klavye hareketine başlandığında otomatik yol bulma rotası iptal edilir
      this.clearPath();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.isPaused) return;
    const key = e.key.toLowerCase();
    this.keysDown.delete(key);
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (this.isPaused || e.button !== 0) return; // Yalnızca sol tık ve aktif durumda

    const rect = this.canvas.getBoundingClientRect();
    const rectW = rect.width || this.canvas.width || 800;
    const rectH = rect.height || this.canvas.height || 600;

    // CSS ölçekleme (Responsive / devicePixelRatio) oranlarını hesaba kat
    const scaleX = rectW > 0 ? this.canvas.width / rectW : 1;
    const scaleY = rectH > 0 ? this.canvas.height / rectH : 1;

    const clickX = (e.clientX - (rect.left || 0)) * scaleX;
    const clickY = (e.clientY - (rect.top || 0)) * scaleY;

    // Ekran koordinatını dünya koordinatına çevir
    const worldX = clickX + this.camera.x;
    const worldY = clickY + this.camera.y;

    this.navigateWalkToTarget(worldX, worldY);
  };

  /**
   * Karakteri A* yol bulma algoritmasıyla engellerin etrafından hedefe yönlendirir.
   */
  public navigateWalkToTarget(targetX: number, targetY: number) {
    // Sahne sınırları dışındaysa engelle
    const clampedX = Math.max(16, Math.min(this.config.width - 16, targetX));
    const clampedY = Math.max(20, Math.min(this.config.height - 20, targetY));

    const path = findPath(
      { x: this.player.x, y: this.player.y },
      { x: clampedX, y: clampedY },
      this.config,
      DEFAULT_HITBOX,
    );

    if (!path || path.length === 0) {
      if (this.callbacks.onUnreachableTarget) {
        this.callbacks.onUnreachableTarget({ x: targetX, y: targetY });
      }
      return;
    }

    this.pathWaypoints = path;
    this.currentWaypointIndex = 0;
  }

  /**
   * Testler ve doğrudan hedefleme için rota belirleme.
   */
  public setTarget(x: number, y: number) {
    this.navigateWalkToTarget(x, y);
  }

  public getPathWaypoints(): readonly Position[] {
    return this.pathWaypoints;
  }

  public clearPath() {
    this.pathWaypoints = [];
    this.currentWaypointIndex = 0;
  }

  public setVirtualDirection(vx: number, vy: number) {
    if (this.isPaused) return;
    this.virtualMovement = { x: vx, y: vy };
    if (vx !== 0 || vy !== 0) {
      this.clearPath();
    }
  }

  public triggerActiveInteraction() {
    if (this.isPaused) return;
    if (this.activeZone) {
      this.activeZone.action();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    if (this.animFrameId === null) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning || this.isPaused) {
      this.animFrameId = null;
      return;
    }

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

    // 3. Otomatik yol bulma rotasını takip et
    if (vx === 0 && vy === 0 && this.currentWaypointIndex < this.pathWaypoints.length) {
      const target = this.pathWaypoints[this.currentWaypointIndex];
      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 6) {
        // Ara noktaya ulaşıldı, bir sonrakine geç
        this.currentWaypointIndex++;
        if (this.currentWaypointIndex >= this.pathWaypoints.length) {
          this.clearPath();
        }
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
      // Beklenmedik bir çarpışma olursa rotayı temizle
      if (this.pathWaypoints.length > 0) this.clearPath();
    }

    // Y ekseninde hareket denemesi (duvar boyunca kayma / sliding)
    const targetY = this.player.y + dy;
    if (!this.checkObstacleCollision(this.player.x, targetY)) {
      this.player.y = Math.max(20, Math.min(this.config.height - 20, targetY));
    } else {
      if (this.pathWaypoints.length > 0) this.clearPath();
    }
  }

  private checkObstacleCollision(x: number, y: number): boolean {
    const boxW = DEFAULT_HITBOX.width;
    const boxH = DEFAULT_HITBOX.height;
    const left = x - boxW / 2;
    const right = x + boxW / 2;
    const top = y + DEFAULT_HITBOX.offsetY;
    const bottom = top + boxH;

    // Sahne sınırları
    if (left < 0 || right > this.config.width || top < 0 || bottom > this.config.height) {
      return true;
    }

    for (let i = 0; i < this.config.obstacles.length; i++) {
      const obs = this.config.obstacles[i];
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

    // Otomatik yol bulma rotası çizimi
    if (this.pathWaypoints.length > 0 && this.currentWaypointIndex < this.pathWaypoints.length) {
      const finalTarget = this.pathWaypoints[this.pathWaypoints.length - 1];

      ctx.save();
      // Rota çizgisi
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y + 12);
      for (let i = this.currentWaypointIndex; i < this.pathWaypoints.length; i++) {
        ctx.lineTo(this.pathWaypoints[i].x, this.pathWaypoints[i].y + 12);
      }
      ctx.strokeStyle = '#0e768a';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Hedef halkası
      ctx.beginPath();
      ctx.arc(finalTarget.x, finalTarget.y + 12, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#a66414';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();
    }

    // Karakteri çiz
    drawCharacter(ctx, this.player);

    ctx.restore();
  }
}
