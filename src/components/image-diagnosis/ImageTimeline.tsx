import { Maximize2, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ImageItem } from "@/types/clinical";

interface ImageTimelineProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateTimestamp: (id: string, timestamp: string) => void;
  onExpand: (preview: string) => void;
  onSelectForCompare: (id: string) => void;
  compareSelection: string[];
}

const ImageTimeline = ({
  images, onRemove, onUpdateLabel, onUpdateTimestamp,
  onExpand, onSelectForCompare, compareSelection,
}: ImageTimelineProps) => {
  return (
    <div className="relative">
      {/* Timeline track */}
      <div className="absolute top-16 left-0 right-0 h-0.5 bg-border/60 z-0" />

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
        {images.map((img, idx) => {
          const isSelected = compareSelection.includes(img.id);
          return (
            <div
              key={img.id}
              className={`relative flex-shrink-0 w-36 rounded-lg border overflow-hidden transition-all animate-in fade-in duration-300 ${
                isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/60"
              } bg-muted/30`}
            >
              {/* Timeline dot */}
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-10">
                <div className={`h-3 w-3 rounded-full border-2 ${
                  isSelected ? "bg-primary border-primary" : "bg-background border-border"
                }`} />
              </div>

              {/* Image */}
              <div className="relative group">
                <img
                  src={img.preview}
                  alt={img.label}
                  loading="lazy"
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => onSelectForCompare(img.id)}
                />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onExpand(img.preview); }}
                    className="h-5 w-5 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                  >
                    <Maximize2 className="h-2.5 w-2.5 text-foreground" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                    className="h-5 w-5 rounded-full bg-destructive/80 backdrop-blur flex items-center justify-center"
                  >
                    <X className="h-2.5 w-2.5 text-destructive-foreground" />
                  </button>
                </div>
                {/* Order badge */}
                <div className="absolute bottom-1 left-1 bg-background/80 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                  #{idx + 1}
                </div>
              </div>

              {/* Meta */}
              <div className="p-1.5 space-y-1">
                <Input
                  value={img.label}
                  onChange={(e) => onUpdateLabel(img.id, e.target.value)}
                  className="h-6 text-[10px] bg-background/50 border-border/40"
                  placeholder="Label"
                />
                <Input
                  type="date"
                  value={img.timestamp || ""}
                  onChange={(e) => onUpdateTimestamp(img.id, e.target.value)}
                  className="h-6 text-[10px] bg-background/50 border-border/40"
                />
                {/* Tags */}
                {img.tags && img.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {img.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        <Tag className="h-2 w-2 mr-0.5" />{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageTimeline;
