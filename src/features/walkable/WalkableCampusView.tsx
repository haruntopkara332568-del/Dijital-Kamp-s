import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { WalkableCanvasEngine } from './engine/WalkableCanvasEngine';
import {
  renderCourtyardBackground,
  renderCourtyardLayeredBackground,
  renderCourtyardEntities,
  renderCourtyardForeground,
} from './engine/courtyardSceneRenderer';
import {
  renderClassroomBackground,
  renderClassroomLayeredBackground,
  renderClassroomEntities,
  renderClassroomForeground,
} from './engine/classroomSceneRenderer';
import { WalkableControlsOverlay } from './components/WalkableControlsOverlay';
import { SmartBoardModal } from './components/SmartBoardModal';
import type { InteractiveZone, Position, SceneObstacle, WalkableSceneConfig } from './types';

export interface WalkableCampusViewProps {
  initialScene?: 'courtyard' | 'classroom';
  onBackToMap?: () => void;
}

export function WalkableCampusView({
  initialScene = 'courtyard',
  onBackToMap,
}: WalkableCampusViewProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WalkableCanvasEngine | null>(null);

  // Sahne içi son konumları saklayarak geri dönüşlerde konumu koruma (Section 6)
  const lastCourtyardPosRef = useRef<Position>({ x: 700, y: 560 });
  const lastClassroomPosRef = useRef<Position>({ x: 480, y: 520 });

  const [currentScene, setCurrentScene] = useState<'courtyard' | 'classroom'>(initialScene);
  const [activeZone, setActiveZone] = useState<InteractiveZone | null>(null);
  const [unreachableMessage, setUnreachableMessage] = useState<string | null>(null);
  const [isSmartBoardModalOpen, setIsSmartBoardModalOpen] = useState(false);
  const [isSmartBoardPoweringOn, setIsSmartBoardPoweringOn] = useState(false);
  const [isSmartBoardActive, setIsSmartBoardActive] = useState(false);

  // Akıllı tahta animasyon durumunu ref üzerinden aktararak motorun gereksiz sıfırlanmasını önle
  const smartBoardVisualStateRef = useRef({
    active: false,
    poweringOn: false,
  });

  useEffect(() => {
    smartBoardVisualStateRef.current = {
      active: isSmartBoardActive,
      poweringOn: isSmartBoardPoweringOn,
    };
  }, [isSmartBoardActive, isSmartBoardPoweringOn]);

  const handleBackToMap = useCallback(() => {
    if (onBackToMap) {
      onBackToMap();
    } else {
      navigate('/harita');
    }
  }, [onBackToMap, navigate]);

  // Sahneye göre konfigürasyon belirleme
  const getSceneConfig = useCallback(
    (scene: 'courtyard' | 'classroom'): WalkableSceneConfig => {
      if (scene === 'classroom') {
        const obstacles: SceneObstacle[] = [
          // Kuzey ön duvar ve akıllı tahta altı
          { id: 'north-wall', name: 'Ön Duvar', x: 0, y: 0, width: 960, height: 130 },
          // Öğretmen kürsüsü
          { id: 'podium', name: 'Öğretmen Kürsüsü', x: 670, y: 160, width: 100, height: 50 },
          // Kitaplık
          { id: 'bookshelf', name: 'Kitaplık', x: 40, y: 150, width: 60, height: 85 },
          // Öğrenci sıraları
          { id: 'desk-1', name: 'Öğrenci Sırası 1', x: 190, y: 260, width: 150, height: 55 },
          { id: 'desk-2', name: 'Öğrenci Sırası 2', x: 590, y: 260, width: 150, height: 55 },
          { id: 'desk-3', name: 'Öğrenci Sırası 3', x: 190, y: 390, width: 150, height: 55 },
          { id: 'desk-4', name: 'Öğrenci Sırası 4', x: 590, y: 390, width: 150, height: 55 },
        ];

        const interactiveZones: InteractiveZone[] = [
          {
            id: 'smart-board',
            name: 'Akıllı Tahta',
            prompt: 'Akıllı Tahtayı Aç',
            x: 480,
            y: 160,
            radius: 80,
            action: () => {
              setIsSmartBoardPoweringOn(true);
              setTimeout(() => {
                setIsSmartBoardPoweringOn(false);
                setIsSmartBoardActive(true);
                setIsSmartBoardModalOpen(true);
              }, 600);
            },
          },
          {
            id: 'exit-door',
            name: 'Avluya Dönüş Kapısı',
            prompt: 'Avluya Dön',
            x: 480,
            y: 590,
            radius: 65,
            action: () => {
              // Avluya dönerken İngilizce binasının kapı önüne çık
              lastCourtyardPosRef.current = { x: 970, y: 350 };
              setCurrentScene('courtyard');
            },
          },
        ];

        return {
          width: 960,
          height: 640,
          playerSpawn: lastClassroomPosRef.current,
          obstacles,
          interactiveZones,
        };
      }

      // 'courtyard' (Kampüs Avlusu)
      const obstacles: SceneObstacle[] = [
        // İngilizce Dünyası Binası
        { id: 'bldg-english', name: 'İngilizce Dünyası', x: 860, y: 140, width: 220, height: 180 },
        // Gezi ve Keşif Binası
        { id: 'bldg-discovery', name: 'Gezi ve Keşif', x: 180, y: 140, width: 220, height: 180 },
        // Kitap ve Hikâye Dünyası
        { id: 'bldg-library', name: 'Kitap Dünyası', x: 580, y: 100, width: 240, height: 170 },
        // Kampüs Yolculuğum Köşkü
        { id: 'pavilion-journey', name: 'Kampüs Yolculuğum', x: 220, y: 560, width: 190, height: 140 },
        // Keşif Görevleri Panosu
        { id: 'kiosk-missions', name: 'Görev Panosu', x: 910, y: 560, width: 190, height: 140 },
        // Merkez Havuz / Fıskiye
        { id: 'fountain', name: 'Merkez Havuz', x: 670, y: 450, width: 60, height: 60 },
      ];

      const interactiveZones: InteractiveZone[] = [
        // 1. İngilizce Dünyası Binası (Sinematik Sınıf ve Akıllı Tahta)
        {
          id: 'enter-english',
          name: 'İngilizce Dünyası Girişi',
          prompt: 'İngilizce Sınıfına Gir',
          x: 970,
          y: 335,
          radius: 70,
          action: () => {
            lastClassroomPosRef.current = { x: 480, y: 520 };
            setCurrentScene('classroom');
          },
        },
        // 2. Gezi ve Keşif Binası (Kültürel Miras Rotaları ve Gözlem)
        {
          id: 'enter-discovery',
          name: 'Gezi ve Keşif Girişi',
          prompt: 'Gezi ve Keşif Alanına Gir',
          x: 290,
          y: 335,
          radius: 70,
          action: () => {
            lastCourtyardPosRef.current = { x: 290, y: 350 };
            navigate('/alan/gezi-ve-kesif');
          },
        },
        // 3. Kitap ve Hikâye Dünyası Binası (Okuma ve Üretim Atölyesi)
        {
          id: 'enter-library',
          name: 'Kitap ve Hikâye Dünyası Girişi',
          prompt: 'Kitap ve Hikâye Dünyasına Gir',
          x: 700,
          y: 285,
          radius: 70,
          action: () => {
            lastCourtyardPosRef.current = { x: 700, y: 300 };
            navigate('/alan/kitap-ve-hikaye-dunyasi');
          },
        },
        // 4. Kampüs Yolculuğum Köşkü (Öğrenci Portfolyosu ve Rozetler)
        {
          id: 'enter-journey',
          name: 'Kampüs Yolculuğum Girişi',
          prompt: 'Kampüs Yolculuğumu Aç',
          x: 315,
          y: 545,
          radius: 70,
          action: () => {
            lastCourtyardPosRef.current = { x: 315, y: 530 };
            navigate('/yolculugum');
          },
        },
        // 5. Keşif Görevleri Panosu (Bütünleşik Görev Listesi)
        {
          id: 'enter-kiosk',
          name: 'Keşif Görevleri Panosu',
          prompt: 'Keşif Görevlerini İncele',
          x: 1005,
          y: 545,
          radius: 70,
          action: () => {
            lastCourtyardPosRef.current = { x: 1005, y: 530 };
            navigate('/alan/gorev-panosu');
          },
        },
        // 6. Selçuklu Yıldız Havuzu (Meydan Dinlenme Noktası)
        {
          id: 'fountain-rest',
          name: 'Selçuklu Yıldız Havuzu',
          prompt: 'Havuz Başında Dinlen',
          x: 700,
          y: 480,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Selçuklu sekiz köşeli yıldız havuzunun şırıltısıyla kampüsün tüm yolları burada birleşiyor.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
      ];

      return {
        width: 1400,
        height: 900,
        playerSpawn: lastCourtyardPosRef.current,
        obstacles,
        interactiveZones,
      };
    },
    [navigate],
  );

  // Motor başlatma ve sahne yükleme (Yalnızca sahne değiştiğinde çalışır, React durum güncellemelerinde motor sıfırlanmaz)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const config = getSceneConfig(currentScene);

    // Canvas boyutunu container'a göre uyarla
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const newW = Math.max(320, Math.floor(rect.width));
      const newH = Math.max(240, Math.floor(rect.height));
      canvas.width = newW;
      canvas.height = newH;
      if (engineRef.current) {
        engineRef.current.updateDimensions(newW, newH);
      }
    };

    updateCanvasSize();

    const spawnPos = currentScene === 'classroom' ? lastClassroomPosRef.current : lastCourtyardPosRef.current;

    const engine = new WalkableCanvasEngine(
      canvas,
      config,
      {
        onActiveZoneChange: (zone) => setActiveZone(zone),
        onPositionChange: (pos) => {
          if (currentScene === 'classroom') {
            lastClassroomPosRef.current = pos;
          } else {
            lastCourtyardPosRef.current = pos;
          }
        },
        onUnreachableTarget: () => {
          setUnreachableMessage('Oraya ulaşılamıyor, lütfen açık bir yola tıkla.');
          setTimeout(() => setUnreachableMessage(null), 2500);
        },
        onRenderBackground: (ctx) => {
          if (currentScene === 'classroom') {
            renderClassroomLayeredBackground(
              ctx,
              config.width,
              config.height,
              smartBoardVisualStateRef.current.active,
              smartBoardVisualStateRef.current.poweringOn,
            );
          } else {
            renderCourtyardLayeredBackground(ctx, config.width, config.height);
          }
        },
        onRenderEntities: (ctx, player) => {
          if (currentScene === 'classroom') {
            renderClassroomEntities(ctx, player, config.width, config.height);
          } else {
            renderCourtyardEntities(ctx, player, config.width, config.height);
          }
        },
        onRenderForeground: (ctx) => {
          if (currentScene === 'classroom') {
            renderClassroomForeground(ctx, config.width, config.height);
          } else {
            renderCourtyardForeground(ctx, config.width, config.height);
          }
        },
        onCustomRender: (ctx) => {
          if (currentScene === 'classroom') {
            renderClassroomBackground(
              ctx,
              config.width,
              config.height,
              smartBoardVisualStateRef.current.active,
              smartBoardVisualStateRef.current.poweringOn,
            );
          } else {
            renderCourtyardBackground(ctx, config.width, config.height);
          }
        },
      },
      spawnPos,
    );

    engine.start();
    engineRef.current = engine;
    if (typeof window !== 'undefined') {
      (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__ = engine;
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && engineRef.current) {
            engineRef.current.updateDimensions(Math.floor(width), Math.floor(height));
          }
        }
      });
      ro.observe(container);
    }

    return () => {
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __WALKABLE_ENGINE__?: WalkableCanvasEngine }).__WALKABLE_ENGINE__;
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, [currentScene, getSceneConfig]);

  // Akıllı Tahta modalı açıldığında oyun motorunu duraklat, kapandığında güvenle devam ettir (Section 5)
  useEffect(() => {
    if (!engineRef.current) return;
    if (isSmartBoardModalOpen) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [isSmartBoardModalOpen]);

  const handleVirtualDirection = (vx: number, vy: number) => {
    if (engineRef.current) {
      engineRef.current.setVirtualDirection(vx, vy);
    }
  };

  const handleTriggerInteraction = () => {
    if (engineRef.current) {
      engineRef.current.triggerActiveInteraction();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-dvh bg-[var(--campus-canvas)] overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        data-testid="walkable-canvas"
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Ekran Üstü Kontroller ve İpuçları */}
      <WalkableControlsOverlay
        activeZone={activeZone}
        onTriggerInteraction={handleTriggerInteraction}
        onVirtualDirection={handleVirtualDirection}
        onBackToMap={handleBackToMap}
        onExitClassroom={
          currentScene === 'classroom'
            ? () => {
                lastCourtyardPosRef.current = { x: 970, y: 350 };
                setCurrentScene('courtyard');
              }
            : undefined
        }
        unreachableMessage={unreachableMessage}
        currentScene={currentScene}
      />

      {/* Akıllı Tahta Modal Penceresi */}
      <SmartBoardModal
        isOpen={isSmartBoardModalOpen}
        onClose={() => setIsSmartBoardModalOpen(false)}
        missionId="kapilarin-anlattigi-hikaye"
      />
    </div>
  );
}
