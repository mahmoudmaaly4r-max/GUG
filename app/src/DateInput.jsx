import React from "react";

// Native date pickers can report edits through input before committing change.
// Keep the controlled value in sync with both event paths.
export default function DateInput({ onChange, ...props }) {
  return <input {...props} type="date" onInput={onChange} onChange={onChange} />;
}
