// 求籤流程 Hook - 管理完整求籤狀態機
import { useState, useCallback, useRef } from 'react';
import type { Poem } from '@/data/poems/leiyushi';
import { DRAW_ANIMATION_DEFAULT_MS, normalizeDrawAnimationDuration } from '@/constants/divination';
import {
  normalizeDrawAnimationMode,
  normalizeDrawAnimationStyleKey,
  pickRandomDrawAnimationStyleKey,
  type DrawAnimationStyleKey,
} from '@/constants/draw-animation-styles';
import { gods } from '@/data/gods';
import { tossJiaobei, drawPoem, drawZhugePoem, saveDivinationRecord } from '@/services/divination';
import { addFavorite, getHistory, getSettings, removeFavorite, isFavorite, saveLastPoemContext } from '@/services/storage';
import { getAIInterpretation } from '@/services/ai';
import { buildActionPlan } from '@/services/actionPlan';
import { requestReview, shouldRequestReview } from '@/services/reviewService';
import type { JiaobeiResult } from '@/services/divination';
import type { DivinationRecord } from '@/services/storage';

export type FlowStep =
  | 'select-god'
  | 'set-question'
  | 'meditate'
  | 'enter-zhuge-number'
  | 'choose-draw-method'
  | 'toss-jiaobei'
  | 'drawing'
  | 'reveal-poem'
  | 'ai-interpret'
  | 'result';

// drawing 步驟底下的子階段：shaking = 等待使用者親自搖籤筒（尚未決定籤詩），
// revealing = 籤枝已跳出，播放既有的開籤演出
export type DrawPhase = 'shaking' | 'revealing';
export type DrawMethod = 'jiaobei-shake' | 'jiaobei-auto' | 'direct' | 'number';

