import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

const DemoModeBadge = () => {
  const { isDemoUser } = useAuth();
  if (!isDemoUser) return null;

  return (
    <Badge variant="outline" className="gap-1 border-primary/40 text-primary bg-primary/10 text-xs">
      <Eye className="h-3 w-3" />
      Demo Mode
    </Badge>
  );
};

export default DemoModeBadge;
