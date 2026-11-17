import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { GradeBoardModal } from './components/GradeBoardModal';
import { TableStationModal } from './components/TableStationModal';
import { useOptionalCampus } from '../../app/CampusProviders';
import type { InteractiveZone, Position, SceneObstacle, WalkableSceneConfig } from './types';
import type { MissionStageId } from '@/src/types/campus';

export interface WalkableCampusViewProps {
  initialScene?: 'courtyard' | 'classroom';
  onBackToMap?: () => void;
  onExitToGate?: () => void;
}

export function WalkableCampusView({
  initialScene = 'courtyard',
  onBackToMap,
  onExitToGate,
}: WalkableCampusViewProps) {
  const navigate = useNavigate();
  const campus = useOptionalCampus();
  const selectedGrade = campus?.state.selectedGrade ?? null;
  const selectedGradeRef = useRef<number | null>(selectedGrade);
  const onExitToGateRef = useRef(onExitToGate);
  const campusRef = useRef(campus);

  const currentMissionProgress =
    campus && selectedGrade
      ? campus.getMissionProgress('kapilarin-anlattigi-hikaye', selectedGrade)
      : null;
  const completedStages = useMemo(
    () => currentMissionProgress?.completedStages ?? [],
    [currentMissionProgress?.completedStages],
  );
  const completedStagesRef = useRef<string[]>(completedStages);

  useEffect(() => {
    completedStagesRef.current = completedStages;
  }, [completedStages]);

  useEffect(() => {
    selectedGradeRef.current = selectedGrade;
  }, [selectedGrade]);

  useEffect(() => {
    onExitToGateRef.current = onExitToGate;
  }, [onExitToGate]);

  useEffect(() => {
    campusRef.current = campus;
  }, [campus]);

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
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [activeTableStage, setActiveTableStage] = useState<MissionStageId | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
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
          // Öğrenci sıraları (Dört Öğrenme Masası)
          { id: 'desk-1', name: 'Keşfet Masası', x: 190, y: 260, width: 150, height: 55 },
          { id: 'desk-2', name: 'Öğren Masası', x: 590, y: 260, width: 150, height: 55 },
          { id: 'desk-3', name: 'Üret Masası', x: 190, y: 390, width: 150, height: 55 },
          { id: 'desk-4', name: 'Paylaş Masası', x: 590, y: 390, width: 150, height: 55 },
        ];

        const interactiveZones: InteractiveZone[] = [
          {
            id: 'grade-board',
            name: 'Sınıf Seçim Panosu',
            prompt: 'Sınıfını Seç / Değiştir',
            x: 270,
            y: 160,
            radius: 80,
            action: () => {
              setIsGradeModalOpen(true);
            },
          },
          {
            id: 'smart-board',
            name: 'Akıllı Tahta',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : 'Akıllı Tahta (Yakında)',
            x: 480,
            y: 160,
            radius: 80,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage("Önce Sınıf Seçim Panosu'ndan sınıfını seç.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              // Görsel açılış animasyonunu koru; görevi masalara yönlendir
              setIsSmartBoardPoweringOn(true);
              setTimeout(() => {
                setIsSmartBoardPoweringOn(false);
                setIsSmartBoardActive(true);
                setUnreachableMessage(
                  'Öğrenme etkinlikleri sınıftaki dört masaya (Keşfet, Öğren, Üret, Paylaş) taşınmıştır. Akıllı tahta yakında gerçek yaşam uygulama alanı olarak açılacaktır.',
                );
                setTimeout(() => setUnreachableMessage(null), 4000);
              }, 600);
            },
          },
          // 1. KEŞFET MASASI (Sol Ön)
          {
            id: 'table-kesfet',
            name: 'Keşfet Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : "Keşfet Masası'na Otur",
            x: 265,
            y: 288,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage("Önce Sınıf Seçim Panosu'ndan sınıfını seç.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('kesfet');
              setIsTableModalOpen(true);
            },
          },
          // 2. ÖĞREN MASASI (Sağ Ön)
          {
            id: 'table-ogren',
            name: 'Öğren Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('kesfet')
                ? 'Önce Keşfet Masası'
                : "Öğren Masası'na Otur",
            x: 665,
            y: 288,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage("Önce Sınıf Seçim Panosu'ndan sınıfını seç.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              if (!completedStagesRef.current.includes('kesfet')) {
                setUnreachableMessage("Önce Keşfet Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('ogren');
              setIsTableModalOpen(true);
            },
          },
          // 3. ÜRET MASASI (Sol Arka)
          {
            id: 'table-uret',
            name: 'Üret Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('ogren')
                ? 'Önce Öğren Masası'
                : "Üret Masası'na Otur",
            x: 265,
            y: 418,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage("Önce Sınıf Seçim Panosu'ndan sınıfını seç.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              if (!completedStagesRef.current.includes('ogren')) {
                setUnreachableMessage("Önce Öğren Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('uret');
              setIsTableModalOpen(true);
            },
          },
          // 4. PAYLAŞ MASASI (Sağ Arka)
          {
            id: 'table-paylas',
            name: 'Paylaş Masası',
            prompt: !selectedGradeRef.current
              ? 'Önce Sınıfını Seç'
              : !completedStagesRef.current.includes('uret')
                ? 'Önce Üret Masası'
                : "Paylaş Masası'na Otur",
            x: 665,
            y: 418,
            radius: 75,
            action: () => {
              if (!selectedGradeRef.current) {
                setUnreachableMessage("Önce Sınıf Seçim Panosu'ndan sınıfını seç.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              if (!completedStagesRef.current.includes('uret')) {
                setUnreachableMessage("Önce Üret Masası'ndaki etkinliği tamamlamalısın.");
                setTimeout(() => setUnreachableMessage(null), 3000);
                return;
              }
              setActiveTableStage('paylas');
              setIsTableModalOpen(true);
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
        // 1. İngilizce Dünyası Binası (Şu aşamada tek aktif sınıf)
        {
          id: 'enter-english',
          name: 'İngilizce Dünyası',
          prompt: 'İngilizce Sınıfına Gir',
          x: 970,
          y: 335,
          radius: 75,
          action: () => {
            lastClassroomPosRef.current = { x: 480, y: 520 };
            setCurrentScene('classroom');
          },
        },
        // 2. Gezi ve Keşif Binası (Görsel olarak durur - Yakında)
        {
          id: 'enter-discovery',
          name: 'Gezi ve Keşif',
          prompt: 'Yakında Açılacak',
          x: 290,
          y: 335,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Gezi ve Keşif binası yakında açılacak. Şu an İngilizce Dünyası sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 3. Kitap ve Hikâye Dünyası Binası (Görsel olarak durur - Yakında)
        {
          id: 'enter-library',
          name: 'Kitap ve Hikâye Dünyası',
          prompt: 'Yakında Açılacak',
          x: 700,
          y: 285,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Kitap ve Hikâye Dünyası yakında açılacak. Şu an İngilizce Dünyası sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 4. Kampüs Yolculuğum Köşkü (Görsel olarak durur - Yakında)
        {
          id: 'enter-journey',
          name: 'Kampüs Yolculuğum',
          prompt: 'Yakında Açılacak',
          x: 315,
          y: 545,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Kampüs Yolculuğum köşkü yakında açılacak. Şu an İngilizce Dünyası sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
          },
        },
        // 5. Keşif Görevleri Panosu (Görsel olarak durur - Yakında)
        {
          id: 'enter-kiosk',
          name: 'Keşif Görevleri Panosu',
          prompt: 'Yakında Açılacak',
          x: 1005,
          y: 545,
          radius: 70,
          action: () => {
            setUnreachableMessage(
              'Görev panosu yakında açılacak. Şu an İngilizce Dünyası sınıfı aktiftir.',
            );
            setTimeout(() => setUnreachableMessage(null), 3500);
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
        // 7. Kampüs Giriş/Çıkış Kapısı (Dış Kapı Çıkışı)
        {
          id: 'exit-gate',
          name: 'Kampüs Giriş Kapısı',
          prompt: 'Kampüsten Çık',
          x: 700,
          y: 840,
          radius: 85,
          action: () => {
            if (onExitToGateRef.current) {
              onExitToGateRef.current();
            } else if (campusRef.current) {
              campusRef.current.replayWelcomeFlow();
            }
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
    [],
  );

  // Sınıf seçimi veya aşama tamamlanma durumunda etkileşim bölgelerini (prompt ve kilitleri) dinamik güncelle
  useEffect(() => {
    selectedGradeRef.current = selectedGrade;
    completedStagesRef.current = completedStages;
    if (engineRef.current && currentScene === 'classroom') {
      const config = getSceneConfig('classroom');
      engineRef.current.updateInteractiveZones(config.interactiveZones);
    }
  }, [selectedGrade, completedStages, currentScene, getSceneConfig]);

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
              selectedGradeRef.current,
            );
          } else {
            renderCourtyardLayeredBackground(ctx, config.width, config.height);
          }
        },
        onRenderEntities: (ctx, player) => {
          if (currentScene === 'classroom') {
            renderClassroomEntities(
              ctx,
              player,
              config.width,
              config.height,
              completedStagesRef.current,
            );
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
              selectedGradeRef.current,
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

  // Sınıf seviyesi veya tamamlanan aşamalar değiştiğinde sınıf etkileşim bölgelerini güncelle
  useEffect(() => {
    if (engineRef.current && currentScene === 'classroom') {
      const config = getSceneConfig('classroom');
      engineRef.current.updateInteractiveZones(config.interactiveZones);
    }
  }, [currentScene, getSceneConfig, selectedGrade, completedStages]);

  // Modallar açıldığında motoru duraklat
  useEffect(() => {
    if (!engineRef.current) return;
    if (isSmartBoardModalOpen || isGradeModalOpen || isTableModalOpen) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [isSmartBoardModalOpen, isGradeModalOpen, isTableModalOpen]);

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

      {/* Sınıf Seçim Panosu Modal Penceresi */}
      <GradeBoardModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        selectedGrade={selectedGrade}
        onSelectGrade={(grade) => {
          campus?.setGrade(grade);
        }}
      />

      {/* Dört Öğrenme Masası İstasyon Modalı */}
      {activeTableStage && (
        <TableStationModal
          isOpen={isTableModalOpen}
          stage={activeTableStage}
          missionId="kapilarin-anlattigi-hikaye"
          onClose={() => setIsTableModalOpen(false)}
          onAdvanceToStage={(nextStage) => {
            setActiveTableStage(nextStage);
          }}
        />
      )}
    </div>
  );
}
