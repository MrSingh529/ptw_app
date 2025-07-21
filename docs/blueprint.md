# **App Name**: Surbक्षा PTW

## Core Features:

- Enhanced Bilingual PTW Form: Custom form with fields for Requester Company Name, Site Name/Location, Team Member Details (Name + FARM/ToCli No.), Types of Work (Work at Height, Unprotected Roof, Parapet Wall, Electrical Work, Night Work, Other), Risk Assessment, PPE & Tools Confirmation, Tool-Box Talk & Site Safety checklist, File Uploads (photos of PPE, team, certifications, site conditions) localized into English and Hindi.
- Expanded Form Validation: Real-time validation to check Region and Circle against a pre-defined mapping; Contact Number length between 10-12 digits; ensure 'Other' work descriptions are provided; disallow past dates for permission; ensure requester and approver emails are distinct; enforce 'Other (specify)' text when 'Other' work is checked; require at least one Team Member detail if any work is selected; require at least one Tool-Box Talk item is checked. Reject immediately with remarks email if Risk Assessment = 'I do not confirm'; block submit and prompt user to confirm uploaded pictures if PPE Confirmation = 'Not confirmed'.
- Tracking ID Generation: Automatically generate and assign a unique tracking ID (PTW/RV/{SiteID}/{FinancialYear}) upon form submission.
- Approval Email Notifications: Trigger email to approver (dropdown with pre-defined manager emails) with embedded Approve/Reject links, along with the full details of the form.
- Approval Interface: Provide approvers with an interface to approve or reject requests with mandatory remarks on rejection. Translate remarks into both languages.
- Automated Notifications: Automatically send confirmation emails to users with submission details, tracking link, and status updates based on approval decisions, localized to English and Hindi.
- AI-Driven Error Insights: Upon receiving remarks from an approver upon rejection, an LLM-powered tool analyzes the comments and intelligently suggests corrections to the original form to promote future approvals (e.g. “You missed uploading PPE photo—please upload next time”).
- Final Approval PDF: Include a PDF-styled summary of the permit (auto-generated via headless browser or HTML-to-PDF library) in the final approval email.
- Admin Dashboard: Admin dashboard with a summary view of all 'in progress' permits, filterable by region/circle/status.
- Reminders: Auto-email the approver a reminder if a permit stays 'in progress' > 24 hours.
- Analytics: Charts of monthly permit counts, rejections vs approvals, top work types.

## Style Guidelines:

- Primary color: HSL(50, 80%, 50%) to RGB(#F0B22A) for a vibrant and accessible feel.
- Background color: HSL(50, 20%, 95%) to RGB(#FDF8F0) to create a clean, uncluttered base.
- Accent color: HSL(20, 80%, 50%) to RGB(#F0622A) for high-visibility elements like CTAs.
- Headline font: 'Space Grotesk' (sans-serif) for bold headings; body font: 'Inter' (sans-serif) for clear, readable text.
- Use clear, understandable icons sourced from a standard library (e.g., Material Design Icons) to represent different form fields and actions.
- Design a responsive layout adaptable to various screen sizes, ensuring key actions are always visible and accessible.
- Use subtle transitions and animations for form interactions and status updates to provide clear visual feedback to users.