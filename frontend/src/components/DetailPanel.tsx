// src/components/DetailPanel.tsx
import { Camera, Send, XCircle, Activity, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useEffect, useState } from "react";

import type { Survivor } from "../lib/api";
import { fetchAiAnalysis, type AiAnalysis } from "../lib/api";

interface DetailPanelProps {
  survivor: Survivor | null;
  onDispatchRescue: (id: string) => void;
  onReportFalsePositive: (id: string) => void;
}

export function DetailPanel({ survivor, onDispatchRescue, onReportFalsePositive }: DetailPanelProps) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);

  // ✅ WebSocket으로 최종 위험도(riskScore)가 바뀌면 AI 분석값도 다시 불러오기
  useEffect(() => {
    if (!survivor) return;
    fetchAiAnalysis(survivor.id)
      .then(setAnalysis)
      .catch(() => setAnalysis(null));
  }, [survivor?.id, survivor?.riskScore]); // ✅ 이 부분이 핵심

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

  const isDispatched = survivor.rescueStatus === 'dispatched';
  const isRescued = survivor.rescueStatus === 'rescued';

  // ✅ AI 최종 위험도가 있으면 그걸 우선 사용, 없으면 WebSocket 점수 사용
  // const finalRisk = analysis?.finalRiskScore ?? survivor.riskScore;
  const finalRisk = survivor.riskScore;

  const riskColor =
    finalRisk >= 18 ? 'text-red-500' :
    finalRisk >= 12 ? 'text-orange-500' :
    'text-green-500';

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          상세 정보
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          생존자 #{analysis?.survivorNumber ?? survivor.id}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4 space-y-4">

        {/* CCTV */}
        <div>
          <label className="text-slate-300 flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4" />
            실시간 CCTV
          </label>

          <div className="aspect-video bg-slate-800 border border-slate-700 rounded-lg text-slate-500 flex flex-col items-center justify-center">
            <Camera className="w-10 h-10 mb-2" />
            <p>{survivor.location} - {survivor.room}</p>
            <p className="text-xs opacity-50">Camera Feed Placeholder</p>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* AI 분석 */}
        <div>
          <h3 className="text-slate-300 mb-2">🤖 AI 분석 리포트</h3>

          <div className="bg-slate-800 rounded-lg p-3 space-y-3 text-sm">
            
            <div>
              <div className="text-slate-400 text-sm mb-1">상황 해석</div>
              <p className="text-slate-300">
                {analysis?.aiAnalysisResult ?? "AI 분석 데이터를 불러오는 중..."}
              </p>
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex justify-between">
              <span className="text-slate-400">상태 점수</span>
              <span className="text-white">{analysis?.statusScore?.toFixed(1) ?? "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">환경 점수</span>
              <span className="text-white">{analysis?.environmentScore?.toFixed(1) ?? "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">신뢰도 계수</span>
              <span className="text-white">{analysis?.confidenceCoefficient?.toFixed(2) ?? "-"}</span>
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex justify-between font-medium">
              <span className="text-slate-300">최종 위험도</span>
              <span className={riskColor}>{finalRisk.toFixed(1)} 점</span>
            </div>

          </div>
        </div>

      </ScrollArea>

      {/* Buttons */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <Button
          onClick={() => onDispatchRescue(survivor.id)}
          disabled={isDispatched || isRescued}
          className={
            `w-full font-semibold ` +
            (
              isRescued
                ? `bg-slate-600 text-white cursor-not-allowed`
                : isDispatched
                ? `bg-blue-600 text-white border border-blue-400 cursor-default` // 🔵 출동중: 흰 글씨 고정
                : `bg-blue-500 hover:bg-blue-600 text-white`
            )
          }
        >
          <Send className="w-4 h-4 mr-2" />
          {isRescued ? "구조 완료됨" : isDispatched ? "출동 중..." : "구조팀 파견"}
        </Button>

        <Button
          variant="outline"
          className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition"
          onClick={() => onReportFalsePositive(survivor.id)}
          disabled={isRescued}
        >
          <XCircle className="w-4 h-4 mr-2" />
          오탐(False Positive) 보고
        </Button>
      </div>
    </div>
  );
}