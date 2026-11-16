import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { WalkableCanvasEngine } from './engine/WalkableCanvasEngine';
import { renderCourtyardBackground } from './engine/courtyardSceneRenderer';
import { renderClassroomBackground } from './engine/classroomSceneRenderer';
import { WalkableControlsOverlay } from './components/WalkableControlsOverlay';
import { SmartBoardModal } from './components/SmartBoardModal';
import type { InteractiveZone, SceneObstacle, WalkableSceneConfig } from './types';

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

  const [currentScene, setCurrentScene] = useState<'courtyard' | 'classroom'>(initialScene);
  const [activeZone, setActiveZone] = useState<InteractiveZone | null>(null);
  const [unreachableMessage, setUnreachableMessage] = useState<string | null>(null);
  const [isSmartBoardModalOpen, setIsSmartBoardModalOpen] = useState(false);
  const [isSmartBoardPoweringOn, setIsSmartBoardPoweringOn] = useState(false);
  const [isSmartBoardActive, setIsSmartBoardActive] = useState(false);

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
              setCurrentScene('courtyard');
            },
          },
        ];

        return {
          width: 960,
          height: 640,
          playerSpawn: { x: 480, y: 520 },
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
        {
          id: 'enter-english',
          name: 'İngilizce Dünyası Girişi',
          prompt: 'İngilizce Sınıfına Gir',
          x: 970,
          y: 335,
          radius: 70,
          action: () => {
            setCurrentScene('classroom');
          },
        },
      ];

      return {
        width: 1400,
        height: 900,
        playerSpawn: { x: 700, y: 560 },
        obstacles,
        interactiveZones,
      };
    },
    [],
  );

  // Motor başlatma ve sahne yükleme
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const config = getSceneConfig(currentScene);

    // Canvas boyutunu container'a göre uyarla
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width));
      canvas.height = Math.max(240, Math.floor(rect.height));
    };

    updateCanvasSize();

    const engine = new WalkableCanvasEngine(canvas, config, {
      onActiveZoneChange: (zone) => setActiveZone(zone),
      onUnreachableTarget: () => {
        setUnreachableMessage('Oraya ulaşılamıyor, lütfen açık bir yola tıkla.');
        setTimeout(() => setUnreachableMessage(null), 2500);
      },
      onCustomRender: (ctx) => {
        if (currentScene === 'classroom') {
          renderClassroomBackground(
            ctx,
            config.width,
            config.height,
            isSmartBoardActive,
            isSmartBoardPoweringOn,
          );
        } else {
          renderCourtyardBackground(ctx, config.width, config.height);
        }
      },
    });

    engine.start();
    engineRef.current = engine;

    const ro = new ResizeObserver(() => {
      updateCanvasSize();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [currentScene, getSceneConfig, isSmartBoardActive, isSmartBoardPoweringOn]);

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

  const handleDirectEnterClassroom = () => {
    setCurrentScene('classroom');
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
        onDirectEnterClassroom={
          currentScene === 'courtyard' ? handleDirectEnterClassroom : undefined
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
