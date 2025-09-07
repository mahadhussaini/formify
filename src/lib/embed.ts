import { Form } from '@/types/form'

export function generateEmbedCode(form: Form, options: {
  width?: string
  height?: string
  showHeader?: boolean
} = {}) {
  const {
    width = '100%',
    height = '600px',
    showHeader = false
  } = options

  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${form.id}`

  return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  title="${form.title}"
></iframe>`
}

export function generateEmbedScript(form: Form) {
  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${form.id}`

  return `<div id="formify-embed-${form.id}"></div>
<script>
  (function() {
    const container = document.getElementById('formify-embed-${form.id}');
    const iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '100%';
    iframe.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    iframe.title = '${form.title}';
    container.appendChild(iframe);
  })();
</script>`
}

export function generateReactComponent(form: Form) {
  return `import React from 'react';
import { FormRenderer } from 'formify-react';

const ${form.title.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}Form = () => {
  const formConfig = ${JSON.stringify(form, null, 2)};

  const handleSubmit = async (data) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <FormRenderer
      form={formConfig}
      onSubmit={handleSubmit}
    />
  );
};

export default ${form.title.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}Form;`
}

export function generateHTMLForm(form: Form) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${form.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            background: #f8fafc;
        }
        .form-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .form-field {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
        }
        input, select, textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 1rem;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        button {
            background: ${form.settings.theme.primaryColor || '#3b82f6'};
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            opacity: 0.9;
        }
        .required::after {
            content: ' *';
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>${form.title}</h1>
        ${form.description ? `<p>${form.description}</p>` : ''}

        <form action="#" method="POST">
`

  form.fields.forEach(field => {
    html += `            <div class="form-field">
                <label${field.required ? ' class="required"' : ''} for="${field.name}">${field.label}</label>`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
      case 'phone':
        html += `                <input type="${field.type}" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}${field.properties.maxLength ? ` maxlength="${field.properties.maxLength}"` : ''}>`
        break
      case 'number':
        html += `                <input type="number" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}${field.properties.min !== undefined ? ` min="${field.properties.min}"` : ''}${field.properties.max !== undefined ? ` max="${field.properties.max}"` : ''}${field.properties.step ? ` step="${field.properties.step}"` : ''}>`
        break
      case 'textarea':
        html += `                <textarea id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}${field.properties.rows ? ` rows="${field.properties.rows}"` : ''}></textarea>`
        break
      case 'select':
        html += `                <select id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>
                    <option value="">${field.placeholder || 'Select an option'}</option>`
        field.options?.forEach(option => {
          html += `                    <option value="${option.value}">${option.label}</option>`
        })
        html += `                </select>`
        break
      case 'radio':
        field.options?.forEach(option => {
          html += `                <label><input type="radio" name="${field.name}" value="${option.value}"${field.required ? ' required' : ''}> ${option.label}</label><br>`
        })
        break
      case 'checkbox':
        if (field.options && field.options.length > 1) {
          field.options.forEach(option => {
            html += `                <label><input type="checkbox" name="${field.name}[]" value="${option.value}"> ${option.label}</label><br>`
          })
        } else {
          html += `                <label><input type="checkbox" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}> ${field.label}</label>`
        }
        break
      case 'date':
      case 'time':
      case 'datetime-local':
        html += `                <input type="${field.type}" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`
        break
      case 'file':
        html += `                <input type="file" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}${field.properties.accept ? ` accept="${field.properties.accept}"` : ''}${field.properties.multiple ? ' multiple' : ''}>`
        break
      case 'range':
        html += `                <input type="range" id="${field.name}" name="${field.name}"${field.properties.min !== undefined ? ` min="${field.properties.min}"` : ''}${field.properties.max !== undefined ? ` max="${field.properties.max}"` : ''}${field.properties.step ? ` step="${field.properties.step}"` : ''}>`
        break
      case 'color':
        html += `                <input type="color" id="${field.name}" name="${field.name}"${field.required ? ' required' : ''}>`
        break
    }

    html += `
            </div>
`
  })

  html += `            <button type="submit">${form.settings.submitButtonText}</button>
        </form>
    </div>
</body>
</html>`

  return html
}
