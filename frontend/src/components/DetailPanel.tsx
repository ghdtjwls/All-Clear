import { Camera, Send, XCircle, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import type { Survivor } from './PriorityList';

interface DetailPanelProps {
  survivor: Survivor | null;
  onDispatchRescue: (id: string) => void;
  onReportFalsePositive: (id: string) => void;
}

const statusText = {
  unconscious: '쓰러져 있음',
  injured: '부상 상태',
  trapped: '갇힌 상태',
  conscious: '의식 있음'
};

const statusDescriptions = {
  unconscious: '연기가 자욱한 방 중앙에 사람이 쓰러져 있음. 움직임 없음.',
  injured: '부상으로 이동이 어려운 상태. 도움 필요.',
  trapped: '문이 막혀 탈출 불가능. 즉각적인 구조 필요.',
  conscious: '의식은 있으나 연기로 인해 위험. 신속한 대피 필요.'
};

export function DetailPanel({ survivor, onDispatchRescue, onReportFalsePositive }: DetailPanelProps) {
  if (!survivor) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>생존자를 선택하세요</p>
          <p className="text-sm mt-1">상세 정보를 확인할 수 있습니다</p>
        </div>
      </div>
    );
  }

  const riskLevel = survivor.riskScore >= 18 ? 'high' : survivor.riskScore >= 12 ? 'medium' : 'low';
  const riskColor = riskLevel === 'high' ? 'text-red-500' : 
                   riskLevel === 'medium' ? 'text-orange-500' : 
                   'text-green-500';

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          상세 정보
        </h2>
        <p className="text-slate-400 text-sm mt-1">생존자 #{survivor.rank}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* CCTV 영상 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                실시간 CCTV
              </label>
              <Badge variant="outline" className="bg-red-600 text-white border-red-600">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                REC
              </Badge>
            </div>
            <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">{survivor.location} - {survivor.room}</p>
                  <p className="text-slate-600 text-xs mt-1">Camera Feed</p>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                15:29:14
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* AI 분석 리포트 */}
          <div>
            <h3 className="text-slate-300 mb-3">🤖 AI 분석 리포트</h3>
            <div className="bg-slate-800 rounded-lg p-3 space-y-3">
              <div>
                <div className="text-slate-400 text-sm mb-1">VLM 분석 결과</div>
                <p className="text-slate-300 text-sm">
                  {statusDescriptions[survivor.status]}
                </p>
              </div>

              <div>
                <div className="text-slate-400 text-sm mb-2">위험도 점수 분석</div>
                <div className="bg-slate-900 rounded p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">상태 점수</span>
                    <span className="text-white">
                      {survivor.status === 'unconscious' ? '10.0' : 
                       survivor.status === 'injured' ? '8.0' : 
                       survivor.status === 'trapped' ? '9.0' : '5.0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">환경 점수</span>
                    <span className="text-white">
                      {survivor.floor === 2 || survivor.floor === 3 ? '7.0' : '4.0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">신뢰도 계수</span>
                    <span className="text-white">
                      {survivor.detectionMethod === 'cctv' ? '1.2' : '1.0'}
                    </span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between">
                    <span className="text-slate-300">최종 위험도</span>
                    <span className={`${riskColor}`}>
                      {survivor.riskScore.toFixed(1)}점
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* 위치 및 상태 정보 */}
          <div>
            <h3 className="text-slate-300 mb-3">📍 위치 및 상태</h3>
            <div className="bg-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">위치</span>
                <span className="text-white">{survivor.location} {survivor.floor}층 {survivor.room}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">현재 상태</span>
                <span className="text-white">{statusText[survivor.status]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">탐지 수단</span>
                <span className="text-white uppercase">{survivor.detectionMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">구조 상태</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    survivor.rescueStatus === 'rescued' ? 'text-green-400 border-green-400' :
                    survivor.rescueStatus === 'dispatched' ? 'text-blue-400 border-blue-400' :
                    'text-slate-400 border-slate-400'
                  }`}
                >
                  {survivor.rescueStatus === 'rescued' ? '구조 완료' :
                   survivor.rescueStatus === 'dispatched' ? '출동 중' : '대기'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 액션 버튼 */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onDispatchRescue(survivor.id)}
          disabled={survivor.rescueStatus !== 'pending'}
        >
          <Send className="w-4 h-4 mr-2" />
          구조팀 파견
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
          onClick={() => onReportFalsePositive(survivor.id)}
        >
          <XCircle className="w-4 h-4 mr-2" />
          오탐(False Positive) 보고
        </Button>
      </div>
    </div>
  );
}
