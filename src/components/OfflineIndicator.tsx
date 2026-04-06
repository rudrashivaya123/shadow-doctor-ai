import { WifiOff, Wifi, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  onSync?: () => void;
}

const OfflineIndicator = ({ isOnline, pendingCount, onSync }: OfflineIndicatorProps) => {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <Badge variant="destructive" className="gap-1 text-[10px] h-5">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}
      {isOnline && pendingCount > 0 && (
        <Badge
          variant="secondary"
          className="gap-1 text-[10px] h-5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={onSync}
        >
          <CloudUpload className="h-3 w-3" />
          Sync {pendingCount}
        </Badge>
      )}
    </div>
  );
};

export default OfflineIndicator;
