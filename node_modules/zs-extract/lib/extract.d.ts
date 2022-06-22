export interface IRequestOptions {
    /**
     * URL string.
     */
    url: string;
    /**
     * Request method.
     */
    method?: string;
    /**
     * Request headers.
     */
    headers?: {
        [key: string]: string;
    };
    /**
     * Gzip compression.
     */
    gzip?: boolean;
    /**
     * Body encoding used for callback functions.
     */
    encoding?: string | null;
}
export interface IRequestResponse {
    /**
     * Status code.
     */
    statusCode: number;
    /**
     * Response headers, all lowercase.
     */
    headers: {
        [key: string]: string;
    };
}
export declare type IRequestCallback = (error: any, response: IRequestResponse, body: any) => void;
export declare type IRequest = (options: IRequestOptions, cb?: IRequestCallback) => any;
/**
 * Extract file info from a URL.
 *
 * @param uri The URI to extract info from.
 * @param req Optional custom request function or null.
 * @returns File info.
 */
export declare function extract(uri: string, req?: IRequest | null): Promise<{
    download: string;
    filename: string | null;
}>;
