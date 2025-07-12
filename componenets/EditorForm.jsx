import React from 'react';
import { fields } from '../config/fields';

export default function EditorForm({ formData, setFormData, onSave }) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>{field.label}</label>

          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'markdown' ? (
            <textarea
              rows="10"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: '100%' }}
            />
          ) : (
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: '100%' }}
            />
          )}
        </div>
      ))}

      <button type="submit">Save</button>
    </form>
  );
}
