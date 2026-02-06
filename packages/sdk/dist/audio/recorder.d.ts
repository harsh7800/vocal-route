export declare class AudioRecorder {
    private mediaRecorder?;
    private chunks;
    start(): Promise<void>;
    stop(): Promise<Blob>;
}
