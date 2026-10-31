// 求籤流程 Hook - 管理完整求籤狀態機
import { useState, useCallback, useRef } from 'react';
import type { Poem } from '@/data/poems/leiyushi';
import { DRAW_ANIMATION_DEFAULT_MS, normalizeDrawAnimationDuration } from '@/constants/divination';
import { gods } from '@/data/gods';
import { getOracleCatalogByGodId } from '@/data/oracleCatalog';
import { getYuelaoEditionOfPoem } from '@/data/yuelaoEdition';
import { resolveOracleEdition } from '@/data/oracleEditionRegistry';
import { getSelectedOracleEditionId } from '@/services/oracleEditionPreferences';
import { resolveTianhouThreeCupNumber } from '@/services/threeCupOracle';
import { tossJiaobei, drawPoem, drawZhugePoem, saveDivinationRecord } from '@/services/divination';
import { addFavorite, findFavoriteRecord, getHistory, getSettings, removeFavorite, isFavorite, saveLastPoemContext } from '@/services/storage';
import { getAIInterpretation } from '@/services/ai';
import { buildRecentHistorySummary, type OracleAIContext } from '@/services/oracleAIContext';
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
  | 'drawing'
  | 'three-cup-draw'
  | 'verify-poem'
  | 'reveal-poem'
  | 'ai-interpret'
  | 'result';

// drawing 步驟底下的子階段：shaking = 等待使用者親自搖籤筒（尚未決定籤詩），
// revealing = 籤枝已跳出，播放既有的開籤演出
export type DrawPhase = 'shaking' | 'revealing';
export type DrawMethod = 'shake' | 'auto' | 'direct' | 'number';

