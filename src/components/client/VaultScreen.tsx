import React, { useState, useRef, useEffect } from 'react';
import { FileText, DownloadCloud, CheckCircle2, ShieldCheck, WifiOff, Upload, Eye, X, ExternalLink, Lock } from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../data';
import { cn } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import PdfViewer from '../common/PdfViewer';

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function VaultScreen() {
  const { currentUserEmail, clientDocuments, addClientDocument } = useApp();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [docs, setDocs] = useState(MOCK_DOCUMENTS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (previewDoc?.fileUrl && previewDoc.fileUrl.startsWith('data:')) {
      try {
        const blob = dataUrlToBlob(previewDoc.fileUrl);
        const url = URL.createObjectURL(blob);
        setActiveBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error creating blob URL:', err);
        setActiveBlobUrl(null);
      }
    } else if (previewDoc?.fileUrl) {
      setActiveBlobUrl(previewDoc.fileUrl);
    } else {
      setActiveBlobUrl(null);
    }
  }, [previewDoc]);

  const simulateDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, isOfflineAvailable: true } : d));
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUserEmail) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Envie apenas PDF, JPG, PNG ou WEBP.');
        return;
      }
      
      const MAX_SIZE_MB = 10;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`O arquivo é muito grande. O tamanho máximo permitido é ${MAX_SIZE_MB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addClientDocument({
          id: `doc_${Date.now()}`,
          clientEmail: currentUserEmail,
          title: file.name,
          type: file.type.includes('pdf') ? 'PDF' : 'IMAGEM',
          isOfflineAvailable: true,
          fileUrl: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenNewTab = (docToOpen = previewDoc) => {
    if (!docToOpen?.fileUrl) return;
    
    if (docToOpen.fileUrl.startsWith('data:')) {
      try {
        const blob = dataUrlToBlob(docToOpen.fileUrl);
        const url = URL.createObjectURL(blob);
        const newWin = window.open(url, '_blank');
        if (!newWin) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        }
      } catch (e) {
        console.error('Error opening blob in new tab:', e);
      }
    } else {
      window.open(docToOpen.fileUrl, '_blank');
    }
  };

  const handleDownloadFile = (docToDownload = previewDoc) => {
    if (!docToDownload?.fileUrl) return;
    
    const link = document.createElement('a');
    if (docToDownload.fileUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(docToDownload.fileUrl);
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = docToDownload.title || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      link.href = docToDownload.fileUrl;
      link.download = docToDownload.title || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const allDocs = [
    ...clientDocuments.filter(d => d.clientEmail === currentUserEmail),
    ...docs
  ];

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Modal Header Toolbar */}
            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3 truncate pr-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{previewDoc.title}</h2>
                  <p className="text-xs text-slate-400 font-medium">{previewDoc.type} • Cofre de Documentos</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewDoc.fileUrl && (
                  <button
                    onClick={() => handleOpenNewTab()}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Abrir em Nova Aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nova Aba</span>
                  </button>
                )}
                
                {previewDoc.fileUrl && (
                  <button
                    onClick={() => handleDownloadFile()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                    title="Baixar para o Dispositivo"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                )}

                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Document Container */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh]">
              {previewDoc.fileUrl ? (
                previewDoc.type === 'PDF' ? (
                  <div className="w-full max-w-4xl">
                    <PdfViewer
                      fileUrl={previewDoc.fileUrl}
                      title={previewDoc.title}
                      onDownload={() => handleDownloadFile()}
                      onOpenNewTab={() => handleOpenNewTab()}
                    />
                  </div>
                ) : (
                  <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-xl" />
                )
              ) : (
                <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 text-white max-w-md">
                  <WifiOff className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-slate-200">Demonstração de Documento</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Este arquivo de exemplo não possui anexo salvo. Você pode adicionar seus próprios comprovantes clicando em "Adicionar Documento".</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Cofre de Documentos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acesse seus vouchers, passagens e comprovantes mesmo offline.
            </p>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 font-bold text-xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Adicionar Documento</span>
          </button>
        </header>

        {/* Security Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/80 rounded-xl text-emerald-700 dark:text-emerald-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
            <strong>Armazenamento Seguro & Offline:</strong> Seus vouchers são armazenados no cache do seu navegador para consulta imediata mesmo sem sinal ou durante o voo.
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {allDocs.map((doc) => (
            <article 
              key={doc.id} 
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/60 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 pr-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">{doc.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {doc.type}
                    </span>
                    {doc.isOfflineAvailable && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Disponível Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(doc.fileUrl || !doc.isOfflineAvailable) && (
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </button>
                )}
                
                <button
                  onClick={() => !doc.isOfflineAvailable && simulateDownload(doc.id)}
                  disabled={doc.isOfflineAvailable || downloading === doc.id}
                  className={cn(
                    "p-2.5 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer",
                    doc.isOfflineAvailable
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  )}
                  title={doc.isOfflineAvailable ? "Disponível offline" : "Baixar para o dispositivo"}
                >
                  {downloading === doc.id ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : doc.isOfflineAvailable ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <DownloadCloud className="w-4 h-4" />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
