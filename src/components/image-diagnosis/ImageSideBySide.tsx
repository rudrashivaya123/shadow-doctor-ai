import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageItem } from "@/types/clinical";

interface ImageSideBySideProps {
  imageA: ImageItem;
  imageB: ImageItem;
  onClose: () => void;
}

const ImageSideBySide = ({ imageA, imageB, onClose }: ImageSideBySideProps) => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="glass-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Side-by-Side Comparison</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-primary text-center">{imageA.label}</p>
          <div className="overflow-auto rounded-lg border border-border/40 bg-muted/20 max-h-80">
            <img
              src={imageA.preview}
              alt={imageA.label}
              className="w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            />
          </div>
          {imageA.timestamp && <p className="text-[10px] text-muted-foreground text-center">{imageA.timestamp}</p>}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-primary text-center">{imageB.label}</p>
          <div className="overflow-auto rounded-lg border border-border/40 bg-muted/20 max-h-80">
            <img
              src={imageB.preview}
              alt={imageB.label}
              className="w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            />
          </div>
          {imageB.timestamp && <p className="text-[10px] text-muted-foreground text-center">{imageB.timestamp}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageSideBySide;
