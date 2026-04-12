import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Image as ImageIcon, Plus, GripVertical, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Language, ImageItem } from "@/types/clinical";

interface ImageUploadProps {
  onSubmit: (images: ImageItem[], context: string) => void;
  isLoading: boolean;
  language: Language;
}

const MAX_IMAGES = 5;

const contextPlaceholders: Record<Language, string> = {
  en: "Clinical context (optional)... e.g., 45M, lesion on forearm, 2 weeks, no itching",
  hi: "नैदानिक संदर्भ (वैकल्पिक)... जैसे, 45 वर्ष पुरुष, बांह पर घाव",
  mr: "क्लिनिकल संदर्भ (पर्यायी)... उदा., ४५ वर्षे पुरुष, हातावर जखम",
};

let nextId = 1;

const ImageUpload = ({ onSubmit, isLoading, language }: ImageUploadProps) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [context, setContext] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);

    if (images.length + fileArr.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        const id = `img-${nextId++}`;
        setImages(prev => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, {
            id,
            base64,
            mimeType: file.type,
            preview: result,
            label: `Image ${prev.length + 1}`,
            note: "",
          }];
        });
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setError(null);
  };

  const updateLabel = (id: string, label: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, label } : img));
  };

  const updateNote = (id: string, note: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, note } : img));
  };

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

  const handleSubmit = () => {
    if (images.length === 0) return;
    onSubmit(images, context);
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Image Diagnosis</h2>
        {images.length > 0 && (
          <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
        )}
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
      )}

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
        <div className="space-y-3">
          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`group relative rounded-lg border border-border/60 bg-muted/30 overflow-hidden transition-all animate-in fade-in duration-300 ${dragIdx === idx ? 'opacity-50 scale-95' : ''}`}
              >
                {/* Drag handle */}
                <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                {/* Action buttons */}
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
                {/* Thumbnail */}
                <img src={img.preview} alt={img.label} className="w-full aspect-square object-cover" />
                {/* Label + Note */}
                <div className="p-2 space-y-1.5">
                  <Input
                    value={img.label}
                    onChange={(e) => updateLabel(img.id, e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border/40"
                    placeholder="Label"
                  />
                  <Input
                    value={img.note}
                    onChange={(e) => updateNote(img.id, e.target.value)}
                    className="h-7 text-xs bg-background/50 border-border/40"
                    placeholder="Note (optional)"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add More */}
          {images.length < MAX_IMAGES && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Add more images
              </Button>
              <Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="gap-1.5">
                <Camera className="h-3.5 w-3.5" />Camera
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) processFiles([e.target.files[0]]); e.target.value = ""; }}
      />

      <Textarea
        placeholder={contextPlaceholders[language]}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="min-h-[60px] bg-muted/50 border-border/60 resize-none"
      />

      <Button onClick={handleSubmit} disabled={images.length === 0 || isLoading} className="w-full gap-2">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Analyzing {images.length} Image{images.length > 1 ? 's' : ''}...</>
        ) : (
          <><ImageIcon className="h-4 w-4" />Analyze {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''}` : 'Images'}</>
        )}
      </Button>

      {/* Full-screen preview */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {expandedImage && <img src={expandedImage} alt="Full view" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