export function useDivination() {
  const [step, setStep] = useState<FlowStep>('select-god');
  const [selectedGodId, setSelectedGodId] = useState<number | null>(null);
  const [activeEditionId, setActiveEditionId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [questionCategory, setQuestionCategory] = useState('general');
  const [userName, setUserName] = useState('');
  const [verificationResults, setVerificationResults] = useState<JiaobeiResult[]>([]);
  // Jiaobei completes after an animation delay. A ref prevents that delayed
  // callback from reading the previous render's verification results.
  const verificationResultsRef = useRef<JiaobeiResult[]>([]);
  const [zhugeNumber, setZhugeNumber] = useState<number | null>(null);
  const [drawnPoem, setDrawnPoem] = useState<Poem | null>(null);
  const [pendingPoem, setPendingPoem] = useState<Poem | null>(null);
  const [aiInterpretation, setAIInterpretation] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<DivinationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [drawAnimationDurationMs, setDrawAnimationDurationMs] = useState(DRAW_ANIMATION_DEFAULT_MS);
  const animationResolverRef = useRef<(() => void) | null>(null);
  const shakeCompletedRef = useRef(false);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>('revealing');
  const [drawMethod, setDrawMethod] = useState<DrawMethod>('shake');

  const selectedGod = selectedGodId ? gods.find(g => g.id === selectedGodId) : null;
  const selectedEdition = selectedGodId ? resolveOracleEdition(selectedGodId, activeEditionId) : null;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const goToStep = useCallback((s: FlowStep) => setStep(s), []);

  const selectGod = useCallback((godId: number) => {
    setSelectedGodId(godId);
    setActiveEditionId(getSelectedOracleEditionId(godId));
    verificationResultsRef.current = [];
    setVerificationResults([]);
    setStep('set-question');
  }, []);

  const startMeditation = useCallback((q: string, category: string, name: string) => {
    setQuestion(q);
    setQuestionCategory(category);
    setUserName(name);
    setStep('meditate');
  }, []);

  const performDraw = useCallback(() => {
    if (!selectedGodId) return;
    shakeCompletedRef.current = false;
    setDrawMethod('shake');
    setDrawPhase('shaking');
    setStep('drawing');
  }, [selectedGodId]);

  const finishMeditation = useCallback(() => {
    const god = selectedGodId ? gods.find(g => g.id === selectedGodId) : null;
    const edition = selectedGodId ? resolveOracleEdition(selectedGodId, activeEditionId) : null;
    if (god?.poemSystem === '諸葛神數') {
      setDrawMethod('number');
      setStep('enter-zhuge-number');
    } else if (edition?.drawMethod === 'three-cup-direct') {
      verificationResultsRef.current = [];
      setVerificationResults([]);
      setStep('three-cup-draw');
    } else {
      performDraw();
    }
  }, [activeEditionId, selectedGodId, performDraw]);

  const performVerificationJiaobei = useCallback((): JiaobeiResult => {
    const result = tossJiaobei();
    const nextResults = [...verificationResultsRef.current, result];
    verificationResultsRef.current = nextResults;
    setVerificationResults(nextResults);
    return result;
  }, []);

  const finishDrawAnimation = useCallback(() => {
    animationResolverRef.current?.();
  }, []);

  const submitZhugeNumber = useCallback((n: number) => {
    setZhugeNumber(n);
    setStep('drawing');
  }, []);

  const completeDivination = useCallback(async (poem: Poem, godName: string, confirmed: boolean, ritualPattern?: JiaobeiResult[], method?: DrawMethod) => {
    setStep('ai-interpret');
    // Capture the drawn edition before awaiting storage or the AI response.
    const edition = selectedGodId ? resolveOracleEdition(selectedGodId, activeEditionId) : null;
    const catalog = getOracleCatalogByGodId(selectedGodId, getYuelaoEditionOfPoem(poem));
    const oracleContext: OracleAIContext = {
      editionId: edition?.id,
      editionLabel: edition?.label ?? catalog.label,
      editionVersionTag: edition && edition.status !== 'legacy' ? edition.id : catalog.versionTag,
      editionTemple: edition?.temple,
      editionSource: edition && edition.status !== 'legacy'
        ? '依此廟本核定來源；AI 與白話解讀由 App 提供。'
        : catalog.sourceNote,
      editionSourceUrl: edition?.sourceUrl,
      drawMethod: edition?.drawMethod === 'three-cup-direct' ? 'three-cup-direct'
        : confirmed ? 'stick-confirmation' : method,
    };
    let interpretation: string | null = null;
    try {
      const recentHistory = buildRecentHistorySummary(await getHistory(), questionCategory);
      interpretation = await getAIInterpretation({
        ...oracleContext,
        godName,
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

    await saveLastPoemContext({
      ...oracleContext,
      godName,
      poemNumber: poem.number,
      poemContent: poem.content,
      poemTitle: poem.title || '',
      poemLevel: poem.level,
      aiInterpretation: interpretation || undefined,
      question,
      timestamp: Date.now(),
    });

    const record = await saveDivinationRecord({
      ...oracleContext,
      godName,
      poem,
      question,
      questionCategory,
      aiInterpretation: interpretation || undefined,
      actionPlan: buildActionPlan({ poem, questionCategory, question }),
      poemConfirmed: confirmed || undefined,
      poemConfirmResult: confirmed ? '連續三次聖筊確認' : undefined,
      ritualPattern,
    });
    setCurrentRecord(record);
    setIsFavorited(await isFavorite(poem.number, godName, activeEditionId ?? undefined, poem.content));
    setIsLoading(false);
    setStep('result');

    if (await shouldRequestReview(poem.level)) requestReview();
  }, [activeEditionId, question, questionCategory, selectedGodId, userName]);

  // revealDraw 負責「籤詩已經決定之後」的開籤動畫。完整儀式會先驗籤，再解籤與存檔。
  // seed 若有值（來自搖籤筒的操作遙測），一般求籤會用它決定抽到哪一支籤；
  // 諸葛神數的情況則直接依 inputZhugeNumber 對應固定的卦象，不受 seed 影響。
  const revealDraw = useCallback(async (
    inputZhugeNumber: number | undefined,
    seed: number | undefined,
    requiresVerification: boolean,
    fixedPoem?: Poem,
    ritualPattern?: JiaobeiResult[],
    method: DrawMethod = 'shake',
  ) => {
    if (!selectedGodId) return;
    const god = gods.find(g => g.id === selectedGodId);
    const num = inputZhugeNumber ?? zhugeNumber;
    const poem = fixedPoem ?? ((god?.poemSystem === '諸葛神數' && num != null)
      ? drawZhugePoem(num)
      : drawPoem(selectedGodId, seed, activeEditionId));
    const settings = await getSettings();
    const animationDuration = normalizeDrawAnimationDuration(settings?.drawAnimationDurationMs);

    setPendingPoem(poem);
    setDrawAnimationDurationMs(animationDuration);
    setIsLoading(true);

    await new Promise<void>((resolve) => {
      let fallback: ReturnType<typeof setTimeout>;
      animationResolverRef.current = () => { clearTimeout(fallback); resolve(); };
      fallback = setTimeout(() => animationResolverRef.current?.(), animationDuration * 1.4 + 500);
    });
    animationResolverRef.current = null;

    setDrawnPoem(poem);
    setPendingPoem(null);
    if (requiresVerification) {
      verificationResultsRef.current = [];
      setVerificationResults([]);
      setStep('verify-poem');
      return;
    }
    await completeDivination(poem, god?.name || '神明', false, ritualPattern, method);
  }, [activeEditionId, selectedGodId, zhugeNumber, completeDivination]);

  const completeThreeCupDraw = useCallback(() => {
    if (!selectedGodId || selectedEdition?.drawMethod !== 'three-cup-direct') return;
    const results = verificationResultsRef.current;
    const number = resolveTianhouThreeCupNumber(results);
    const poem = selectedEdition.poems?.find((item) => item.number === number);
    if (!number || !poem) {
      showToast('三筊對照資料尚未備妥，請重新請示。');
      verificationResultsRef.current = [];
      setVerificationResults([]);
      setStep('meditate');
      return;
    }
    setDrawPhase('revealing');
    setStep('drawing');
    void revealDraw(undefined, undefined, false, poem, [...results]);
  }, [revealDraw, selectedEdition, selectedGodId, showToast]);

  const completeVerification = useCallback(() => {
    const results = verificationResultsRef.current;
    if (!drawnPoem || results.length < 3 ||
        results.slice(-3).some((result) => result !== 'shengbei')) return;
    void completeDivination(drawnPoem, selectedGod?.name || '神明', true);
  }, [completeDivination, drawnPoem, selectedGod?.name]);

  const rejectVerification = useCallback(() => {
    if (!drawnPoem) return;
    setDrawnPoem(null);
    setPendingPoem(null);
    verificationResultsRef.current = [];
    setVerificationResults([]);
    setIsLoading(false);
    shakeCompletedRef.current = false;
    setDrawMethod('shake');
    setDrawPhase('shaking');
    setStep('drawing');
    showToast('此籤未獲確認，請重新搖籤。');
  }, [drawnPoem, showToast]);

  // 開始抽籤：諸葛神數已經有使用者輸入的數字，卦象是固定的，不需要搖籤筒，
  // 直接進入開籤演出；一般籤詩則先進入 shaking 子階段，等使用者親自搖出籤枝
  // 之後（見 completeShake）才真正決定抽到哪一支。
  const performAutoDraw = useCallback((seed?: number, requiresVerification = true) => {
    if (!selectedGodId) return;
    setStep('drawing');
    setDrawPhase('revealing');
    void revealDraw(undefined, seed ?? (Date.now() + selectedGodId), requiresVerification, undefined, undefined, requiresVerification ? 'auto' : 'direct');
  }, [selectedGodId, revealDraw]);

  const performNumberDraw = useCallback((n: number) => {
    if (!selectedGodId) return;
    const god = gods.find(g => g.id === selectedGodId);
    setZhugeNumber(n);
    setStep('drawing');
    setDrawPhase('revealing');
    if (god?.poemSystem === '諸葛神數') {
      void revealDraw(n, undefined, false, undefined, undefined, 'number');
      return;
    }
    const seed = (Math.imul(n >>> 0, 2654435761) ^ Math.imul(selectedGodId, 1597334677) ^ Date.now()) >>> 0;
    void revealDraw(undefined, seed, false, undefined, undefined, 'number');
  }, [selectedGodId, revealDraw]);

  const chooseDrawMethod = useCallback((method: DrawMethod) => {
    setDrawMethod(method);
    if (method === 'shake') {
      performDraw();
      return;
    }
    if (method === 'auto') {
      performAutoDraw();
      return;
    }
    if (method === 'number') {
      setStep('enter-zhuge-number');
      return;
    }
    performAutoDraw(undefined, false);
  }, [performAutoDraw, performDraw]);

  // 搖籤筒的互動階段結束時呼叫：seed 來自使用者操作遙測的雜湊，
  // 用來決定實際抽到哪一支籤。
  const completeShake = useCallback((seed: number) => {
    if (shakeCompletedRef.current) return;
    shakeCompletedRef.current = true;
    setDrawPhase('revealing');
    void revealDraw(undefined, seed, true);
  }, [revealDraw]);

  // 收藏/取消收藏
  const toggleFavorite = useCallback(async () => {
    if (!currentRecord) return;
    if (isFavorited) {
      const favorite = await findFavoriteRecord(
        currentRecord.poem.number,
        currentRecord.godName,
        currentRecord.editionId,
        currentRecord.poem.content,
      );
      if (favorite) await removeFavorite(favorite.id);
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
    setActiveEditionId(null);
    setQuestion('');
    setQuestionCategory('general');
    setUserName('');
    verificationResultsRef.current = [];
    setVerificationResults([]);
    setZhugeNumber(null);
    setDrawnPoem(null);
    setPendingPoem(null);
    setAIInterpretation(null);
    setCurrentRecord(null);
    setIsFavorited(false);
    setIsLoading(false);
    setDrawPhase('revealing');
    setDrawMethod('shake');
  }, []);

  return {
    step,
    selectedGodId,
    selectedGod,
    question,
    questionCategory,
    userName,
    verificationResults,
    selectedEdition,
    drawnPoem,
    pendingPoem,
    aiInterpretation,
    currentRecord,
    isLoading,
    isFavorited,
    toastMessage,
    drawAnimationDurationMs,
    drawPhase,
    drawMethod,
    // actions
    goToStep,
    selectGod,
    startMeditation,
    finishMeditation,
    performVerificationJiaobei,
    submitZhugeNumber,
    performDraw,
    performAutoDraw,
    performNumberDraw,
    chooseDrawMethod,
    completeShake,
    completeVerification,
    completeThreeCupDraw,
    rejectVerification,
    finishDrawAnimation,
    toggleFavorite,
    reset,
    setUserName,
    setQuestion,
    setQuestionCategory,
    showToast,
  };
}


