import type { AxiosRequestConfig, AxiosInstance } from 'axios';
import { Answer, CountryList, LanguageList, Question } from './types';
import { Cache } from './cache';
export declare class Brainly {
    country: CountryList;
    private enabledCache;
    private worker;
    cache: Cache;
    constructor(country?: CountryList, enabledCache?: boolean);
    search(question: string, language?: LanguageList, length?: number, options?: AxiosRequestConfig): Promise<{
        question: Question;
        answers: Answer[];
    }[]>;
    static getRequestParams(question: string, length?: number): {
        operationName: string;
        query: string;
        variables: {
            len: number;
            query: string;
        };
    }[];
    static isValidLanguage(lang: LanguageList): boolean;
    static getBaseURL(country: CountryList): string;
    searchWithMT(question: string, language?: LanguageList, length?: number, options?: AxiosRequestConfig): Promise<{
        question: Question;
        answers: Answer[];
    }[]>;
    static client(country: CountryList): AxiosInstance;
}
