import { useState} from 'react';
import { Header } from './components/Header';
import { PriorityList, type Survivor } from './components/PriorityList';
import { CCTVMultiView } from './components/CCTVMultiView';
import { DetailPanel } from './components/DetailPanel';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Mock 데이터
const initialSurvivors: Survivor[] = [
  {
    id: '1',
    rank: 1,
    riskScore: 20.4,
    location: '정보관',
    floor: 2,
    room: '205호',
    status: 'unconscious',
    detectionMethod: 'cctv',
    rescueStatus: 'pending',
    x: 30,
    y: 40
  },
  {
    id: '2',
    rank: 2,
    riskScore: 16.8,
    location: '정보관',
    floor: 2,
    room: '210호',
    status: 'trapped',
    detectionMethod: 'cctv',
    rescueStatus: 'pending',
    x: 70,
    y: 60
  },
  {
    id: '3',
    rank: 3,
    riskScore: 12.5,
    location: '정보관',
    floor: 3,
    room: '315호',
    status: 'injured',
    detectionMethod: 'wifi',
    rescueStatus: 'dispatched',
    x: 50,
    y: 50
  },
  {
    id: '4',
    rank: 4,
    riskScore: 9.2,
    location: '정보관',
    floor: 3,
    room: '301호',
    status: 'conscious',
    detectionMethod: 'wifi',
    rescueStatus: 'pending',
    x: 35,
    y: 65
  }
];

export default function App() {
  const [survivors, setSurvivors] = useState<Survivor[]>(initialSurvivors);
  const [selectedId, setSelectedId] = useState<string | null>(survivors[0].id);

  const handleDispatchRescue = (id: string) => {
    setSurvivors(prev => prev.map(s => 
      s.id === id ? { ...s, rescueStatus: 'dispatched' as const } : s
    ));
    const survivor = survivors.find(s => s.id === id);
    toast.success(`구조팀이 파견되었습니다`, {
      description: `목표: ${survivor?.location} ${survivor?.floor}층 ${survivor?.room}`
    });
  };

  const handleReportFalsePositive = (id: string) => {
    const survivor = survivors.find(s => s.id === id);
    setSurvivors(prev => prev.filter(s => s.id !== id));
    setSelectedId(survivors[0]?.id || null);
    toast.info('오탐으로 보고되었습니다', {
      description: `${survivor?.location} ${survivor?.floor}층 ${survivor?.room} - 리스트에서 제거됨`
    });
  };

  const selectedSurvivor = survivors.find(s => s.id === selectedId) || null;
  const pendingCount = survivors.filter(s => s.rescueStatus === 'pending').length;
  const alertLevel = pendingCount >= 5 ? 'high' : pendingCount >= 3 ? 'medium' : 'low';

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      <Header 
        currentTime="15:29:14"
        alertLevel={alertLevel}
        totalSurvivors={survivors.length}
      />

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* 좌측: 우선순위 리스트 */}
        <div className="col-span-3 overflow-hidden">
          <PriorityList 
            survivors={survivors}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 중앙: CCTV 멀티뷰 */}
        <div className="col-span-6 overflow-hidden">
          <CCTVMultiView 
            survivors={survivors}
            selectedId={selectedId}
            onSelectSurvivor={setSelectedId}
          />
        </div>

        {/* 우측: 상세 정보 */}
        <div className="col-span-3 overflow-hidden">
          <DetailPanel 
            survivor={selectedSurvivor}
            onDispatchRescue={handleDispatchRescue}
            onReportFalsePositive={handleReportFalsePositive}
          />
        </div>
      </div>

      <Toaster />
    </div>
  );
}
