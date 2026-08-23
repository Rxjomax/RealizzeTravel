import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, DownloadCloud, ExternalLink, AlertCircle, FileText } from 'lucide-react';

// Configure worker URL using local Vite asset import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  fileUrl: string;
  title?: string;
  onDownload?: () => void;
  onOpenNewTab?: () => void;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(',');
  const base64 = parts.length > 1 ? parts[1] : parts[0];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function PdfViewer({ fileUrl, title, onDownload, onOpenNewTab }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document safely
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    try {
      if (fileUrl.startsWith('data:')) {
        const data = dataUrlToUint8Array(fileUrl);
        loadingTask = pdfjsLib.getDocument({ data });
      } else {
        loadingTask = pdfjsLib.getDocument({ url: fileUrl });
      }

      loadingTask.promise
        .then((doc) => {
          if (!isMounted) return;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('PDF.js load error:', err);
          setError('Não foi possível carregar a pré-visualização deste PDF.');
          setLoading(false);
        });
    } catch (err) {
      console.error('PDF init error:', err);
      setError('Formato do PDF inválido.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [fileUrl]);

  // Render current Page to Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: pdfjsLib.RenderTask | null = null;

    pdfDoc.getPage(pageNum).then((page) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext: any = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      renderTask = page.render(renderContext);
      renderTask.promise.catch((err: any) => {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('PDF Render error:', err);
        }
      });
    }).catch(err => {
      console.error('Error fetching PDF page:', err);
    });

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="w-full flex flex-col items-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Viewer Header Toolbar */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-200 z-10">
        <div className="flex items-center gap-2">
          <button
            disabled={pageNum <= 1 || loading || Boolean(error)}
            onClick={() => setPageNum(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Página Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <span className="text-xs font-bold px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700">
            {loading ? 'Carregando...' : error ? 'Erro' : `Pág ${pageNum} de ${numPages}`}
          </span>

          <button
            disabled={pageNum >= numPages || loading || Boolean(error)}
            onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Próxima Página"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={loading || Boolean(error)}
            onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <span className="text-xs font-bold text-slate-300 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            disabled={loading || Boolean(error)}
            onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Canvas / Render Area */}
      <div className="w-full max-h-[70vh] min-h-[50vh] overflow-auto p-4 flex items-center justify-center bg-slate-950">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs font-semibold">Carregando e renderizando PDF no cofre...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-300 max-w-md space-y-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{title || 'Documento PDF'}</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 justify-center">
              {onOpenNewTab && (
                <button
                  onClick={onOpenNewTab}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir em Nova Aba
                </button>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <DownloadCloud className="w-4 h-4" /> Baixar PDF
                </button>
              )}
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto rounded-lg shadow-2xl transition-all ${loading || error ? 'hidden' : 'block'}`}
        />
      </div>
    </div>
  );
}
