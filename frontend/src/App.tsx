// src/App.tsx
import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { PriorityList } from "./components/PriorityList";
import { CCTVMultiView } from "./components/CCTVMultiView";
import { DetailPanel } from "./components/DetailPanel";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

import type { Survivor } from "./lib/api";
import { fetchSurvivors, updateRescueStatus, deleteSurvivor } from "./lib/api";
import { getStompClient } from "./lib/socket";
import type { IMessage, StompSubscription } from "@stomp/stompjs";

export default function App() {
  const [survivors, setSurvivors] = useState<Survivor[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // STOMP client & subscription map
  const clientRef = useRef(getStompClient());
  const subsRef = useRef<Record<string, StompSubscription>>({});
  const connectedRef = useRef(false);

  /** ---------- helpers ---------- */
  const sortAndRank = (arr: Survivor[]) => {
    const sorted = [...arr].sort((a, b) => b.riskScore - a.riskScore);
    return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
  };

  const parseScore = (raw: string): number | null => {
    // 숫자 문자열 ("20.5")
    const quick = Number(raw);
    if (Number.isFinite(quick)) return quick;

    // JSON
    try {
      const j = JSON.parse(raw);
      if (typeof j === "number") return j;
      if (typeof j?.finalRiskScore === "number") return j.finalRiskScore;
      if (typeof j?.score === "number") return j.score;
    } catch {
      /* noop */
    }

    // "Score: 20.5%" 등
    const m = raw.match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };

  /** ---------- STOMP 연결 ---------- */
  useEffect(() => {
    const client = clientRef.current;

    client.onConnect = () => {
      connectedRef.current = true;
      console.log("✅ STOMP connected");
      // 연결되면 현재 보유 중인 모든 생존자에 대해 구독 보장
      resubscribeAll();
    };

    client.onStompError = (frame) => {
      console.error("STOMP ERROR:", frame.headers["message"], frame.body);
    };

    client.onWebSocketClose = (evt) => {
      console.warn("🔌 WS closed", evt.code, evt.reason);
      connectedRef.current = false;
    };

    client.activate();

    return () => {
      // 모든 구독 해제 후 종료
      Object.values(subsRef.current).forEach((sub) => sub?.unsubscribe?.());
      subsRef.current = {};
      connectedRef.current = false;
      client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- 생존자 목록 로드 (초기 + 5초 폴링) ---------- */
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await fetchSurvivors();

        setSurvivors((prev) => {
          // 이전 riskScore 유지
          const merged = data.map((n) => {
            const old = prev.find((p) => p.id === n.id);
            return old ? { ...n, riskScore: old.riskScore } : n;
          });
          return sortAndRank(merged);
        });

        // 최초 한 번만 선택 설정 (이미 선택되어 있으면 유지)
        if (alive && !selectedId && data.length > 0) {
          setSelectedId((cur) => cur ?? data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();
    const t = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---------- 생존자 ID 세트가 바뀌면 전부 구독 재조정 ---------- */
  useEffect(() => {
    resubscribeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survivors.map((s) => s.id).join("|"), connectedRef.current]);

  /** 모든 생존자 토픽 재구독 */
  function resubscribeAll() {
    const client = clientRef.current;
    if (!connectedRef.current || !client.connected) return;

    const currentIds = new Set(survivors.map((s) => s.id));

    // 1) 필요 없는 구독 해제
    for (const id of Object.keys(subsRef.current)) {
      if (!currentIds.has(id)) {
        subsRef.current[id]?.unsubscribe?.();
        delete subsRef.current[id];
      }
    }

    // 2) 신규 구독 생성
    for (const s of survivors) {
      if (subsRef.current[s.id]) continue; // 이미 구독 중
      const topic = `/topic/survivor/${s.id}/scores`;
      console.log("📡 WebSocket Subscribe:", topic);

      const sub = client.subscribe(topic, (msg: IMessage) => {
        const score = parseScore(String(msg.body));
        if (score == null || !Number.isFinite(score)) return;

        setSurvivors((prev) => {
          const updated = prev.map((x) =>
            String(x.id) === String(s.id) ? { ...x, riskScore: score } : x
          );
          return sortAndRank(updated);
        });
      });

      subsRef.current[s.id] = sub;
    }
  }

  /** ---------- 액션 ---------- */
  const handleDispatchRescue = async (id: string) => {
    try {
      await updateRescueStatus(id, "IN_RESCUE");
      setSurvivors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, rescueStatus: "dispatched" } : s))
      );
      toast.success("🚑 구조팀 출동!");
    } catch {
      toast.error("구조팀 파견 실패");
    }
  };

  const handleReportFalsePositive = async (id: string) => {
    try {
      await deleteSurvivor(id);
      setSurvivors((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.info("오탐 처리 완료");
    } catch {
      toast.error("오탐 처리 실패");
    }
  };

  /** ---------- 파생 상태 ---------- */
  const selectedSurvivor = survivors.find((s) => s.id === selectedId) || null;
  const pendingCount = survivors.filter((s) => s.rescueStatus === "pending").length;
  const alertLevel = pendingCount >= 5 ? "high" : pendingCount >= 3 ? "medium" : "low";

  /** ---------- 렌더 ---------- */
  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      <Header currentTime="15:29:14" alertLevel={alertLevel} totalSurvivors={survivors.length} />
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-3 h-full overflow-y-auto">
          <PriorityList
            survivors={survivors}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div className="col-span-6 h-full overflow-y-auto">
          <CCTVMultiView
            survivors={survivors}
            selectedId={selectedId}
            onSelectSurvivor={setSelectedId}
          />
        </div>
        <div className="col-span-3">
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