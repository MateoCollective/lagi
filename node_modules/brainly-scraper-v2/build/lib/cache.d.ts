import type { Question, Answer, LanguageList } from './types';
export declare type CacheResult = Record<LanguageList, Record<string, {
    question: Question;
    answers: Answer[];
}[]>>;
export declare class Cache {
    private temporaryPath;
    constructor();
    clearAll(): void;
    get(l: LanguageList, q: string): {
        question: Question;
        answers: Answer[];
    }[] | undefined;
    set(l: LanguageList, q: string, res: {
        question: Question;
        answers: Answer[];
    }[]): void;
    has(l: LanguageList, q: string): boolean;
    getQuestionsByLang(lang: LanguageList): Record<string, {
        question: Question;
        answers: Answer[];
    }[]>;
    json(): CacheResult;
}
