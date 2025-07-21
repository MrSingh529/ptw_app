// 'use server';

/**
 * @fileOverview Analyzes rejection remarks from an approver and suggests corrections to the original form.
 *
 * - analyzeRejectionRemarks - A function that handles the analysis of rejection remarks and suggests corrections.
 * - AnalyzeRejectionRemarksInput - The input type for the analyzeRejectionRemarks function.
 * - AnalyzeRejectionRemarksOutput - The return type for the analyzeRejectionRemarks function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRejectionRemarksInputSchema = z.object({
  formDetails: z.string().describe('The complete details of the permit-to-work form submission, including all fields and their values.'),
  rejectionRemarks: z.string().describe('The remarks provided by the approver upon rejecting the permit-to-work application.'),
});
export type AnalyzeRejectionRemarksInput = z.infer<typeof AnalyzeRejectionRemarksInputSchema>;

const AnalyzeRejectionRemarksOutputSchema = z.object({
  suggestedCorrections: z
    .string()
    .describe(
      'A list of specific corrections to the original form, based on the rejection remarks.  Provide actionable advice to the user.'
    ),
});
export type AnalyzeRejectionRemarksOutput = z.infer<typeof AnalyzeRejectionRemarksOutputSchema>;

export async function analyzeRejectionRemarks(
  input: AnalyzeRejectionRemarksInput
): Promise<AnalyzeRejectionRemarksOutput> {
  return analyzeRejectionRemarksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRejectionRemarksPrompt',
  input: {schema: AnalyzeRejectionRemarksInputSchema},
  output: {schema: AnalyzeRejectionRemarksOutputSchema},
  prompt: `You are an AI assistant that analyzes rejection remarks for permit-to-work applications and suggests specific corrections to the original form.

  Based on the form details and rejection remarks provided, identify the areas of the form that need improvement and suggest actionable corrections.

  Form Details:
  {{formDetails}}

  Rejection Remarks:
  {{rejectionRemarks}}

  Suggested Corrections: Provide a detailed list of suggested corrections to improve the chances of approval upon resubmission.
  Be direct and concise. Focus on actionable steps the user can take to improve their form. Give reasons.
  Consider both English and Hindi speakers. If possible provide the advice in both languages.
`,
});

const analyzeRejectionRemarksFlow = ai.defineFlow(
  {
    name: 'analyzeRejectionRemarksFlow',
    inputSchema: AnalyzeRejectionRemarksInputSchema,
    outputSchema: AnalyzeRejectionRemarksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
