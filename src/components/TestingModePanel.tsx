import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTestingMode } from "@/contexts/TestingModeContext";

const TestingModePanel = () => {
  const { isTestingMode, simulatedState, setSimulatedState, toggleTestingMode } = useTestingMode();

  if (!isTestingMode) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTestingMode}
        title="Enable Testing Mode"
        className="text-muted-foreground hover:text-warning"
      >
        <FlaskConical className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px] px-1.5">TEST</Badge>
      <Select
        value={simulatedState ?? ""}
        onValueChange={(v) => setSimulatedState(v as "trial" | "active" | "expired")}
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Select state" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trial">Trial User</SelectItem>
          <SelectItem value="active">Active User</SelectItem>
          <SelectItem value="expired">Expired User</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={toggleTestingMode} title="Disable Testing Mode" className="text-warning">
        <FlaskConical className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TestingModePanel;
