
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { CalendarIcon, Loader2, PlusCircle, Trash2, Check, ChevronsUpDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { regionCircleMap, approverEmails, workTypes, toolboxTalks } from "@/lib/constants";
import { resubmitPermit, submitPermit } from "@/app/actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


// Client-side schema with File validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z.any()
    .refine((file) => file instanceof File && file.size > 0, "File is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), ".jpg, .jpeg, .png and .webp files are accepted.");

const clientPtwSchema = z.object({
    requesterCompany: z.string().min(1, "Company name is required."),
    siteName: z.string().min(1, "Site name is required."),
    siteId: z.string().min(1, "Site ID is required."),
    region: z.string({ required_error: "Region is required." }),
    circle: z.string({ required_error: "Circle is required." }),
    teamMembers: z.array(z.object({
        name: z.string().min(1, "Team member name is required."),
        farmOrToclip: z.string().min(1, "FARM/ToCli No. is required."),
    })).min(1, "At least one team member is required."),
    workTypes: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one work type.",
    }),
    otherWorkDescription: z.string().optional(),
    riskAssessment: z.enum(["I confirm", "I do not confirm"]),
    ppeConfirmation: z.enum(["Confirmed", "Not confirmed"]),
    toolBoxTalks: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one tool-box talk item.",
    }),
    uploadedFiles: z.object({
        ppe: fileSchema,
        team: fileSchema,
        certifications: fileSchema,
        siteConditions: fileSchema,
    }),
    permissionDate: z.date({ required_error: "A permission date is required." }),
    requesterEmail: z.string().email("Invalid email address."),
    approverEmail: z.string().email("Invalid email address.").min(1, "Approver email is required."),
    contactNumber: z.string().min(10, "Contact number must be at least 10 digits.").max(13, "Contact number must be at most 13 digits."),
    declaration: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.workTypes.includes('Other') && !data.otherWorkDescription?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherWorkDescription'],
            message: 'Description for "Other" work type is required.',
        });
    }
    if (data.requesterEmail.toLowerCase() === data.approverEmail.toLowerCase()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['approverEmail'],
            message: 'Approver email cannot be the same as the requester email.',
        });
    }
    if (!data.declaration) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['declaration'],
            message: 'You must accept the declaration.',
        });
    }
});


type ClientPtwFormValues = z.infer<typeof clientPtwSchema>;


