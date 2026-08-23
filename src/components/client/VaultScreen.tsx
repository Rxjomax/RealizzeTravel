import React, { useState, useRef, useEffect } from 'react';
import { FileText, DownloadCloud, CheckCircle2, ShieldCheck, WifiOff, Upload, Eye, X, ExternalLink } from 'lucide-react';
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
      console.log(`Document saved to AsyncStorage: doc_${id}`);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUserEmail) {
      // Security: Validate file type and size
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

      // Convert file to Data URL (base64) so it renders reliably inside modals and sandboxed viewer
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
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 px-6 pt-12 pb-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Modal Header Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3 truncate pr-2">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">{previewDoc.title}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{previewDoc.type} • Documento no Cofre</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewDoc.fileUrl && (
                  <button
                    onClick={() => handleOpenNewTab()}
                    className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    title="Abrir em Nova Aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nova Aba</span>
                  </button>
                )}
                
                {previewDoc.fileUrl && (
                  <button
                    onClick={() => handleDownloadFile()}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    title="Baixar para o Dispositivo"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>
                )}

                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Fechar Visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Document Container */}
            <div className="flex-1 overflow-auto bg-slate-900 p-3 md:p-6 flex flex-col items-center justify-center min-h-[65vh]">
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
                  <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl border border-slate-800" />
                )
              ) : (
                <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 text-white max-w-md">
                  <WifiOff className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="font-bold text-sm text-slate-200">Pré-visualização de Exemplo</h3>
                  <p className="text-xs text-slate-400 mt-1">Este item de demonstração não possui arquivo anexado. Adicione um PDF clicando em "Adicionar" para testar o envio e a visualização completa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Cofre de Documentos</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seus vouchers, passagens e documentos protegidos para a viagem.</p>
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
          className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg shadow-xs transition-all active:translate-y-0.5 flex items-center justify-center gap-2 font-semibold text-xs border border-slate-900 dark:border-slate-100"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Adicionar Documento</span>
        </button>
      </div>

      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-xs">
        <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-lg text-emerald-700 dark:text-emerald-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">Acesso Offline Garantido</h3>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
            Seus documentos ficam armazenados no seu dispositivo para consulta mesmo sem conexão à internet.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {allDocs.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900 w-10 h-10 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{doc.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {doc.type}
                  </span>
                  {doc.isOfflineAvailable && (
                    <span className="flex items-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      SALVO
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(doc.fileUrl || !doc.isOfflineAvailable) && (
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all active:translate-y-0.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Visualizar</span>
                </button>
              )}
              
              <button
                onClick={() => !doc.isOfflineAvailable && simulateDownload(doc.id)}
                disabled={doc.isOfflineAvailable || downloading === doc.id}
                className={cn(
                  "p-2 rounded-lg border flex items-center justify-center transition-all shrink-0",
                  doc.isOfflineAvailable
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:translate-y-0.5"
                )}
                title={doc.isOfflineAvailable ? "Disponível offline" : "Baixar para o dispositivo"}
              >
                {downloading === doc.id ? (
                  <div className="w-4 h-4 border-2 border-slate-800 dark:border-slate-200 border-t-transparent rounded-full animate-spin" />
                ) : doc.isOfflineAvailable ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <DownloadCloud className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
