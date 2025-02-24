declare module 'ffmpeg-extract-audio' {
    export default function extractAudio(options: { 
        input: string; 
        output: string; 
        ffmpegPath?: string;
    }): Promise<void>;
}
