// 求籤流程 Hook - 管理完整求籤狀態機
import { useState, useCallback } from 'react';
import type { Poem } from '@/data/poems/leiyushi';
import { gods, getPoemsByGod } from '@/data/gods';
import { tossJiaobei, drawPoem, saveDivinationRecord } from '@/services/divination';
import { addFavorite, removeFavorite, isFavorite } from '@/services/storage';
import { getAIInterpretation } from '@/services/ai';
import type { JiaobeiResult } from '@/services/divination';
import type { DivinationRecord } from '@/services/storage';

export type FlowStep =
  | 'select-god'
  | 'set-question'
  | 'meditate'
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
  const [drawnPoem, setDrawnPoem] = useState<Poem | null>(null);
  const [aiInterpretation, setAIInterpretation] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<DivinationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setJiaobeiResults([]);
    setStep('toss-jiaobei');
  }, []);

  const performJiaobei = useCallback((): JiaobeiResult => {
    const result = tossJiaobei();
    setJiaobeiResults(prev => [...prev, result]);
    return result;
  }, []);

  const performDraw = useCallback(async () => {
    if (!selectedGodId) return;
    setStep('drawing');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const poem = drawPoem(selectedGodId);
    setDrawnPoem(poem);
    setStep('reveal-poem');

    // 開始 AI 解籤
    setStep('ai-interpret');
    let interpretation: string | null = null;
    try {
      const god = gods.find(g => g.id === selectedGodId);
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
      });
      setAIInterpretation(interpretation);
    } catch {
      setAIInterpretation(null);
    }

    // 儲存紀錄
    const god = gods.find(g => g.id === selectedGodId);
    const record = await saveDivinationRecord({
      godName: god?.name || '神明',
      poem,
      question,
      questionCategory,
      aiInterpretation: interpretation || undefined,
    });
    setCurrentRecord(record);

    // 檢查是否已收藏
    const fav = await isFavorite(poem.number);
    setIsFavorited(fav);

    setIsLoading(false);
    setStep('result');
  }, [selectedGodId, question, questionCategory, userName]);

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
    setDrawnPoem(null);
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
    aiInterpretation,
    currentRecord,
    isLoading,
    isFavorited,
    toastMessage,
    // actions
    goToStep,
    selectGod,
    startMeditation,
    finishMeditation,
    performJiaobei,
    performDraw,
    toggleFavorite,
    reset,
    setUserName,
    setQuestion,
    setQuestionCategory,
    showToast,
  };
}
