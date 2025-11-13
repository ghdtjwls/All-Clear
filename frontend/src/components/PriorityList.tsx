// src/components/PriorityList.tsx
import { Camera, Wifi, AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

// ✅ 프론트에서 사용하는 Survivor 타입을 lib/api.ts 에서 가져오기
import type { Survivor } from '../lib/api';

interface PriorityListProps {
  survivors: Survivor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusIcons = {
  unconscious: '🛌',
  injured: '🤕',
  trapped: '🚪',
  conscious: '👤'
};

const statusText = {
  unconscious: '쓰러져 있음',
  injured: '부상',
  trapped: '갇힘',
  conscious: '의식 있음'
};

const statusColors = {
  pending: 'text-slate-400',
  dispatched: 'text-red-500',
  rescued: 'text-green-400'
};

const statusBadges = {
  pending: '대기',
  dispatched: '출동 중',
  rescued: '구조 완료'
};

export function PriorityList({ survivors, selectedId, onSelect }: PriorityListProps) {
  return (
    <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          우선순위 구조 리스트
        </h2>
        <p className="text-slate-400 text-sm mt-1">위험도 기준 정렬</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {survivors.map((survivor) => {
            const isSelected = selectedId === survivor.id;
            const riskLevel =
              survivor.riskScore >= 18 ? 'high' :
              survivor.riskScore >= 12 ? 'medium' :
              'low';

            const riskColor =
              riskLevel === 'high'
                ? 'border-red-500 bg-red-950/30'
                : riskLevel === 'medium'
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-green-500 bg-green-950/30';

            return (
              <button
                key={survivor.id}
                onClick={() => onSelect(survivor.id)}
                className={`w-full p-3 rounded-lg border-l-4 ${riskColor}
                  ${isSelected ? 'bg-slate-800 ring-2 ring-blue-500' : 'bg-slate-800/50 hover:bg-slate-800'}
                  transition-all text-left`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{survivor.rank}.</span>
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        riskLevel === 'high'
                          ? 'text-red-500'
                          : riskLevel === 'medium'
                          ? 'text-orange-500'
                          : 'text-green-500'
                      }`}
                    />
                    <span className="text-white">{survivor.riskScore.toFixed(1)}점</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1">
                  <div className="text-slate-300 text-sm">
                    📍 {survivor.location} {survivor.floor}층 {survivor.room}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>{statusIcons[survivor.status]}</span>
                    <span className="text-slate-400 text-sm">{statusText[survivor.status]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {survivor.detectionMethod === 'cctv' ? (
                        <Camera className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Wifi className="w-3 h-3 text-slate-400" />
                      )}
                      <span className="text-slate-500 text-xs uppercase">
                        {survivor.detectionMethod}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[survivor.rescueStatus]} border-current`}
                    >
                      {statusBadges[survivor.rescueStatus]}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}