import { useState, useEffect } from "react";
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

export default function ExpenseForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  // Debug logging for form state
  useEffect(() => {
    console.log('Current step:', step);
  }, [step]);

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

  // Debug logging for form values
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field changed:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const { mutate } = useMutation({
    mutationFn: async (data: any) => {
      try {
        if (file) {
          data.receiptUrl = URL.createObjectURL(file);
        }
        const res = await apiRequest("POST", "/api/expenses", data);
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
      form.reset();
      setFile(null);
      setStep(1);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form submission data:', data);
    mutate(data);
  };

  const canProceed = () => {
    try {
      const values = form.watch();
      console.log('Checking form values:', values);

      switch (step) {
        case 1:
          return !!values.user;
        case 2:
          return !!values.category;
        case 3:
          return !!values.subCategory;
        case 4:
          return true; // Optional step
        case 5:
          const amount = values.amount;
          const isValid = !!amount && !isNaN(parseFloat(amount));
          console.log('Amount validation:', { amount, isValid });
          return isValid;
        case 6:
          return !!values.date;
        case 7:
          return true; // Optional step
        default:
          return false;
      }
    } catch (error) {
      console.error('Error in canProceed:', error);
      return false;
    }
  };

  const nextStep = () => {
    try {
      if (canProceed()) {
        setStep((s) => Math.min(s + 1, 7));
      } else {
        toast({
          title: "Required Field",
          description: "Please fill in the required information before proceeding.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    } catch (error) {
      console.error('Error in file upload:', error);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#D8E2C6] bg-gradient-radial from-[#D8E2C6] to-[#F0E5D4] p-4">
      <Card className="max-w-lg mx-auto bg-[#F0E5D4] rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.05)] transform hover:scale-[1.02] transition-all duration-300">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProgressBar currentStep={step} totalSteps={7} />

              <FormStepWrapper show={step === 1}>
                <h2 className="text-2xl font-bold mb-4">Expense Tracker</h2>
                <p className="text-gray-600 mb-6">Way to go! Let's build some healthy financial habits 💪🏼</p>
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                <h2 className="text-xl font-semibold mb-4">Select an Expense Category:</h2>
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
                        disabled={!form.watch("category")}
                      >
                        <SelectTrigger className="focus:scale-105 transition-transform duration-200">
                          <SelectValue placeholder="Select Sub-Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {form.watch("category") &&
                            categories[form.watch("category") as keyof typeof categories]?.map((sub) => (
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
                        type="text"
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
                <h2 className="text-xl font-semibold mb-4">Enter amount in CAD</h2>
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
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
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
                    Upload a File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-[#D8E2C6] hover:bg-[#c8d2b6] text-foreground hover:scale-[1.02] transition-all duration-200"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take a Photo
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
              </FormStepWrapper>

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={prevStep}
                    className="hover:translate-y-[-1px] transition-transform duration-200"
                  >
                    Previous
                  </Button>
                )}
                {step < 7 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
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