export function useDivination() {
  const [step, setStep] = useState<FlowStep>('select-god');
  const [selectedGodId, setSelectedGodId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [questionCategory, setQuestionCategory] = useState('general');
  const [userName, setUserName] = useState('');
  const [jiaobeiResults, setJiaobeiResults] = useState<JiaobeiResult[]>([]);
  const [zhugeNumber, setZhugeNumber] = useState<number | null>(null);
  const [drawnPoem, setDrawnPoem] = useState<Poem | null>(null);
  const [pendingPoem, setPendingPoem] = useState<Poem | null>(null);
  const [aiInterpretation, setAIInterpretation] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<DivinationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [drawAnimationDurationMs, setDrawAnimationDurationMs] = useState(DRAW_ANIMATION_DEFAULT_MS);
  const [drawAnimationStyleKey, setDrawAnimationStyleKey] =
    useState<DrawAnimationStyleKey>('bronze');
  const animationResolverRef = useRef<(() => void) | null>(null);
  const shakeCompletedRef = useRef(false);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>('revealing');
  const [drawMethod, setDrawMethod] = useState<DrawMethod>('jiaobei-shake');

  const selectedGod = selectedGodId ? gods.find(g => g.id === selectedGodId) : null;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const goToStep = useCallback((s: FlowStep) => setStep(s), []);

  const selectGod = useCallback((godId: number) => {
    setSelectedGodId(godId);
    setStep('set-question');
  }, []);

  const startMeditation = useCallback((q: string, category: string, name: string) => {
    setQuestion(q);
    setQuestionCategory(category);
    setUserName(name);
    setStep('meditate');
  }, []);

  const finishMeditation = useCallback(() => {
    const god = selectedGodId ? gods.find(g => g.id === selectedGodId) : null;
    if (god?.poemSystem === '諸葛神數') {
      setDrawMethod('number');
      setStep('enter-zhuge-number');
    } else {
      setStep('choose-draw-method');
    }
  }, [selectedGodId]);

  const performJiaobei = useCallback((): JiaobeiResult => {
    const result = tossJiaobei();
    setJiaobeiResults(prev => [...prev, result]);
    return result;
  }, []);

  const finishDrawAnimation = useCallback(() => {
    animationResolverRef.current?.();
  }, []);

  const submitZhugeNumber = useCallback((n: number) => {
    setZhugeNumber(n);
    setStep('drawing');
  }, []);

  // revealDraw 負責「籤詩已經決定之後」的整段流程：開籤動畫、AI 解籤、存檔。
  // seed 若有值（來自搖籤筒的操作遙測），一般求籤會用它決定抽到哪一支籤；
  // 諸葛神數的情況則直接依 inputZhugeNumber 對應固定的卦象，不受 seed 影響。
  const revealDraw = useCallback(async (inputZhugeNumber?: number, seed?: number) => {
    if (!selectedGodId) return;
    const god = gods.find(g => g.id === selectedGodId);
    const num = inputZhugeNumber ?? zhugeNumber;
    const poem = (god?.poemSystem === '諸葛神數' && num != null)
      ? drawZhugePoem(num)
      : drawPoem(selectedGodId, seed);
    const settings = await getSettings();
    const animationDuration = normalizeDrawAnimationDuration(settings?.drawAnimationDurationMs);
    const animationMode = normalizeDrawAnimationMode(settings?.drawAnimationMode);
    const animationStyle =
      animationMode === 'fixed'
        ? normalizeDrawAnimationStyleKey(settings?.drawAnimationStyleKey)
        : pickRandomDrawAnimationStyleKey(Date.now() + poem.number + selectedGodId);

    setPendingPoem(poem);
    setDrawAnimationDurationMs(animationDuration);
    setDrawAnimationStyleKey(animationStyle);
    setIsLoading(true);

    await new Promise<void>((resolve) => {
      let fallback: ReturnType<typeof setTimeout>;
      animationResolverRef.current = () => { clearTimeout(fallback); resolve(); };
      fallback = setTimeout(() => animationResolverRef.current?.(), animationDuration + 1200);
    });
    animationResolverRef.current = null;

    setDrawnPoem(poem);
    setPendingPoem(null);
    setStep('reveal-poem');

    // 開始 AI 解籤
    setStep('ai-interpret');
    let interpretation: string | null = null;
    try {
    const recentHistory = (await getHistory())
      .filter((record) => record.questionCategory === questionCategory)
      .slice(0, 3)
      .map((record) => `${record.godName}第${record.poem.number}籤/${record.poem.level}/${record.verificationStatus ?? '待驗證'}`)
      .join('；');
      interpretation = await getAIInterpretation({
        godName: god?.name || '神明',
        userName: userName || '善信',
        question,
        questionCategory,
        poemNumber: poem.number,
        poemContent: poem.content,
        poemMeaning: poem.vernacular,
        poemStory: poem.story,
        poemLevel: poem.level,
        recentHistorySummary: recentHistory || undefined,
      });
      setAIInterpretation(interpretation);
    } catch {
      setAIInterpretation(null);
    }

    // 儲存最後籤詩供對話頁使用
    await saveLastPoemContext({
      godName: god?.name || '神明',
      poemContent: poem.content,
      poemTitle: poem.title || '',
      poemLevel: poem.level,
      aiInterpretation: interpretation || undefined,
      question,
      timestamp: Date.now(),
    });

    // 儲存紀錄
    const actionPlan = buildActionPlan({
      poem,
      questionCategory,
      question,
    });

    const record = await saveDivinationRecord({
      godName: god?.name || '神明',
      poem,
      question,
      questionCategory,
      aiInterpretation: interpretation || undefined,
      actionPlan,
    });
    setCurrentRecord(record);

    // 檢查是否已收藏
    const fav = await isFavorite(poem.number, god?.name);
    setIsFavorited(fav);

    setIsLoading(false);
    setStep('result');

    if (await shouldRequestReview(poem.level)) {
      requestReview();
    }
  }, [selectedGodId, question, questionCategory, userName, zhugeNumber]);

  // 開始抽籤：諸葛神數已經有使用者輸入的數字，卦象是固定的，不需要搖籤筒，
  // 直接進入開籤演出；一般籤詩則先進入 shaking 子階段，等使用者親自搖出籤枝
  // 之後（見 completeShake）才真正決定抽到哪一支。
  const performDraw = useCallback((inputZhugeNumber?: number) => {
    if (!selectedGodId) return;
    shakeCompletedRef.current = false;
    const god = gods.find(g => g.id === selectedGodId);
    setStep('drawing');
    if (god?.poemSystem === '諸葛神數' && inputZhugeNumber != null) {
      setDrawPhase('revealing');
      void revealDraw(inputZhugeNumber);
      return;
    }
    setDrawPhase('shaking');
  }, [selectedGodId, revealDraw]);

  const performAutoDraw = useCallback((seed?: number) => {
    if (!selectedGodId) return;
    setStep('drawing');
    setDrawPhase('revealing');
    void revealDraw(undefined, seed ?? (Date.now() + selectedGodId));
  }, [selectedGodId, revealDraw]);

  const performNumberDraw = useCallback((n: number) => {
    if (!selectedGodId) return;
    const god = gods.find(g => g.id === selectedGodId);
    setZhugeNumber(n);
    setStep('drawing');
    setDrawPhase('revealing');
    if (god?.poemSystem === '諸葛神數') {
      void revealDraw(n);
      return;
    }
    const seed = (Math.imul(n >>> 0, 2654435761) ^ Math.imul(selectedGodId, 1597334677) ^ Date.now()) >>> 0;
    void revealDraw(undefined, seed);
  }, [selectedGodId, revealDraw]);

  const chooseDrawMethod = useCallback((method: DrawMethod) => {
    setDrawMethod(method);
    if (method === 'jiaobei-shake' || method === 'jiaobei-auto') {
      setJiaobeiResults([]);
      setStep('toss-jiaobei');
      return;
    }
    if (method === 'number') {
      setStep('enter-zhuge-number');
      return;
    }
    performAutoDraw();
  }, [performAutoDraw]);

  // 搖籤筒的互動階段結束時呼叫：seed 來自使用者操作遙測的雜湊，
  // 用來決定實際抽到哪一支籤。
  const completeShake = useCallback((seed: number) => {
        if (shakeCompletedRef.current) return;
    shakeCompletedRef.current = true;
setDrawPhase('revealing');
    void revealDraw(undefined, seed);
  }, [revealDraw]);

  // 收藏/取消收藏
  const toggleFavorite = useCallback(async () => {
    if (!currentRecord) return;
    if (isFavorited) {
      await removeFavorite(currentRecord.id);
      setIsFavorited(false);
      showToast('已取消收藏');
    } else {
      await addFavorite(currentRecord);
      setIsFavorited(true);
      showToast('已加入籤詩閣');
    }
  }, [currentRecord, isFavorited, showToast]);

  const reset = useCallback(() => {
    animationResolverRef.current?.();
    animationResolverRef.current = null;
    shakeCompletedRef.current = false;
    setStep('select-god');
    setSelectedGodId(null);
    setQuestion('');
    setQuestionCategory('general');
    setUserName('');
    setJiaobeiResults([]);
    setZhugeNumber(null);
    setDrawnPoem(null);
    setPendingPoem(null);
    setAIInterpretation(null);
    setCurrentRecord(null);
    setIsFavorited(false);
    setIsLoading(false);
    setDrawPhase('revealing');
    setDrawMethod('jiaobei-shake');
  }, []);

  return {
    step,
    selectedGodId,
    selectedGod,
    question,
    questionCategory,
    userName,
    jiaobeiResults,
    drawnPoem,
    pendingPoem,
    aiInterpretation,
    currentRecord,
    isLoading,
    isFavorited,
    toastMessage,
    drawAnimationDurationMs,
    drawAnimationStyleKey,
    drawPhase,
    drawMethod,
    // actions
    goToStep,
    selectGod,
    startMeditation,
    finishMeditation,
    performJiaobei,
    submitZhugeNumber,
    performDraw,
    performAutoDraw,
    performNumberDraw,
    chooseDrawMethod,
    completeShake,
    finishDrawAnimation,
    toggleFavorite,
    reset,
    setUserName,
    setQuestion,
    setQuestionCategory,
    showToast,
  };
}


