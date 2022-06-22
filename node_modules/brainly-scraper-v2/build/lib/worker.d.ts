import type { AxiosRequestConfig } from 'axios';
import { CountryList, LanguageList, Answer, Question } from '..';
export declare function search({ c, language, question, length, options, }: {
    c: CountryList;
    language: LanguageList;
    question: string;
    length: number;
    options?: AxiosRequestConfig;
}): Promise<{
    question: Question;
    answers: Answer[];
}[] | {
    err: string;
}>;
