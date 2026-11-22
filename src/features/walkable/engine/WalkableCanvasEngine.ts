import type { SceneNpcConfig } from '@/src/data/sultanhaniNpc';
import type {
  CharacterDirection,
  InteractiveZone,
  NpcCharacter,
  NpcPatrolPhase,
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
  /**
   * Katmanlı ve Derinlik Sıralı (Y-Sorting) Çizim Desteği:
   * 1. onRenderBackground: Zemin, yollar, arka plan surları ve zemin mozaikleri.
   * 2. onRenderEntities: Binalar, ağaçlar, şadırvan haznesi, banklar ve oyuncu karakteri (Y eksenine göre sıralı).
   * 3. onRenderForeground: Ön plan yaprak saçağı, atmosferik ışık demetleri vb.
   */
  onRenderBackground?: (ctx: CanvasRenderingContext2D, camera: Position) => void;
  onRenderEntities?: (
    ctx: CanvasRenderingContext2D,
    player: PlayerCharacter,
    camera: Position,
    npc?: NpcCharacter | null,
  ) => void;
  onRenderForeground?: (ctx: CanvasRenderingContext2D, camera: Position) => void;
  onNpcProximityChange?: (state: { inRange: boolean; screenPos: Position | null }) => void;
}

export class WalkableCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: WalkableSceneConfig;
  private callbacks: EngineCallbacks;

  public player: PlayerCharacter;
  public npc: NpcCharacter | null = null;
  public camera: Position = { x: 0, y: 0 };
  public zoom: number = 1;

  private keysDown: Set<string> = new Set();
  private virtualMovement: Position = { x: 0, y: 0 };
  private pathWaypoints: Position[] = [];
  private currentWaypointIndex: number = 0;
  private activeZone: InteractiveZone | null = null;

  private npcConfig: SceneNpcConfig | null = null;
  private npcPatrolPhase: NpcPatrolPhase = 'moving_left';
  private npcPauseTimerMs: number = 0;
  private npcInRange: boolean = false;
  private isNpcTalking: boolean = false;
  private lastNpcScreenPos: Position | null = null;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isInputDisabled: boolean = false;
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
    this.callbacks = callbacks ?? {};

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

    if (config.npc) {
      this.npcConfig = config.npc;
      this.npcPatrolPhase =
        config.npc.patrol.initialDirection === 'right' ? 'moving_right' : 'moving_left';
      this.npc = {
        id: config.npc.id,
        name: config.npc.name,
        x: config.npc.startPosition.x,
        y: config.npc.startPosition.y,
        width: config.npc.width,
        height: config.npc.height,
        direction: config.npc.patrol.initialDirection,
        state: 'idle',
        speed: config.npc.speed,
        walkFrame: 0,
        visible: config.isNpcVisible ? config.isNpcVisible() : true,
      };
    }

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
    this.render();
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

  public setInputDisabled(disabled: boolean) {
    this.isInputDisabled = disabled;
    if (disabled) {
      this.keysDown.clear();
      this.virtualMovement = { x: 0, y: 0 };
      this.clearPath();
      this.player.state = 'idle';
      this.player.walkFrame = 0;
    }
  }

  public getInputDisabled(): boolean {
    return this.isInputDisabled;
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
   * Ekran boyutu değiştiğinde canvas boyutunu, ölçeği (zoom) ve kamerayı günceller.
   */
  public updateDimensions(width: number, height: number) {
    this.canvas.width = Math.max(320, width);
    this.canvas.height = Math.max(240, height);
    this.updateCamera(true);
    this.checkNpcProximity();
    if (this.isRunning) {
      this.render();
    }
  }

  /**
   * NPC konuşma durumunu ayarlar; konuşma sırasında NPC durur ve öğrenciye döner.
   */
  public setNpcTalking(talking: boolean) {
    this.isNpcTalking = talking;
    if (!this.npc) return;

    if (talking) {
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.faceNpcTowardPlayer();
    } else if (this.npcPatrolPhase === 'moving_left') {
      this.npc.direction = 'left';
    } else if (this.npcPatrolPhase === 'moving_right') {
      this.npc.direction = 'right';
    }

    if (this.isRunning) {
      this.render();
    }
  }

  /**
   * Etkileşim bölgelerini günceller ve mevcut aktif bölgeyi yeniler.
   */
  public updateInteractiveZones(zones: InteractiveZone[]) {
    this.config.interactiveZones = zones;
    this.checkInteractiveZones();
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Modal açıkken veya metin kutusundayken girdileri işleme
    if (this.isPaused || this.isInputDisabled || this.isInputFocused()) return;

    const key = e.key.toLowerCase();

    // Etkileşim tuşu (Konuşma balonu açıkken Boşluk tuşunu konuşma balonuna bırak)
    if (key === 'e' || (key === ' ' && !this.isNpcTalking)) {
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
    if (this.isPaused || this.isInputDisabled) return;
    const key = e.key.toLowerCase();
    this.keysDown.delete(key);
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (this.isPaused || this.isInputDisabled || e.button !== 0) return; // Yalnızca sol tık ve aktif durumda

    const rect = this.canvas.getBoundingClientRect();
    const rectW = rect.width || this.canvas.width || 800;
    const rectH = rect.height || this.canvas.height || 600;

    // CSS ölçekleme (Responsive / devicePixelRatio) oranlarını hesaba kat
    const scaleX = rectW > 0 ? this.canvas.width / rectW : 1;
    const scaleY = rectH > 0 ? this.canvas.height / rectH : 1;

    const clickX = (e.clientX - (rect.left || 0)) * scaleX;
    const clickY = (e.clientY - (rect.top || 0)) * scaleY;

    // Ekran koordinatını kamera ölçeği (zoom) ve kaydırmasıyla dünya koordinatına çevir
    const zoom = this.zoom || 1;
    const worldX = clickX / zoom + this.camera.x;
    const worldY = clickY / zoom + this.camera.y;

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
    if (this.isPaused || this.isInputDisabled) return;
    this.virtualMovement = { x: vx, y: vy };
    if (vx !== 0 || vy !== 0) {
      this.clearPath();
    }
  }

  public triggerActiveInteraction() {
    if (this.isPaused || this.isInputDisabled) return;
    if (this.activeZone) {
      this.activeZone.action();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.render();
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
    if (this.isInputDisabled) {
      this.player.state = 'idle';
      this.player.walkFrame = 0;
      return;
    }

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
      this.player.walkFrame += delta * 6.5; // Adım ritmi (Aşama 4.5: Yürüyüş hızıyla tam senkron)

      // Yön belirleme (Aşama 4.5: Çapraz hareketlerde yön titremesini önleyen histerezis eşiği)
      const absX = Math.abs(vx);
      const absY = Math.abs(vy);
      if (absX > absY * 1.15) {
        this.player.direction = (vx > 0 ? 'right' : 'left') as CharacterDirection;
      } else if (absY > absX * 1.15) {
        this.player.direction = (vy > 0 ? 'down' : 'up') as CharacterDirection;
      }
    } else {
      this.player.state = 'idle';
      this.player.walkFrame = 0;
    }

    // 4. Çarpışma algılama ve hareket uygulama
    this.movePlayerWithCollision(vx * delta, vy * delta);

    // 5. Kamera, NPC devriyesi ve etkileşim bölgelerini güncelle
    this.updateCamera();
    this.updateNpc(delta);
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

  private calculateZoom(): number {
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 600;
    const minZoom = w >= 1024 ? 0.85 : 1;
    return Math.max(minZoom, w / this.config.width, h / this.config.height);
  }

  private updateCamera(instant: boolean = false) {
    this.zoom = this.calculateZoom();
    const viewportW = this.canvas.width / this.zoom;
    const viewportH = this.canvas.height / this.zoom;

    const maxCamX = Math.max(0, this.config.width - viewportW);
    const maxCamY = Math.max(0, this.config.height - viewportH);

    // Karakteri ekranda ortalama hedefi
    const targetCamX = Math.max(0, Math.min(maxCamX, this.player.x - viewportW / 2));

    let targetCamY: number;
    if (maxCamY > 0 && maxCamY <= 160) {
      // Geniş ekran (16:9 vb.) kadraj yönetimi: Sahnenin tamamına yakını dikeyde sığdığında,
      // yalnızca üst ve alt dekoratif kenarları kırparak kritik yapıları (akıllı tahta,
      // sınıf panosu, bina kubbeleri/kitabeleri, masalar ve karakter) aynı anda görünür tutar.
      const northThreshold = this.config.height * 0.35;
      const midNorthThreshold = this.config.height * 0.5;
      const southThreshold = this.config.height * 0.82;
      const maxWalkSouth = this.config.height * 0.92;
      const baseCamY = maxCamY * 0.22;

      if (this.player.y <= northThreshold) {
        targetCamY = 0;
      } else if (this.player.y <= midNorthThreshold) {
        const t = (this.player.y - northThreshold) / (midNorthThreshold - northThreshold);
        targetCamY = baseCamY * t;
      } else if (this.player.y <= southThreshold) {
        targetCamY = baseCamY;
      } else {
        const t = Math.min(1, (this.player.y - southThreshold) / (maxWalkSouth - southThreshold));
        targetCamY = baseCamY + (maxCamY - baseCamY) * t;
      }
      targetCamY = Math.max(0, Math.min(maxCamY, targetCamY));
    } else {
      targetCamY = Math.max(0, Math.min(maxCamY, this.player.y - viewportH / 2));
    }

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

  private faceNpcTowardPlayer() {
    if (!this.npc) return;
    const dx = this.player.x - this.npc.x;
    const dy = this.player.y - this.npc.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      this.npc.direction = dx >= 0 ? 'right' : 'left';
    } else {
      this.npc.direction = dy >= 0 ? 'down' : 'up';
    }
  }

  private getRenderTransform() {
    const zoom = this.zoom || 1;
    const offsetX = Math.min(
      0,
      Math.max(this.canvas.width - this.config.width * zoom, -Math.round(this.camera.x * zoom)),
    );
    const offsetY = Math.min(
      0,
      Math.max(this.canvas.height - this.config.height * zoom, -Math.round(this.camera.y * zoom)),
    );
    return { zoom, offsetX, offsetY };
  }

  private computeNpcScreenPos(): Position | null {
    if (!this.npc || !this.npc.visible) return null;
    const { zoom, offsetX, offsetY } = this.getRenderTransform();
    const canvasX = this.npc.x * zoom + offsetX;
    const canvasY = (this.npc.y + 18 - this.npc.height) * zoom + offsetY;
    const rect = this.canvas.getBoundingClientRect?.();
    const scaleX = rect && rect.width > 0 && this.canvas.width > 0 ? rect.width / this.canvas.width : 1;
    const scaleY = rect && rect.height > 0 && this.canvas.height > 0 ? rect.height / this.canvas.height : 1;
    return {
      x: Math.round(canvasX * scaleX),
      y: Math.round(canvasY * scaleY),
    };
  }

  private checkNpcProximity() {
    if (!this.npc || !this.npcConfig) return;

    if (!this.npc.visible) {
      if (this.npcInRange || this.lastNpcScreenPos !== null) {
        this.npcInRange = false;
        this.lastNpcScreenPos = null;
        this.callbacks.onNpcProximityChange?.({ inRange: false, screenPos: null });
      }
      return;
    }

    const dist = Math.hypot(this.player.x - this.npc.x, this.player.y - this.npc.y);
    const wasInRange = this.npcInRange;

    if (!this.npcInRange && dist <= this.npcConfig.interactionEnterRadius) {
      this.npcInRange = true;
    } else if (this.npcInRange && dist > this.npcConfig.interactionExitRadius) {
      this.npcInRange = false;
    }

    const screenPos = this.computeNpcScreenPos();
    const posChanged =
      this.npcInRange &&
      screenPos !== null &&
      (this.lastNpcScreenPos === null ||
        Math.abs(screenPos.x - this.lastNpcScreenPos.x) >= 1 ||
        Math.abs(screenPos.y - this.lastNpcScreenPos.y) >= 1);

    if (wasInRange !== this.npcInRange || posChanged) {
      this.lastNpcScreenPos = screenPos;
      this.callbacks.onNpcProximityChange?.({
        inRange: this.npcInRange,
        screenPos,
      });
    }
  }

  private updateNpc(delta: number) {
    if (!this.npc || !this.npcConfig) return;

    if (this.config.isNpcVisible) {
      this.npc.visible = this.config.isNpcVisible();
    }

    if (!this.npc.visible) {
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.checkNpcProximity();
      return;
    }

    if (this.isNpcTalking) {
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.faceNpcTowardPlayer();
      this.checkNpcProximity();
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.checkNpcProximity();
      return;
    }

    const { minX, maxX, endpointPauseMs } = this.npcConfig.patrol;

    if (this.npcPatrolPhase === 'moving_left') {
      this.npc.direction = 'left';
      this.npc.state = 'walk';
      this.npc.walkFrame += delta * 4.5;
      this.npc.x -= this.npc.speed * delta;
      if (this.npc.x <= minX) {
        this.npc.x = minX;
        this.npc.state = 'idle';
        this.npc.walkFrame = 0;
        this.npcPatrolPhase = 'pausing_left';
        this.npcPauseTimerMs = endpointPauseMs;
      }
    } else if (this.npcPatrolPhase === 'pausing_left') {
      this.npc.direction = 'left';
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.npcPauseTimerMs -= delta * 1000;
      if (this.npcPauseTimerMs <= 0) {
        this.npcPauseTimerMs = 0;
        this.npcPatrolPhase = 'moving_right';
      }
    } else if (this.npcPatrolPhase === 'moving_right') {
      this.npc.direction = 'right';
      this.npc.state = 'walk';
      this.npc.walkFrame += delta * 4.5;
      this.npc.x += this.npc.speed * delta;
      if (this.npc.x >= maxX) {
        this.npc.x = maxX;
        this.npc.state = 'idle';
        this.npc.walkFrame = 0;
        this.npcPatrolPhase = 'pausing_right';
        this.npcPauseTimerMs = endpointPauseMs;
      }
    } else {
      this.npc.direction = 'right';
      this.npc.state = 'idle';
      this.npc.walkFrame = 0;
      this.npcPauseTimerMs -= delta * 1000;
      if (this.npcPauseTimerMs <= 0) {
        this.npcPauseTimerMs = 0;
        this.npcPatrolPhase = 'moving_left';
      }
    }

    this.checkNpcProximity();
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

    if (nearest?.id !== this.activeZone?.id || nearest?.prompt !== this.activeZone?.prompt) {
      this.activeZone = nearest;
      this.callbacks.onActiveZoneChange(nearest);
    }
  }

  private drawPathOverlay(ctx: CanvasRenderingContext2D) {
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
  }

  private render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.npc && this.config.isNpcVisible) {
      this.npc.visible = this.config.isNpcVisible();
    }

    ctx.save();
    // Kamerayı ve sahne en-boy oranını koruyan tam ekran ölçeğini (zoom) uygula
    const { zoom, offsetX, offsetY } = this.getRenderTransform();
    ctx.translate(offsetX, offsetY);
    if (zoom !== 1) {
      ctx.scale(zoom, zoom);
    }

    if (this.callbacks.onRenderEntities) {
      // 1. Zemin ve Arka Plan Katmanı
      if (this.callbacks.onRenderBackground) {
        this.callbacks.onRenderBackground(ctx, this.camera);
      }

      // 2. Navigasyon Yol Göstergesi (Zemin üzerinde, varlıkların altında)
      this.drawPathOverlay(ctx);

      // 3. Y-Sorting Varlıklar ve Karakter Katmanı
      this.callbacks.onRenderEntities(ctx, this.player, this.camera, this.npc);

      // 4. Ön Plan / Sinematik Çerçeve Katmanı
      if (this.callbacks.onRenderForeground) {
        this.callbacks.onRenderForeground(ctx, this.camera);
      }
    } else {
      // Geriye dönük uyumluluk modu (onCustomRender + drawCharacter)
      if (this.callbacks.onCustomRender) {
        this.callbacks.onCustomRender(ctx, this.camera);
      }

      this.drawPathOverlay(ctx);

      // Karakteri çiz
      drawCharacter(ctx, this.player);
    }

    ctx.restore();
  }
}
