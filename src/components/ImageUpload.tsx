import { useState, useRef, useCallback } from "react";
import {
  Camera, Upload, X, Loader2, Image as ImageIcon, Plus,
  GripVertical, Maximize2, LayoutGrid, Clock, GitCompareArrows,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImageTimeline from "@/components/image-diagnosis/ImageTimeline";
import ImageSideBySide from "@/components/image-diagnosis/ImageSideBySide";
import type { Language, ImageItem } from "@/types/clinical";

interface ImageUploadProps {
  onSubmit: (images: ImageItem[], context: string) => void;
  onCompare?: (imageA: ImageItem, imageB: ImageItem) => void;
  isLoading: boolean;
  isComparing?: boolean;
  language: Language;
}

const MAX_IMAGES = 5;

const contextPlaceholders: Record<Language, string> = {
  en: "Clinical context (optional)... e.g., 45M, lesion on forearm, 2 weeks, no itching",
  hi: "नैदानिक संदर्भ (वैकल्पिक)... जैसे, 45 वर्ष पुरुष, बांह पर घाव",
  ta: "மருத்துவ சூழல் (விருப்பம்)... எ.கா., 45 ஆண், கைமுட்டியில் காயம்",
  te: "వైద్య సందర్భం (ఐచ్ఛికం)... ఉదా., 45 పురుషుడు, చేతిపై గాయం",
  bn: "ক্লিনিকাল প্রসঙ্গ (ঐচ্ছিক)... যেমন, ৪৫ পুরুষ, বাহুতে ক্ষত",
  mr: "क्लिनिकल संदर्भ (पर्यायी)... उदा., 45 पुरुष, हातावर जखम",
};

let nextId = 1;

const ImageUpload = ({ onSubmit, onCompare, isLoading, isComparing, language }: ImageUploadProps) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [context, setContext] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const downscaleImage = (file: File, mime: "image/jpeg" | "image/png" | "image/webp"): Promise<{ base64: string; dataUrl: string; mime: string }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        const scale = Math.min(1, MAX_DIM / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas unsupported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        // Always re-encode as JPEG for size; PNG kept as PNG for transparency
        const outMime = mime === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outMime, 0.85);
        URL.revokeObjectURL(url);
        const base64 = dataUrl.split(",")[1];
        if (!base64) { reject(new Error("Encoding failed")); return; }
        resolve({ base64, dataUrl, mime: outMime });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image decode failed")); };
      img.src = url;
    });

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const { validateImageFile, verifyImageMagicBytes, resolveImageMime } = await import("@/lib/validation");
    const accepted: { file: File; mime: "image/jpeg" | "image/png" | "image/webp" }[] = [];
    for (const f of Array.from(files)) {
      const err = validateImageFile(f);
      if (err) { setError(err); continue; }
      const ok = await verifyImageMagicBytes(f);
      if (!ok) { setError(`"${f.name}" failed image integrity check.`); continue; }
      const mime = resolveImageMime(f);
      if (!mime) { setError(`"${f.name}" has an unsupported format.`); continue; }
      accepted.push({ file: f, mime });
    }

    if (images.length + accepted.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    for (const { file, mime } of accepted) {
      try {
        const { base64, dataUrl, mime: outMime } = await downscaleImage(file, mime);
        const id = `img-${nextId++}`;
        setImages(prev => {
          if (prev.length >= MAX_IMAGES) return prev;
          const newImages = [...prev, {
            id, base64, mimeType: outMime, preview: dataUrl,
            label: `Image ${prev.length + 1}`, note: "",
            timestamp: new Date().toISOString().split("T")[0], tags: [],
          }];
          if (newImages.length >= 2) setViewMode("timeline");
          return newImages;
        });
      } catch (e: any) {
        setError(`Could not process "${file.name}": ${e?.message ?? "unknown error"}`);
      }
    }
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setCompareSelection(prev => prev.filter(s => s !== id));
    setError(null);
  };

  const updateLabel = (id: string, label: string) =>
    setImages(prev => prev.map(img => img.id === id ? { ...img, label } : img));

  const updateNote = (id: string, note: string) =>
    setImages(prev => prev.map(img => img.id === id ? { ...img, note } : img));

  const updateTimestamp = (id: string, timestamp: string) =>
    setImages(prev => prev.map(img => img.id === id ? { ...img, timestamp } : img));

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setImages(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const toggleCompareSelection = (id: string) => {
    setCompareSelection(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (compareSelection.length !== 2 || !onCompare) return;
    const imgA = images.find(i => i.id === compareSelection[0]);
    const imgB = images.find(i => i.id === compareSelection[1]);
    if (imgA && imgB) onCompare(imgA, imgB);
  };

  const handleSubmit = () => {
    if (images.length === 0) return;
    onSubmit(images, context);
  };

  const compareImgA = images.find(i => i.id === compareSelection[0]);
  const compareImgB = images.find(i => i.id === compareSelection[1]);

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">Image Diagnosis</h2>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
          )}
          {images.length >= 2 && (
            <div className="flex rounded-md border border-border/60 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                  viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <LayoutGrid className="h-3 w-3" />Grid
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                  viewMode === "timeline" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Clock className="h-3 w-3" />Timeline
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
      )}

      {/* Empty state */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center space-y-3 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Drag & drop or click to upload clinical images</p>
          <p className="text-xs text-muted-foreground">JPEG, PNG up to 10MB · Max {MAX_IMAGES} images</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />File
            </Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}>
              <Camera className="h-3.5 w-3.5 mr-1.5" />Camera
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Timeline View */}
          {viewMode === "timeline" ? (
            <ImageTimeline
              images={images}
              onRemove={removeImage}
              onUpdateLabel={updateLabel}
              onUpdateTimestamp={updateTimestamp}
              onExpand={setExpandedImage}
              onSelectForCompare={toggleCompareSelection}
              compareSelection={compareSelection}
            />
          ) : (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, idx) => {
                const isSelected = compareSelection.includes(img.id);
                return (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-lg border overflow-hidden transition-all animate-in fade-in duration-300 ${
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/60"
                    } bg-muted/30 ${dragIdx === idx ? "opacity-50 scale-95" : ""}`}
                  >
                    <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="absolute top-1 right-1 z-10 flex gap-1">
                      <button
                        onClick={() => setExpandedImage(img.preview)}
                        className="h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <Maximize2 className="h-3 w-3 text-foreground" />
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="h-6 w-6 rounded-full bg-destructive/80 backdrop-blur flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <X className="h-3 w-3 text-destructive-foreground" />
                      </button>
                    </div>
                    <img
                      src={img.preview}
                      alt={img.label}
                      loading="lazy"
                      className="w-full aspect-square object-cover cursor-pointer"
                      onClick={() => images.length >= 2 && toggleCompareSelection(img.id)}
                    />
                    <div className="p-2 space-y-1.5">
                      <Input value={img.label} onChange={(e) => updateLabel(img.id, e.target.value)} className="h-7 text-xs bg-background/50 border-border/40" placeholder="Label" />
                      <Input value={img.note} onChange={(e) => updateNote(img.id, e.target.value)} className="h-7 text-xs bg-background/50 border-border/40" placeholder="Note (optional)" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compare + Side-by-Side buttons */}
          {images.length >= 2 && (
            <div className="flex flex-wrap gap-2 items-center">
              {compareSelection.length === 2 && (
                <>
                  <Button
                    variant="outline" size="sm"
                    onClick={handleCompare}
                    disabled={isComparing}
                    className="gap-1.5"
                  >
                    {isComparing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
                    Compare Images
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setShowSideBySide(true)}
                    className="gap-1.5"
                  >
                    Side-by-Side
                  </Button>
                </>
              )}
              {compareSelection.length > 0 && compareSelection.length < 2 && (
                <p className="text-xs text-muted-foreground">Select one more image to compare</p>
              )}
              {compareSelection.length === 0 && (
                <p className="text-xs text-muted-foreground">Tap 2 images to compare</p>
              )}
            </div>
          )}

          {/* Side-by-Side View */}
          {showSideBySide && compareImgA && compareImgB && (
            <ImageSideBySide
              imageA={compareImgA}
              imageB={compareImgB}
              onClose={() => setShowSideBySide(false)}
            />
          )}

          {/* Add More */}
          {images.length < MAX_IMAGES && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Add more
              </Button>
              <Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="gap-1.5">
                <Camera className="h-3.5 w-3.5" />Camera
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ""; }}
      />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) processFiles([e.target.files[0]]); e.target.value = ""; }}
      />

      {/* Context */}
      <Textarea
        placeholder={contextPlaceholders[language]}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="min-h-[60px] bg-muted/50 border-border/60 resize-none"
      />

      {/* Analyze */}
      <Button onClick={handleSubmit} disabled={images.length === 0 || isLoading} className="w-full gap-2">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {images.length} Image{images.length > 1 ? "s" : ""}...</>
        ) : (
          <><ImageIcon className="h-4 w-4" />Analyze {images.length > 0 ? `${images.length} Image${images.length > 1 ? "s" : ""}` : "Images"}</>
        )}
      </Button>

      {/* Fullscreen preview */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {expandedImage && <img src={expandedImage} alt="Full view" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
