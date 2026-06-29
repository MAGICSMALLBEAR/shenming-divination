// 求籤流程 Hook - 管理完整求籤狀態機
import { useState, useCallback } from 'react';
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
import type { JiaobeiResult } from '@/services/divination';
import type { DivinationRecord } from '@/services/storage';

export type FlowStep =
  | 'select-god'
  | 'set-question'
  | 'meditate'
  | 'enter-zhuge-number'
  | 'toss-jiaobei'
  | 'drawing'
  | 'reveal-poem'
  | 'ai-interpret'
  | 'result';

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
      setStep('enter-zhuge-number');
    } else {
      setJiaobeiResults([]);
      setStep('toss-jiaobei');
    }
  }, [selectedGodId]);

  const performJiaobei = useCallback((): JiaobeiResult => {
    const result = tossJiaobei();
    setJiaobeiResults(prev => [...prev, result]);
    return result;
  }, []);

  const submitZhugeNumber = useCallback((n: number) => {
    setZhugeNumber(n);
    setStep('drawing');
  }, []);

  const performDraw = useCallback(async (inputZhugeNumber?: number) => {
    if (!selectedGodId) return;
    const god = gods.find(g => g.id === selectedGodId);
    const num = inputZhugeNumber ?? zhugeNumber;
    const poem = (god?.poemSystem === '諸葛神數' && num != null)
      ? drawZhugePoem(num)
      : drawPoem(selectedGodId);
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
    setStep('drawing');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, animationDuration));

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
  }, [selectedGodId, question, questionCategory, userName, zhugeNumber]);

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
    // actions
    goToStep,
    selectGod,
    startMeditation,
    finishMeditation,
    performJiaobei,
    submitZhugeNumber,
    performDraw,
    toggleFavorite,
    reset,
    setUserName,
    setQuestion,
    setQuestionCategory,
    showToast,
  };
}
