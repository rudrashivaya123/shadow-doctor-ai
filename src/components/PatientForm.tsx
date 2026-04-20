import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PatientFormProps {
  onSuccess: (patient: any) => void;
  onCancel?: () => void;
}

const PatientForm = ({ onSuccess, onCancel }: PatientFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { patientSchema, firstZodError } = await import("@/lib/validation");
    const result = patientSchema.safeParse({ name, age, gender, phone });
    if (!result.success) {
      toast({ title: "Invalid input", description: firstZodError(result), variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .insert({
        user_id: user!.id,
        name: result.data.name,
        age: result.data.age,
        gender: result.data.gender || null,
        phone: result.data.phone || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add patient.", variant: "destructive" });
    } else {
      toast({ title: "Patient Added", description: `${result.data.name} has been registered.` });
      onSuccess(data);
      setName(""); setAge(""); setGender(""); setPhone("");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 md:p-6 space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary" />
        Register New Patient
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">Patient Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" min={0} max={150} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!name.trim() || loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Add Patient
        </Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
};

export default PatientForm;
