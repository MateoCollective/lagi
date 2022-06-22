import type { Answer, Author, Comment, LanguageList, OriginalAnswer, OriginalAuthor, OriginalComment, OriginalQuestionAndSimilar, Question, WorkType } from './types';
export default class Util {
    static clearContent(text: string): string;
    static resolveWorkName(lang: LanguageList): WorkType;
    static convertAuthor(author: OriginalAuthor): Author;
    static convertComment(comment: OriginalComment): Comment;
    static convertAnswer(answer: OriginalAnswer): Answer;
    static convertQuestion(question: OriginalQuestionAndSimilar): Question;
}
