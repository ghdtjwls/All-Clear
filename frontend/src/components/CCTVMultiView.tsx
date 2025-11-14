import { Camera, AlertTriangle, MapPin, Activity } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import type { Survivor } from "../lib/api";

interface CCTVMultiViewProps {
  survivors: Survivor[];
  selectedId: string | null;
  onSelectSurvivor: (id: string) => void;
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

export function CCTVMultiView({ 
  survivors, 
  selectedId, 
  onSelectSurvivor 
}: CCTVMultiViewProps) {
  // 우선순위 상위 6명의 생존자만 표시
  const topSurvivors = survivors.slice(0, 6);

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-500" />
              실시간 CCTV 멀티뷰
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              우선순위 상위 구역 자동 표시 · {topSurvivors.length}개 영상
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-600 text-white border-red-600">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
              LIVE
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {topSurvivors.map((survivor) => {
              const riskLevel = survivor.riskScore >= 18 ? 'high' : 
                               survivor.riskScore >= 12 ? 'medium' : 'low';
              const riskColor = riskLevel === 'high' ? 'border-red-500 bg-red-950/20' : 
                               riskLevel === 'medium' ? 'border-orange-500 bg-orange-950/20' : 
                               'border-green-500 bg-green-950/20';
              const riskTextColor = riskLevel === 'high' ? 'text-red-500' : 
                                   riskLevel === 'medium' ? 'text-orange-500' : 
                                   'text-green-500';
              const isSelected = selectedId === survivor.id;

              return (
                <button
                  key={survivor.id}
                  onClick={() => onSelectSurvivor(survivor.id)}
                  className={`
                    relative rounded-lg border-2 overflow-hidden
                    ${riskColor}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900' : 'hover:bg-slate-800/50'}
                    transition-all cursor-pointer text-left
                  `}
                >
                  {/* 상단 정보 바 */}
                  <div className="bg-slate-950/80 p-2 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-white">{survivor.rank}.</span>
                          <AlertTriangle className={`w-4 h-4 ${riskTextColor}`} />
                          <span className={`${riskTextColor}`}>
                            {survivor.riskScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          survivor.rescueStatus === 'rescued' ? 'text-green-400 border-green-400' :
                          survivor.rescueStatus === 'dispatched' ? 'text-white border-blue-600 bg-blue-600'  :
                          'text-slate-300 border-slate-500'
                        }`}
                      >
                        {survivor.rescueStatus === 'rescued' ? '구조완료' :
                         survivor.rescueStatus === 'dispatched' ? '출동중' : '대기'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300 text-sm">
                        {survivor.location} {survivor.floor}층 {survivor.room}
                      </span>
                    </div>
                  </div>

                  {/* CCTV 영상 영역 */}
                  <div className="aspect-video bg-slate-800 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-800" />
                    
                    {/* CCTV 컨텐츠 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                        <p className="text-slate-500 text-xs">Camera {survivor.rank}</p>
                      </div>
                    </div>

                    {/* 타임스탬프 */}
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">
                      15:29:14
                    </div>

                    {/* REC 표시 */}
                    <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      REC
                    </div>

                    {/* 위험 경고 (고위험인 경우) */}
                    {riskLevel === 'high' && (
                      <div className="absolute bottom-2 left-2 bg-red-600/90 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        긴급
                      </div>
                    )}
                  </div>

                  {/* 하단 상태 바 */}
                  <div className="bg-slate-950/80 p-2 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{statusIcons[survivor.status]}</span>
                        <span className="text-slate-300 text-sm">{statusText[survivor.status]}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 text-xs uppercase">
                          {survivor.detectionMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 선택 표시 */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none border-4 border-blue-500 rounded-lg"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 추가 생존자가 있는 경우 안내 */}
          {survivors.length > 6 && (
            <div className="mt-4 bg-slate-800 border border-slate-700 rounded-lg p-3 text-center">
              <Activity className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-slate-400 text-sm">
                추가 {survivors.length - 6}명의 생존자가 감지되었습니다
              </p>
              <p className="text-slate-500 text-xs mt-1">
                우선순위 리스트에서 확인하세요
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
