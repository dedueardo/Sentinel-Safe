import React, { useEffect, useRef } from 'react';
import type { StreamType } from '../../types/camera';
// @ts-ignore
import JSMpeg from 'jsmpeg-player';

interface StreamPlayerProps {
    streamUrl: string;
    streamType: StreamType;
    cameraName: string;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ streamUrl, streamType, cameraName }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerRef = useRef<any>(null);

    if (streamType === 'mjpeg') {
        const token = localStorage.getItem('@Sentinel:token');
        const mjpegUrl = token
            ? `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}auth=${encodeURIComponent(token)}`
            : streamUrl;
        return (
            <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
                <img
                    src={mjpegUrl}
                    alt={cameraName}
                    loading="eager"
                    decoding="sync"
                    draggable={false}
                    className="w-full h-full object-contain select-none"
                    style={{ imageRendering: 'auto' }}
                    onError={(e) => {
                        console.error('Falha ao carregar MJPEG:', mjpegUrl);
                        (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                    }}
                />
            </div>
        );
    }

    useEffect(() => {
        if (!streamUrl || !canvasRef.current) return;

        try {
            const wsUrl = /^http:/.test(streamUrl) ? streamUrl.replace(/^http:/, 'ws:') : streamUrl;

            if (!playerRef.current && canvasRef.current) {
                const player = new JSMpeg.Player(wsUrl, {
                    canvas: canvasRef.current,
                    autoplay: true,
                    audio: false,
                    videoBufferSize: 1024 * 1024 * 2,
                    disableGl: true,
                    preserveDrawingBuffer: false,
                });
                playerRef.current = player;

                const sock = player.source?.socket;
                if (sock) {
                    sock.addEventListener('open', () => console.log(`[JSMpeg] WS aberto: ${wsUrl}`));
                    sock.addEventListener('error', (e: any) => console.error(`[JSMpeg] WS erro:`, e));
                    sock.addEventListener('close', () => console.warn(`[JSMpeg] WS fechado: ${wsUrl}`));
                }

                console.log(`Stream conectado via JSMpeg: ${wsUrl}`);
            }
        } catch (error) {
            console.error(`Erro ao conectar stream ${cameraName}:`, error);
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (error) {
                    console.warn('Erro ao destruir player:', error);
                }
                playerRef.current = null;
            }
        };
    }, [streamUrl, streamType, cameraName]);

    return (
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    backgroundColor: '#000',
                    display: 'block',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
};

export default StreamPlayer;