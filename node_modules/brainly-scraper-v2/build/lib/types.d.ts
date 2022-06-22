export declare type WorkType = 'tugas' | 'question' | 'zadanie' | 'tarefa' | 'tarea' | 'gorev' | 'tema' | 'task';
export declare type CountryList = 'id' | 'us' | 'es' | 'ru' | 'ro' | 'pt' | 'tr' | 'ph' | 'pl' | 'hi';
export declare type BaseURLObject = Record<LanguageList, string>;
export declare type Attachments = string[];
export declare type JsonRes = {
    data: {
        questionSearch: {
            edges: BrainlyResponse[];
        };
    };
}[];
export interface Question {
    id: number;
    content: string;
    closed: boolean;
    created: CreatedInterface;
    attachments: Attachments;
    author?: Author;
    education: string;
    education_level?: number;
    canBeAnswered: boolean;
    points_answer: {
        forBest: number;
        normal: number;
    };
    points_question: number;
    grade: string;
    lastActivity?: string;
    verifiedAnswer: boolean;
    _id: string;
}
export interface Answer {
    content: string;
    author?: Author;
    isBest: boolean;
    points: number;
    confirmed: boolean;
    score: number;
    ratesCount: number;
    thanksCount: number;
    attachments: Attachments;
    created: CreatedInterface;
    canComment: boolean;
    verification?: OriginalVerification;
    comments: Comment[];
    _id: string;
}
export interface Comment {
    id: number;
    author?: OriginalComment['author'];
    content: string;
    deleted?: boolean;
}
export interface OriginalComment {
    databaseId: number;
    deleted?: boolean;
    content: string;
    author: {
        databaseId: number;
        nick: string;
        avatar: {
            url: string;
            thumbnailUrl: string;
        };
        friends: {
            count: number;
        };
        receivedThanks: number;
        points: number;
        created: string;
        description: string;
    };
}
export declare type OriginalAttachments = {
    url: string;
}[];
export interface OriginalAuthor {
    id: string;
    databaseId: number;
    nick: string;
    avatar: {
        url: string;
        thumbnailUrl: string;
    };
    description: string;
    helpedUsersCount: number;
    gender: string;
    created: string;
    specialRanks: {
        name: string;
    }[];
    bestAnswersCount: number;
    answererLevel: string;
    receivedThanks: number;
    points: number;
    rank: {
        name: string;
    };
    friends: {
        count: number;
    };
    answeringStreak?: {
        pointsForToday: number;
        pointForTommorow: number;
        progressIncreasedToday: boolean;
        progress: number;
        canLotteryPointsBeClaimed: boolean;
    };
    bestAnswersCountInLast30Days: number;
    questions: {
        count: number;
        edges: {
            node: {
                content: string;
                grade: {
                    name: string;
                };
                subject: {
                    slug: string;
                };
                points: number;
                pointsForBestAnswer: number;
                pointsForAnswer: number;
                isClosed: boolean;
                canBeAnswered: boolean;
                created: string;
                attachments: OriginalAttachments;
                eduLevel?: number;
            };
        }[];
    };
}
export interface OriginalVerification {
    approval: {
        approver: {
            nick: string;
            databaseId: number;
        };
    };
}
export interface OriginalQuestion {
    id: string;
    databaseId: number;
    content: string;
    author: OriginalAuthor;
    attachments: OriginalAttachments;
    points: number;
    pointsForAnswer: number;
    pointsForBestAnswer: number;
    created: string;
    isClosed: boolean;
    canBeAnswered: boolean;
    grade: {
        name: string;
    };
    lastActivity?: string;
    subject: {
        slug: string;
    };
    eduLevel?: number;
    answers: {
        hasVerified: boolean;
        nodes: OriginalAnswer[];
    };
}
export interface OriginalQuestionAndSimilar extends OriginalQuestion {
    similar: {
        question: OriginalQuestion[];
    };
}
export interface OriginalAnswer {
    id: string;
    databaseId: number;
    content: string;
    created: string;
    isBest: boolean;
    isConfirmed: boolean;
    points: number;
    qualityScore: number;
    thanksCount: number;
    ratesCount: number;
    author: OriginalAuthor;
    verification: OriginalVerification;
    attachments: OriginalAttachments;
    canComment: boolean;
    comments: {
        count: number;
        edges: {
            node: OriginalComment;
        }[];
    };
}
export interface Author {
    id: number;
    username?: string;
    avatar_url?: string;
    rank: string;
    description?: string;
    gender: string;
    points: number;
    receivedThanks: number;
    bestAnswersCount: number;
    helpedUsersCount: number;
    specialRanks: string[];
    friendsCount: number;
    created: CreatedInterface;
    bestAnswers: {
        count: number;
        InLast30Days: number;
    };
    answerStreak?: OriginalAuthor['answeringStreak'];
    questions: {
        count: number;
        data: AuthorQuestionData[];
    };
    _id: string;
}
export interface AuthorQuestionData {
    content: string;
    created: CreatedInterface;
    closed: boolean;
    education: string;
    canBeAnswered: boolean;
    attachments: string[];
    education_level: number;
    points_answer: {
        forBest: number;
        normal: number;
    };
    points_question: number;
    grade: string;
}
export interface CreatedInterface {
    iso: string;
    date: Date;
}
export interface BrainlyResponse {
    node: OriginalQuestionAndSimilar;
}
export declare type LanguageList = CountryList;
