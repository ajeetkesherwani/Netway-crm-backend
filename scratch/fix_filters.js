const fs = require('fs');

const filterPath = 'C:/tekniko_frontend/Netway-Crm-Frontend/src/pages/Customer/components/CustomerFilters.jsx';
let content = fs.readFileSync(filterPath, 'utf8');

// The incorrect insertion we made (including the comment we replaced)
const badInsertion = `        {/* Connection Type */}
        <input
          placeholder="Connection Type"
          value={filters.connectionType || ""}
          onChange={(e) => updateParam("connectionType", e.target.value)}
          className="border p-1 rounded"
        />

        {/* Installation By */}
        <input
          placeholder="Installation By"
          value={filters.installationBy || ""}
          onChange={(e) => updateParam("installationBy", e.target.value)}
          className="border p-1 rounded"
        />

        {/* Start Date */}`;

// First, revert the bad insertion at the top (which replaced the commented out {/* Start Date */})
content = content.replace(badInsertion, `//       {/* Start Date */}`);

// Then, insert it in the correct spot inside the component.
// We'll look for the actual Start Date component block inside the return statement.
// The actual component uses <DatePicker, but we can look for the non-commented {/* Start Date */}
const correctReplacementTarget = `        {/* Start Date */}`;
// Since we restored the top comment to `//       {/* Start Date */}`, the actual one should be the only `{/* Start Date */}` left that isn't prefixed by `//`
// Let's replace the last occurrence of `{/* Start Date */}`
const lastIndex = content.lastIndexOf('{/* Start Date */}');
if (lastIndex !== -1) {
  content = content.substring(0, lastIndex) + badInsertion + content.substring(lastIndex + '{/* Start Date */}'.length);
}

fs.writeFileSync(filterPath, content);
console.log('Fixed CustomerFilters.jsx');
