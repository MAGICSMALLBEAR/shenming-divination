// 籤詩社群留言服務（本地儲存）
import { getItem, setItem } from './storage';

const COMMENTS_KEY = '@divination_comments';

export interface Comment {
  id: string;
  poemNumber: number;
  author: string;
  content: string;
  timestamp: number;
}

export async function getComments(poemNumber: number): Promise<Comment[]> {
  const data = await getItem(COMMENTS_KEY);
  const all: Comment[] = data ? JSON.parse(data) : [];
  return all.filter(c => c.poemNumber === poemNumber).sort((a, b) => b.timestamp - a.timestamp);
}

export async function addComment(poemNumber: number, author: string, content: string): Promise<Comment> {
  const data = await getItem(COMMENTS_KEY);
  const all: Comment[] = data ? JSON.parse(data) : [];
  const comment: Comment = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    poemNumber,
    author: author || '匿名信眾',
    content,
    timestamp: Date.now(),
  };
  all.unshift(comment);
  await setItem(COMMENTS_KEY, JSON.stringify(all));
  return comment;
}

export async function deleteComment(id: string): Promise<void> {
  const data = await getItem(COMMENTS_KEY);
  const all: Comment[] = data ? JSON.parse(data) : [];
  await setItem(COMMENTS_KEY, JSON.stringify(all.filter(c => c.id !== id)));
}
