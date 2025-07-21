import type { PtwFormValues } from "./schema";

export const regionCircleMap = {
  'North': ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'UP East', 'UP West'],
  'South': ['Kerala', 'Tamil Nadu', 'Karnataka', 'APTL', 'RoTN', 'Telangana', 'Chennai'],
  'East': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam', 'CG', 'NESA'],
  'West': ['Maharashtra', 'Gujarat', 'Rajasthan', 'MP', 'Goa', 'Mumbai']
};

export const approverEmails = [
  "ishwarl.anjana@rvsolutions.in",
  "ashish.kumar.mishra@rvsolutions.in",
  "sourabh.mulchandani@rvsolutions.in",
  "vikash.kumar01@rvsolutions.in",
  "abhishek.podder@rvsolutions.in",
  "rakesh.kumar.behera@rvsolutions.in",
  "devendrak.dravid@rvsolutions.in",
  "amitk.verma@rvsolutions.in",
  "nagesha.s@rvsolutions.in",
  "nagaraj@rvsolutions.in",
  "chakkaravarthi.j@rvsolutions.in",
  "prasad.c.k@rvsolutions.in",
  "harpinder.singh@rvsolutions.in",
  "anil.kumar07@rvsolutions.in",
  "chinmyak.pati@rvsolutions.in",
  "shailendra.singh@rvsolutions.in",
  "sandeep.a@rvsolutions.in",
  "rajesh.kanna@rvsolutions.in",
  "nirakar.pati@rvsolutions.in",
  "hrishikeshm.baskar@rvsolutions.in"
];

export const workTypes = [
  { id: "Work at Height", label: "Work at Height" },
  { id: "Unprotected Roof", label: "Unprotected Roof" },
  { id: "Parapet Wall", label: "Parapet Wall" },
  { id: "Electrical Work", label: "Electrical Work" },
  { id: "Night Work", label: "Night Work" },
  { id: "Other", label: "Other" },
];

export const toolboxTalks = [
    { id: 'Site Hazards', label: 'Site Hazards' },
    { id: 'Emergency Procedures', label: 'Emergency Procedures' },
    { id: 'PPE Usage', label: 'Correct PPE Usage' },
    { id: 'Tool Safety', label: 'Hand & Power Tool Safety' },
    { id: 'Fire Safety', label: 'Fire Safety' },
    { id: 'First Aid', label: 'First Aid Location' },
];

export type PermitStatus = "Pending" | "Approved" | "Rejected" | "Resubmitted";

export interface Permit {
    id: string;
    trackingId: string;
    status: PermitStatus;
    data: PtwFormValues;
    rejectionRemarks?: string;
    aiSuggestions?: string;
    approvalToken: string;
    createdAt: Date;
    updatedAt: Date;
}
