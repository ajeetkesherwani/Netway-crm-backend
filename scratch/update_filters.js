const fs = require('fs');

// 1. Edit CustomerList.jsx
const listPath = 'C:/tekniko_frontend/Netway-Crm-Frontend/src/pages/Customer/CustomerList.jsx';
let listContent = fs.readFileSync(listPath, 'utf8');

if (!listContent.includes('connectionType: searchParams.get("connectionType")')) {
  listContent = listContent.replace(
    /startDate: searchParams\.get\("startDate"\)\s*\|\|\s*"",/,
    'startDate: searchParams.get("startDate") || "",\n    connectionType: searchParams.get("connectionType") || "",\n    installationBy: searchParams.get("installationBy") || "",'
  );
  fs.writeFileSync(listPath, listContent);
  console.log('CustomerList.jsx updated.');
} else {
  console.log('CustomerList.jsx already updated.');
}

// 2. Edit CustomerFilters.jsx
const filterPath = 'C:/tekniko_frontend/Netway-Crm-Frontend/src/pages/Customer/components/CustomerFilters.jsx';
let filterContent = fs.readFileSync(filterPath, 'utf8');

if (!filterContent.includes('Connection Type')) {
  const replacement = `        {/* Connection Type */}
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
  
  filterContent = filterContent.replace(/\{\/\*\s*Start Date\s*\*\/\}/, replacement);
  fs.writeFileSync(filterPath, filterContent);
  console.log('CustomerFilters.jsx updated.');
} else {
  console.log('CustomerFilters.jsx already updated.');
}
