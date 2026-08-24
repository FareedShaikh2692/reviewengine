export type TemplateVars = {
  customer_name: string;
  business_name: string;
  review_link: string;
  [key: string]: string;
};

export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}

export const DEFAULT_REQUEST_TEMPLATE = `Hi {{customer_name}},

Thank you for choosing {{business_name}}.

We'd love to hear about your experience.

Share your feedback here:
{{review_link}}

Thank you!
{{business_name}}`;

export const DEFAULT_REMINDER_TEMPLATE = `Hi {{customer_name}},

Just a quick reminder — we'd really appreciate a moment of your time to share feedback about your recent experience with {{business_name}}.

{{review_link}}

Thank you!`;
