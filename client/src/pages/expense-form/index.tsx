import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, categories } from "@shared/schema";
import FormStepWrapper from "@/components/expense-form/FormStepWrapper";
import ProgressBar from "@/components/expense-form/ProgressBar";

export default function ExpenseForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      user: "",
      category: "",
      subCategory: "",
      description: "",
      amount: "",
      date: new Date(),
      receiptUrl: "",
      notes: "",
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: any) => {
      // Handle file upload if a file is selected
      if (file) {
        // In a real app, we would upload the file to a storage service
        // and get back a URL to store in the database
        data.receiptUrl = URL.createObjectURL(file);
      }
      const res = await apiRequest("POST", "/api/expenses", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense saved successfully",
      });
      form.reset();
      setFile(null);
      setStep(1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 7));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, we would handle capturing the photo here
      // For now, we'll just stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  return (
    <div className="min-h-screen bg-[#D8E2C6] bg-gradient-to-br from-[#D8E2C6] to-[#F7F8F5] p-4">
      <Card className="max-w-lg mx-auto bg-[#F7F8F5]">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProgressBar currentStep={step} totalSteps={7} />

              <FormStepWrapper show={step === 1}>
                <h2 className="text-2xl font-bold mb-4">Expense Tracker</h2>
                <p className="text-gray-600 mb-6">Let's build healthy habits.</p>
                <Select
                  name="user"
                  onValueChange={(value) => form.setValue("user", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tyler">Tyler</SelectItem>
                    <SelectItem value="Alexa">Alexa</SelectItem>
                  </SelectContent>
                </Select>
              </FormStepWrapper>

              <FormStepWrapper show={step === 2}>
                <h2 className="text-xl font-semibold mb-4">Select Category</h2>
                <Select
                  name="category"
                  onValueChange={(value) => {
                    form.setValue("category", value);
                    form.setValue("subCategory", ""); // Reset sub-category when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormStepWrapper>

              <FormStepWrapper show={step === 3}>
                <h2 className="text-xl font-semibold mb-4">Select Sub-Category</h2>
                <Select
                  name="subCategory"
                  onValueChange={(value) => form.setValue("subCategory", value)}
                  disabled={!form.watch("category")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sub-Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {form.watch("category") &&
                      categories[form.watch("category") as keyof typeof categories].map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormStepWrapper>

              <FormStepWrapper show={step === 4}>
                <h2 className="text-xl font-semibold mb-4">Miscellaneous Description</h2>
                <Input
                  type="text"
                  placeholder="Enter description..."
                  {...form.register("description")}
                  className={cn(
                    form.watch("category") !== "Misc (please describe)" && "hidden"
                  )}
                />
              </FormStepWrapper>

              <FormStepWrapper show={step === 5}>
                <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("amount")}
                />
              </FormStepWrapper>

              <FormStepWrapper show={step === 6}>
                <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("date") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="flex justify-between items-center gap-2">
                        <Select
                          value={form.watch("date")?.getFullYear().toString()}
                          onValueChange={(year) => {
                            const newDate = new Date(form.watch("date"));
                            newDate.setFullYear(parseInt(year));
                            form.setValue("date", newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generateYearOptions().map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={(form.watch("date")?.getMonth() + 1).toString()}
                          onValueChange={(month) => {
                            const newDate = new Date(form.watch("date"));
                            newDate.setMonth(parseInt(month) - 1);
                            form.setValue("date", newDate);
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={form.watch("date")}
                      onSelect={(date) => form.setValue("date", date!)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormStepWrapper>

              <FormStepWrapper show={step === 7}>
                <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCameraCapture}
                  >
                    Take Photo
                  </Button>
                </div>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {file && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
                <Textarea
                  placeholder="Additional notes..."
                  className="mt-4"
                  {...form.register("notes")}
                />
              </FormStepWrapper>

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {step < 7 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto">
                    Submit
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}