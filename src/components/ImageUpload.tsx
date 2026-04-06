import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Language } from "@/types/clinical";

interface ImageUploadProps {
  onSubmit: (imageBase64: string, mimeType: string, context: string) => void;
  isLoading: boolean;
  language: Language;
}

const contextPlaceholders: Record<Language, string> = {
  en: "Clinical context (optional)... e.g., 45M, lesion on forearm, 2 weeks, no itching",
  hi: "नैदानिक संदर्भ (वैकल्पिक)... जैसे, 45 वर्ष पुरुष, बांह पर घाव",
  mr: "क्लिनिकल संदर्भ (पर्यायी)... उदा., ४५ वर्षे पुरुष, हातावर जखम",
};

const ImageUpload = ({ onSubmit, isLoading, language }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [context, setContext] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64 = result.split(",")[1];
      setImageData({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
  };

  const handleSubmit = () => {
    if (!imageData) return;
    onSubmit(imageData.base64, imageData.mimeType, context);
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Image Diagnosis</h2>

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center space-y-3 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload a clinical image
          </p>
          <p className="text-xs text-muted-foreground">JPEG, PNG up to 10MB</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              File
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cameraRef.current?.click();
              }}
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Camera
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Clinical image"
            className="w-full max-h-64 object-contain rounded-lg bg-muted/30"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={clearImage}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />

      <Textarea
        placeholder={contextPlaceholders[language]}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="min-h-[60px] bg-muted/50 border-border/60 resize-none"
      />

      <Button
        onClick={handleSubmit}
        disabled={!imageData || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing Image...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            Analyze Image
          </>
        )}
      </Button>
    </div>
  );
};

export default ImageUpload;