export function PtwForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isResubmission, setIsResubmission] = useState(false);
  const [originalTrackingId, setOriginalTrackingId] = useState<string | null>(null);

  const form = useForm<ClientPtwFormValues>({
    resolver: zodResolver(clientPtwSchema),
    defaultValues: {
      requesterCompany: "",
      siteName: "",
      siteId: "",
      teamMembers: [{ name: "", farmOrToclip: "" }],
      workTypes: [],
      otherWorkDescription: "",
      riskAssessment: "I confirm",
      ppeConfirmation: "Confirmed",
      toolBoxTalks: [],
      uploadedFiles: {
        ppe: undefined,
        team: undefined,
        certifications: undefined,
        siteConditions: undefined,
      },
      approverEmail: "",
      requesterEmail: "",
      contactNumber: "",
      permissionDate: new Date(),
      declaration: false,
    },
    mode: "onBlur"
  });

  useEffect(() => {
    const resubmitId = searchParams.get("resubmit");
    if (resubmitId) {
      try {
        setIsResubmission(true);
        setOriginalTrackingId(resubmitId);
        
        const valuesToPopulate: { [key: string]: any } = {};
        searchParams.forEach((value, key) => {
            if (key !== 'resubmit' && value) {
                valuesToPopulate[key] = value;
            }
        });

        if (valuesToPopulate.teamMembers && typeof valuesToPopulate.teamMembers === 'string') {
           try {
              valuesToPopulate.teamMembers = JSON.parse(valuesToPopulate.teamMembers);
           } catch {
             valuesToPopulate.teamMembers = [{ name: "", farmOrToclip: "" }];
           }
        } else {
             valuesToPopulate.teamMembers = [{ name: "", farmOrToclip: "" }];
        }

        if (valuesToPopulate.workTypes && typeof valuesToPopulate.workTypes === 'string') {
          valuesToPopulate.workTypes = valuesToPopulate.workTypes.split(',');
        }
        if (valuesToPopulate.toolBoxTalks && typeof valuesToPopulate.toolBoxTalks === 'string') {
          valuesToPopulate.toolBoxTalks = valuesToPopulate.toolBoxTalks.split(',');
        }
        if (valuesToPopulate.permissionDate && typeof valuesToPopulate.permissionDate === 'string') {
          const date = new Date(valuesToPopulate.permissionDate);
          if (!isNaN(date.getTime())) {
            valuesToPopulate.permissionDate = date;
          } else {
             valuesToPopulate.permissionDate = new Date();
          }
        } else {
            valuesToPopulate.permissionDate = new Date();
        }
        
        // Fix for the boolean conversion
        if (valuesToPopulate.declaration && typeof valuesToPopulate.declaration === 'string') {
          valuesToPopulate.declaration = valuesToPopulate.declaration.toLowerCase() === 'true';
        }

        form.reset(valuesToPopulate as Partial<ClientPtwFormValues>);
        
      } catch (error) {
        console.error("Failed to parse resubmission data from URL:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Data",
          description: "Could not load data for resubmission. Please fill out the form manually.",
        });
      }
    }
  }, [searchParams, form, toast]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  const selectedRegion = form.watch("region");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ClientPtwFormValues['uploadedFiles']) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue(`uploadedFiles.${fieldName}`, e.target.files[0], { shouldValidate: true });
    }
  };

  async function onSubmit(data: ClientPtwFormValues) {
    if (data.riskAssessment === 'I do not confirm') {
        toast({
            variant: "destructive",
            title: "Submission Blocked",
            description: "You must confirm the risk assessment to submit a permit.",
        });
        return;
    }

    if (data.ppeConfirmation === 'Not confirmed') {
        toast({
            variant: "destructive",
            title: "Submission Blocked",
            description: "Please confirm that all PPE and tools are available and upload the required pictures.",
        });
        return;
    }

    startTransition(async () => {
        const formData = new FormData();
        
        const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedPpe = await imageCompression(data.uploadedFiles.ppe, compressionOptions);
            const compressedTeam = await imageCompression(data.uploadedFiles.team, compressionOptions);
            const compressedCerts = await imageCompression(data.uploadedFiles.certifications, compressionOptions);
            const compressedSite = await imageCompression(data.uploadedFiles.siteConditions, compressionOptions);

            formData.append('uploadedFiles.ppe', compressedPpe, data.uploadedFiles.ppe.name);
            formData.append('uploadedFiles.team', compressedTeam, data.uploadedFiles.team.name);
            formData.append('uploadedFiles.certifications', compressedCerts, data.uploadedFiles.certifications.name);
            formData.append('uploadedFiles.siteConditions', compressedSite, data.uploadedFiles.siteConditions.name);

            Object.entries(data).forEach(([key, value]) => {
                if (key === 'teamMembers') {
                    formData.append(key, JSON.stringify(value));
                } else if (key === 'permissionDate' && value instanceof Date) {
                     formData.append(key, value.toISOString());
                } else if (key !== 'uploadedFiles' && !Array.isArray(value)) {
                    formData.append(key, String(value));
                }
            });

            data.workTypes.forEach(wt => formData.append('workTypes', wt));
            data.toolBoxTalks.forEach(tt => formData.append('toolBoxTalks', tt));
          
            if (isResubmission && originalTrackingId) {
                formData.append('originalTrackingId', originalTrackingId);
            }

            const result = isResubmission 
                ? await resubmitPermit(formData)
                : await submitPermit(formData);

            if (result.success && result.trackingId) {
                toast({
                    title: "Permit Submitted",
                    description: `Your tracking ID is ${result.trackingId}. An approval request has been sent.`,
                });
                
                router.push(`/submitted/${encodeURIComponent(result.trackingId)}`);

            } else {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: result.error || "An unknown error occurred.",
                    duration: 9000,
                });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Image Compression Failed",
                description: "Could not compress images. Please try again with smaller files.",
                duration: 9000,
            });
            console.error('Compression error:', error);
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isResubmission && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Resubmitting Permit / परमिट पुनः सबमिट करना</AlertTitle>
                <AlertDescription>
                    You are editing a previously rejected permit (ID: {originalTrackingId}). Please review all fields, make the necessary corrections, and resubmit for approval. Note that you must re-upload files.
                    <br />
                    आप पहले अस्वीकृत परमिट (आईडी: {originalTrackingId}) को संपादित कर रहे हैं। कृपया सभी फ़ील्ड की समीक्षा करें, आवश्यक सुधार करें, और अनुमोदन के लिए पुनः सबमिट करें। ध्यान दें कि आपको फ़ाइलें फिर से अपलोड करनी होंगी।
                </AlertDescription>
            </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Site & Contact Information / साइट और संपर्क जानकारी</CardTitle>
            <CardDescription>
              Provide details about the work site and your contact information.
              <br />
              कार्य स्थल और अपनी संपर्क जानकारी के बारे में विवरण प्रदान करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requesterCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requester Company Name / अनुरोधकर्ता कंपनी का नाम</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., RV Solutions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name/Location / साइट का नाम/स्थान</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sector 5, Noida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site ID / साइट आईडी</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DL1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Permission Date / अनुमति की तारीख</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date || new Date())}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region / क्षेत्र</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(regionCircleMap).map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="circle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circle / सर्कल</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegion}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a circle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedRegion && regionCircleMap[selectedRegion as keyof typeof regionCircleMap]?.map((circle) => (
                          <SelectItem key={circle} value={circle}>{circle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requesterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email / आपका ईमेल</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number / संपर्क नंबर</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="approverEmail"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Approver Email / अनुमोदक का ईमेल</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? approverEmails.find(
                                (email) => email === field.value
                              )
                            : "Select an approver"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search approver email..." />
                        <CommandEmpty>No approver found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {approverEmails.map((email) => (
                              <CommandItem
                                value={email}
                                key={email}
                                onSelect={() => {
                                  form.setValue("approverEmail", email);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    email === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team & Work Details / टीम और कार्य विवरण</CardTitle>
            <CardDescription>
              List team members and describe the work to be performed.
              <br />
              टीम के सदस्यों की सूची बनाएं और किए जाने वाले कार्य का वर्णन करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>Team Member Details / टीम के सदस्य का विवरण</FormLabel>
              <div className="mt-2 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder={`Team Member ${index + 1} Name`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.farmOrToclip`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                             <Input {...field} placeholder="FARM/ToCli No." />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: "", farmOrToclip: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member / सदस्य जोड़ें
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="workTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Types of Work / कार्य के प्रकार</FormLabel>
                    <FormDescription>
                      Select all applicable work types.
                       <br />
                       सभी लागू कार्य प्रकार चुनें।
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workTypes.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="workTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('workTypes')?.includes('Other') && (
              <FormField
                control={form.control}
                name="otherWorkDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Work Description (Specify) / अन्य कार्य विवरण (निर्दिष्ट करें)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the other work here." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Safety & Compliance / सुरक्षा और अनुपालन</CardTitle>
                <CardDescription>
                Confirm safety checks and upload necessary documents.
                <br />
                सुरक्षा जांच की पुष्टि करें और आवश्यक दस्तावेज़ अपलोड करें।
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="riskAssessment"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>Risk Assessment / जोखिम मूल्यांकन</FormLabel>
                        <FormControl>
                        <p className="text-sm text-muted-foreground">
                            I confirm that I have performed a risk assessment for the work to be undertaken.
                            <br />
                            मैं पुष्टि करता हूं कि मैंने किए जाने वाले कार्य के लिए जोखिम मूल्यांकन किया है।
                        </p>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ppeConfirmation"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel>PPE & Tools Confirmation / पीपीई और उपकरण की पुष्टि</FormLabel>
                         <FormControl>
                        <p className="text-sm text-muted-foreground">
                            I confirm that all team members are equipped with the necessary PPE and tools.
                            <br />
                            मैं पुष्टि करता हूं कि सभी टीम सदस्य आवश्यक पीपीई और उपकरणों से लैस हैं।
                        </p>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="toolBoxTalks"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Tool-Box Talk & Site Safety Checklist / टूल-बॉक्स टॉक और साइट सुरक्षा चेकलिस्ट</FormLabel>
                        <FormDescription>
                          Confirm all safety topics were discussed.
                          <br />
                          पुष्टि करें कि सभी सुरक्षा विषयों पर चर्चा की गई थी।
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {toolboxTalks.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="toolBoxTalks"
                          render={({ field }) => {
                            return (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 
                <div>
                    <FormLabel>File Uploads / फ़ाइल अपलोड</FormLabel>
                    <FormDescription>
                        Upload photos of PPE, team, certifications, and site conditions. Max 5MB per file (will be compressed).
                        <br />
                        पीपीई, टीम, प्रमाणपत्र, और साइट की स्थितियों की तस्वीरें अपलोड करें। प्रति फ़ाइल अधिकतम 5MB (संपीड़ित किया जाएगा)।
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField control={form.control} name="uploadedFiles.ppe" render={() => <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">PPE Photo / पीपीई फोटो</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'ppe')} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="uploadedFiles.team" render={() => <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Team Photo / टीम फोटो</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'team')} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="uploadedFiles.certifications" render={() => <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Certifications / प्रमाणपत्र</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'certifications')} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="uploadedFiles.siteConditions" render={() => <FormItem><FormLabel className="text-sm font-normal text-muted-foreground">Site Photo / साइट फोटो</FormLabel><FormControl><Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'siteConditions')} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                </div>

            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Declaration / घोषणा</CardTitle>
            </CardHeader>
            <CardContent>
                 <FormField
                  control={form.control}
                  name="declaration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I hereby declare that the information provided is true and correct to the best of my knowledge.
                          <br />
                          मैं एतद्द्वारा घोषणा करता हूं कि प्रदान की गई जानकारी मेरी सर्वोत्तम जानकारी के अनुसार सत्य और सही है।
                        </FormLabel>
                        <FormMessage/>
                      </div>
                    </FormItem>
                  )}
                />
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isResubmission ? "Resubmit for Approval / अनुमोदन के लिए पुनः सबमिट करें" : "Submit for Approval / अनुमोदन के लिए सबमिट करें"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
