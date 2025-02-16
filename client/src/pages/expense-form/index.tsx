import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PaperclipIcon, Camera } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, categories } from "@shared/schema";
import FormStepWrapper from "@/components/expense-form/FormStepWrapper";
import ProgressBar from "@/components/expense-form/ProgressBar";

const defaultValues = {
  user: "",
  category: "",
  subCategory: "",
  description: "",
  amount: "",
  date: new Date(),
  receiptUrl: "",
  notes: "",
};

export default function ExpenseForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [useCamera, setUseCamera] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues,
    mode: "onChange",
  });

  const { mutate } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const formattedData = {
          ...data,
          date: data.date.toISOString().split('T')[0],
          amount: data.amount.toString(),
          description: data.description || "",
          notes: data.notes || "",
          receiptUrl: data.receiptUrl || ""
        };

        if (file) {
          formattedData.receiptUrl = URL.createObjectURL(file);
        }

        const res = await apiRequest("POST", "/api/expenses", formattedData);
        if (!res.ok) {
          throw new Error('Failed to save expense');
        }
        return res.json();
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense saved successfully",
      });
      form.reset(defaultValues);
      setFile(null);
      setStep(1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save expense",
        variant: "destructive",
      });
    },
  });

  const canProceed = () => {
    const values = form.getValues();
    switch (step) {
      case 1:
        return !!values.user;
      case 2:
        return !!values.category;
      case 3:
        return !!values.subCategory;
      case 4:
        return true;
      case 5:
        return !!values.amount && !isNaN(parseFloat(values.amount));
      case 6:
        return !!values.date;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setUseCamera(true);

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setUseCamera(false);
      }, 100);

    } catch (error) {
      setUseCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#D8E2C6] bg-gradient-radial from-[#D8E2C6] to-[#F0E5D4] p-4">
      <Card className="max-w-lg mx-auto bg-[#F0E5D4] rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)]">
        <CardContent className="p-8">
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (step === 7) {
                  form.handleSubmit((data) => mutate(data))(e);
                }
              }}
              className="space-y-6"
            >
              <ProgressBar currentStep={step} totalSteps={7} />

              <FormStepWrapper show={step === 1}>
                <h2 className="text-2xl font-bold mb-4">Expense Tracker</h2>
                <p className="text-gray-600 mb-6">Let's track your expenses!</p>
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Select
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="focus:scale-105 transition-transform duration-200">
                          <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tyler">Tyler</SelectItem>
                          <SelectItem value="Alexa">Alexa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 2}>
                <h2 className="text-xl font-semibold mb-4">Select Category</h2>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("subCategory", "");
                        }}
                      >
                        <SelectTrigger className="focus:scale-105 transition-transform duration-200">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 3}>
                <h2 className="text-xl font-semibold mb-4">Select Sub-Category</h2>
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!form.getValues("category")}
                      >
                        <SelectTrigger className="focus:scale-105 transition-transform duration-200">
                          <SelectValue placeholder="Select Sub-Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {form.getValues("category") &&
                            categories[form.getValues("category") as keyof typeof categories]?.map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 4}>
                <h2 className="text-xl font-semibold mb-4">Description (Optional)</h2>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        placeholder="Enter description..."
                        className="focus:scale-105 transition-transform duration-200"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 5}>
                <h2 className="text-xl font-semibold mb-4">Enter Amount (CAD)</h2>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="focus:scale-105 transition-transform duration-200"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 6}>
                <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal focus:scale-105 transition-transform duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            fromYear={2020}
                            toYear={2025}
                            className="rounded-md border"
                            classNames={{
                              caption: "flex justify-center pt-1 relative items-center",
                              caption_label: "hidden",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                              dropdown: "p-2",
                              dropdown_month: "text-sm font-medium",
                              dropdown_year: "text-sm font-medium ml-2"
                            }}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormStepWrapper>
              <FormStepWrapper show={step === 7}>
                <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-[#D8E2C6] hover:bg-[#c8d2b6] text-foreground hover:scale-[1.02] transition-all duration-200"
                    onClick={() => document.getElementById('receipt-upload')?.click()}
                  >
                    <PaperclipIcon className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-[#D8E2C6] hover:bg-[#c8d2b6] text-foreground hover:scale-[1.02] transition-all duration-200"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  capture="environment"
                />
                {file && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
              </FormStepWrapper>
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(s => Math.max(s - 1, 1))}
                    className="hover:translate-y-[-1px] transition-transform duration-200"
                  >
                    Previous
                  </Button>
                )}
                {step < 7 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (canProceed()) {
                        setStep(s => Math.min(s + 1, 7));
                      } else {
                        toast({
                          title: "Required Field",
                          description: "Please fill in the required information before proceeding.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="ml-auto bg-[#D8E2C6] hover:bg-[#c8d2b6] text-foreground hover:translate-y-[-2px] hover:scale-[1.02] transition-all duration-200"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto bg-[#D8E2C6] hover:bg-[#c8d2b6] text-foreground hover:translate-y-[-2px] hover:scale-[1.02] transition-all duration-200"
                  >
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