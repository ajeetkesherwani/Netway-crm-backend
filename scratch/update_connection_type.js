const fs = require('fs');

const filterPath = 'C:/tekniko_frontend/Netway-Crm-Frontend/src/pages/Customer/components/CustomerFilters.jsx';
let filterContent = fs.readFileSync(filterPath, 'utf8');

const oldInput = `{/* Connection Type */}
        <input
          placeholder="Connection Type"
          value={filters.connectionType || ""}
          onChange={(e) => updateParam("connectionType", e.target.value)}
          className="border p-1 rounded"
        />`;

const newSelect = `{/* Connection Type */}
        <select
          value={filters.connectionType || ""}
          onChange={(e) => updateParam("connectionType", e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">Select Connection Type</option>
          <option value="ill">ILL</option>
          <option value="ftth">FTTH</option>
          <option value="rf">RF</option>
          <option value="other">Other</option>
        </select>`;

if (filterContent.includes('<input\n          placeholder="Connection Type"')) {
  filterContent = filterContent.replace(oldInput, newSelect);
  fs.writeFileSync(filterPath, filterContent);
  console.log('CustomerFilters.jsx updated to use dropdown for Connection Type.');
} else {
  console.log('Could not find the Connection Type input. It might already be updated.');
}
