export type ApiMeta = {
    timestamp: string;
    durationMs: number;
    path: string;
    method: string;
}

export type ApiResponse<T> = {
    data: T;
    meta: ApiMeta;
}